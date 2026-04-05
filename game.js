(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const moneyEl = document.getElementById("moneyVal");
  const plantCountEl = document.getElementById("plantCount");
  const enemyCountEl = document.getElementById("enemyCount");
  const plantSlotsEl = document.getElementById("plantSlots");
  const enemySlotsEl = document.getElementById("enemySlots");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const toast = document.getElementById("toast");
  const shopModal = document.getElementById("shopModal");
  const sellModal = document.getElementById("sellModal");
  const btnBuy = document.getElementById("btnBuy");
  const btnBuyFern = document.getElementById("btnBuyFern");
  const btnClose = document.getElementById("btnClose");
  const btnSellSelected = document.getElementById("btnSellSelected");
  const btnSellOne = document.getElementById("btnSellOne");
  const btnSellAll = document.getElementById("btnSellAll");
  const btnCloseSell = document.getElementById("btnCloseSell");
  const btnCloseBackpack = document.getElementById("btnCloseBackpack");
  const settingsModal = document.getElementById("settingsModal");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const btnWipeProgress = document.getElementById("btnWipeProgress");
  const codeInput = document.getElementById("codeInput");
  const btnRedeemCode = document.getElementById("btnRedeemCode");
  const sellRavenPriceEl = document.getElementById("sellRavenPrice");

  const PLANT_SLOTS = 10;
  const ENEMY_SLOTS = 100;
  const SAVE_KEY = "plantsVsEverythingSaveV1";
  const REDEMPTION_CODES_KEY = "plantsVsEverythingRedeemedCodes";
  /** 區分大小寫；兌換後取得限定烏鴉 */
  const CODE_REWARD_RAVEN = "R4v3np31t";
  const SAVE_INTERVAL_SEC = 2;

  const ROWS = 7;
  const COLS = 7;
  const CELL = 56;
  const GRID_X = 280;
  const GRID_Y = 140;
  const STRAWBERRY_COST = 20;
  const FERN_COST = 50;
  const GROW_TIME = 5;
  const FERN_DPS = 2;
  /** 蕨類近戰：同欄、在植株前方（靠生成端）的距離內 */
  const FERN_MELEE_RANGE = 72;
  const SPAWN_INTERVAL = 7;
  const BEE_HP = 3;
  const BUTTERFLY_HP = 5;
  const BEE_DOLLAR_PER_SEC = 1;
  const BUTTERFLY_DOLLAR_PER_SEC = 2;
  const SHOOT_INTERVAL = 1;
  const PROJ_SPEED = 280;
  const PROJ_HIT_R = 14;
  const SELL_BEE_PRICE = 8;
  const SELL_BUTTERFLY_PRICE = 15;
  const RAVEN_HP = 20;
  const RAVEN_DOLLAR_PER_SEC = 10;
  const RAVEN_SPEED = 32;
  const SELL_RAVEN_PRICE = 80;

  /** 蝴蝶 1/3：權重 bee:butterfly = 2:1 */
  const MOB_SPAWN_WEIGHTS = [
    { type: "bee", weight: 2 },
    { type: "butterfly", weight: 1 },
  ];

  /** 灰格 1 免費；格 2～10 對應 index 1～9 */
  const GRAY_SLOT_UNLOCK_PRICE = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 30000];

  /** 中央道（欄 3）免費；其餘六道由中往外：左 300/600/1200，右 2400/4800/9600 */
  const LANE_UNLOCK_PRICE = [300, 600, 1200, 0, 2400, 4800, 9600];

  const shopRect = { x: 40, y: 220, w: 100, h: 140 };
  const sellShopRect = { x: 780, y: 220, w: 100, h: 140 };
  const spawnerRect = {
    x: GRID_X + 4,
    y: GRID_Y + ROWS * CELL + 6,
    w: COLS * CELL - 8,
    h: 42,
  };

  const graySlots = [];
  const GRAY_COUNT = 10;
  const GRAY_SLOT_W = 44;
  const GRAY_GAP = 6;
  const grayRowY = GRID_Y - 72;
  const grayStartX = GRID_X + (COLS * CELL - (GRAY_COUNT * GRAY_SLOT_W + (GRAY_COUNT - 1) * GRAY_GAP)) / 2;

  for (let i = 0; i < GRAY_COUNT; i++) {
    graySlots.push({
      x: grayStartX + i * (GRAY_SLOT_W + GRAY_GAP),
      y: grayRowY,
      w: GRAY_SLOT_W,
      h: GRAY_SLOT_W,
      locked: i !== 0,
      /** @type {null | 'bee' | 'butterfly' | 'raven'} */
      worker: null,
    });
  }

  /** 僅中央綠道（欄 3）起始解鎖 */
  const laneUnlocked = [false, false, false, true, false, false, false];

  /** @type {(null | 'seed' | 'fern')[]} */
  const plantInv = new Array(PLANT_SLOTS).fill(null);
  /** @type {(null | 'bee' | 'butterfly' | 'raven')[]} */
  const enemyInv = new Array(ENEMY_SLOTS).fill(null);

  let selectedPlantSlot = -1;
  let selectedEnemySlot = -1;
  /** @type {null | 'buy' | 'sell'} */
  let activeModal = null;
  let money = 20;
  let invPanelVisible = false;

  /** 背包小圖（程式繪製快取） */
  let strawberrySeedIconDataUrl = "";
  let fernIconDataUrl = "";

  const keys = {};
  const player = {
    x: GRID_X + (COLS * CELL) / 2,
    y: GRID_Y + ROWS * CELL + 80,
    r: 14,
    speed: 180,
  };

  /** @type {{ row: number, col: number, kind: 'strawberry' | 'fern', growLeft: number, mature: boolean, shootCd: number }[]} */
  const plants = [];

  /** @type {{ x: number, y: number, hp: number, speed: number, type: 'bee' | 'butterfly' | 'raven', lane: number }[]} */
  const mobs = [];

  /** @type {{ x: number, y: number, vx: number, vy: number, dmg: number, lane: number }[]} */
  const projectiles = [];

  let spawnAcc = 0;
  let anyMaturePlant = false;
  let toastTimer = 0;
  let saveAcc = 0;

  function isValidEnemyWorker(w) {
    return w === "bee" || w === "butterfly" || w === "raven";
  }

  function loadRedeemedCodesSet() {
    try {
      const raw = localStorage.getItem(REDEMPTION_CODES_KEY);
      const a = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(a) ? a.filter((x) => typeof x === "string") : []);
    } catch (e) {
      return new Set();
    }
  }

  function persistRedeemedCodesSet(set) {
    try {
      localStorage.setItem(REDEMPTION_CODES_KEY, JSON.stringify([...set]));
    } catch (e) {
      /* 同上 */
    }
  }

  let redeemedCodes = loadRedeemedCodesSet();

  function getSavePayload() {
    return {
      v: 1,
      money,
      laneUnlocked: laneUnlocked.slice(),
      gray: graySlots.map((s) => ({ locked: !!s.locked, worker: s.worker })),
      plantInv: plantInv.slice(),
      enemyInv: enemyInv.slice(),
      plants: plants.map((p) => ({
        row: p.row,
        col: p.col,
        kind: p.kind || "strawberry",
        growLeft: p.growLeft,
        mature: p.mature,
        shootCd: p.shootCd,
      })),
      mobs: mobs.map((m) => ({
        x: m.x,
        y: m.y,
        hp: m.hp,
        speed: m.speed,
        type: m.type,
        lane: m.lane,
      })),
      projectiles: projectiles.map((pr) => ({
        x: pr.x,
        y: pr.y,
        vx: pr.vx,
        vy: pr.vy,
        dmg: pr.dmg,
        lane: pr.lane,
      })),
      player: { x: player.x, y: player.y },
      spawnAcc,
      anyMaturePlant,
    };
  }

  function applySavePayload(raw) {
    if (!raw || raw.v !== 1) return false;
    try {
      if (typeof raw.money === "number" && raw.money >= 0 && isFinite(raw.money)) money = raw.money;

      if (Array.isArray(raw.laneUnlocked) && raw.laneUnlocked.length === COLS) {
        for (let i = 0; i < COLS; i++) laneUnlocked[i] = !!raw.laneUnlocked[i];
      }

      if (Array.isArray(raw.gray) && raw.gray.length === graySlots.length) {
        raw.gray.forEach((g, i) => {
          if (!g || typeof g.locked !== "boolean") return;
          graySlots[i].locked = g.locked;
          const w = g.worker;
          graySlots[i].worker = isValidEnemyWorker(w) ? w : null;
        });
      }

      if (Array.isArray(raw.plantInv) && raw.plantInv.length === PLANT_SLOTS) {
        for (let i = 0; i < PLANT_SLOTS; i++) {
          const t = raw.plantInv[i];
          plantInv[i] = t === "seed" || t === "fern" ? t : null;
        }
      }

      if (Array.isArray(raw.enemyInv) && raw.enemyInv.length === ENEMY_SLOTS) {
        for (let i = 0; i < ENEMY_SLOTS; i++) {
          const t = raw.enemyInv[i];
          enemyInv[i] = isValidEnemyWorker(t) ? t : null;
        }
      }

      plants.length = 0;
      if (Array.isArray(raw.plants)) {
        for (const p of raw.plants) {
          if (!p || p.row < 0 || p.row >= ROWS || p.col < 0 || p.col >= COLS) continue;
          const k = p.kind === "fern" ? "fern" : "strawberry";
          plants.push({
            row: p.row | 0,
            col: p.col | 0,
            kind: k,
            growLeft: Math.max(0, Number(p.growLeft) || 0),
            mature: !!p.mature,
            shootCd: Math.max(0, Number(p.shootCd) || 0),
          });
        }
      }

      mobs.length = 0;
      if (Array.isArray(raw.mobs)) {
        for (const m of raw.mobs) {
          if (!m) continue;
          const lane = m.lane | 0;
          if (lane < 0 || lane >= COLS) continue;
          let typ;
          let spd;
          let maxHp;
          if (m.type === "raven") {
            typ = "raven";
            spd = RAVEN_SPEED;
            maxHp = RAVEN_HP;
          } else if (m.type === "butterfly") {
            typ = "butterfly";
            spd = 34;
            maxHp = BUTTERFLY_HP;
          } else {
            typ = "bee";
            spd = 40;
            maxHp = BEE_HP;
          }
          let hp = Number(m.hp);
          if (!isFinite(hp) || hp <= 0) hp = maxHp;
          if (hp > maxHp * 2) hp = maxHp;
          mobs.push({
            x: isFinite(m.x) ? m.x : laneCenterX(lane),
            y: isFinite(m.y) ? m.y : spawnerRect.y - 8,
            hp,
            speed: spd,
            type: typ,
            lane,
          });
        }
      }

      projectiles.length = 0;
      if (Array.isArray(raw.projectiles)) {
        for (const pr of raw.projectiles) {
          if (!pr) continue;
          const lane = pr.lane | 0;
          if (lane < 0 || lane >= COLS) continue;
          projectiles.push({
            x: Number(pr.x) || laneCenterX(lane),
            y: Number(pr.y) || 0,
            vx: Number(pr.vx) || 0,
            vy: isFinite(pr.vy) ? pr.vy : PROJ_SPEED,
            dmg: Math.max(1, Number(pr.dmg) || 1),
            lane,
          });
        }
      }

      if (raw.player && typeof raw.player.x === "number" && typeof raw.player.y === "number") {
        player.x = raw.player.x;
        player.y = raw.player.y;
        const margin = 24;
        player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
        player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
      }

      if (typeof raw.spawnAcc === "number" && isFinite(raw.spawnAcc)) spawnAcc = Math.max(0, raw.spawnAcc);
      anyMaturePlant = plants.some((pl) => pl.mature);
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(getSavePayload()));
    } catch (e) {
      /* 配額滿或私密模式 */
    }
  }

  function loadGame() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (!s) return;
      applySavePayload(JSON.parse(s));
    } catch (e) {
      /* 無存檔或損毀 */
    }
  }

  window.addEventListener("beforeunload", saveGame);
  window.addEventListener("pagehide", saveGame);

  function showWarning(msg) {
    toast.textContent = msg;
    toast.classList.remove("toast-success");
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function showSuccess(msg) {
    toast.textContent = msg;
    toast.classList.add("toast-success");
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.remove("toast-success");
    }, 2800);
  }

  function countPlantInv() {
    return plantInv.filter((x) => x !== null).length;
  }

  function countEnemyInv() {
    return enemyInv.filter((x) => x !== null).length;
  }

  function addPlantSeed() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("植物背包已滿（10 格）！");
      return false;
    }
    plantInv[idx] = "seed";
    refreshInvUi();
    return true;
  }

  function addPlantFern() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("植物背包已滿（10 格）！");
      return false;
    }
    plantInv[idx] = "fern";
    refreshInvUi();
    return true;
  }

  /** @param {'bee' | 'butterfly' | 'raven'} kind */
  function addEnemyToInv(kind) {
    if (!isValidEnemyWorker(kind)) return false;
    const idx = enemyInv.indexOf(null);
    if (idx === -1) {
      showWarning("敵人背包已滿（100 格）！");
      return false;
    }
    enemyInv[idx] = kind;
    refreshInvUi();
    return true;
  }

  function sellPriceFor(kind) {
    if (kind === "butterfly") return SELL_BUTTERFLY_PRICE;
    if (kind === "raven") return SELL_RAVEN_PRICE;
    return SELL_BEE_PRICE;
  }

  /** @returns {null | 'seed' | 'fern'} */
  function takePlantItemForPlanting() {
    if (selectedPlantSlot >= 0) {
      const t = plantInv[selectedPlantSlot];
      if (t === "seed" || t === "fern") {
        plantInv[selectedPlantSlot] = null;
        refreshInvUi();
        return t;
      }
    }
    let idx = plantInv.indexOf("seed");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "seed";
    }
    idx = plantInv.indexOf("fern");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "fern";
    }
    return null;
  }

  /** @returns {null | 'bee' | 'butterfly' | 'raven'} */
  function takeEnemyForWorker() {
    if (selectedEnemySlot >= 0) {
      const t = enemyInv[selectedEnemySlot];
      if (isValidEnemyWorker(t)) {
        enemyInv[selectedEnemySlot] = null;
        refreshInvUi();
        return t;
      }
    }
    for (const typ of ["bee", "butterfly", "raven"]) {
      const idx = enemyInv.indexOf(typ);
      if (idx !== -1) {
        enemyInv[idx] = null;
        refreshInvUi();
        return typ;
      }
    }
    return null;
  }

  function hasEnemyWorkerInv() {
    return enemyInv.some((x) => isValidEnemyWorker(x));
  }

  function refreshInvUi() {
    moneyEl.textContent = String(Math.floor(money * 100) / 100);
    plantCountEl.textContent = String(countPlantInv());
    enemyCountEl.textContent = String(countEnemyInv());

    const pSlots = plantSlotsEl.querySelectorAll(".inv-slot");
    pSlots.forEach((el, i) => {
      el.classList.toggle("filled", plantInv[i] !== null);
      el.classList.toggle("selected-plant", i === selectedPlantSlot);
      el.innerHTML = "";
      if (plantInv[i] === "seed") {
        const url = getStrawberrySeedIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "草莓苗";
          m.title = "草莓苗";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "苗";
          sp.style.fontSize = "14px";
          sp.style.color = "#ffcdd2";
          sp.title = "草莓苗";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "fern") {
        const url = getFernIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "蕨苗";
          m.title = "蕨類幼苗";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "蕨";
          sp.style.fontSize = "13px";
          sp.style.color = "#a5d6a7";
          sp.title = "蕨類幼苗";
          el.appendChild(sp);
        }
      }
    });

    const eSlots = enemySlotsEl.querySelectorAll(".inv-slot");
    eSlots.forEach((el, i) => {
      el.classList.toggle("filled", enemyInv[i] !== null);
      el.classList.toggle("selected-enemy", i === selectedEnemySlot);
      el.innerHTML = "";
      if (enemyInv[i] === "bee") {
        const m = document.createElement("span");
        m.className = "icon-bee";
        m.title = "蜜蜂";
        el.appendChild(m);
      } else if (enemyInv[i] === "butterfly") {
        const m = document.createElement("span");
        m.className = "icon-butterfly";
        m.title = "蝴蝶";
        el.appendChild(m);
      } else if (enemyInv[i] === "raven") {
        const m = document.createElement("span");
        m.className = "icon-raven";
        m.title = "限定烏鴉";
        el.appendChild(m);
      }
    });
  }

  function buildInvSlots() {
    plantSlotsEl.innerHTML = "";
    for (let i = 0; i < PLANT_SLOTS; i++) {
      const d = document.createElement("div");
      d.className = "inv-slot";
      d.dataset.plantIdx = String(i);
      plantSlotsEl.appendChild(d);
    }
    enemySlotsEl.innerHTML = "";
    for (let i = 0; i < ENEMY_SLOTS; i++) {
      const d = document.createElement("div");
      d.className = "inv-slot";
      d.dataset.enemyIdx = String(i);
      enemySlotsEl.appendChild(d);
    }

    plantSlotsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".inv-slot");
      if (!t || t.dataset.plantIdx === undefined) return;
      const i = Number(t.dataset.plantIdx);
      selectedPlantSlot = selectedPlantSlot === i ? -1 : i;
      refreshInvUi();
    });

    enemySlotsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".inv-slot");
      if (!t || t.dataset.enemyIdx === undefined) return;
      const i = Number(t.dataset.enemyIdx);
      selectedEnemySlot = selectedEnemySlot === i ? -1 : i;
      refreshInvUi();
    });
  }

  function cellCenter(row, col) {
    return {
      x: GRID_X + col * CELL + CELL / 2,
      y: GRID_Y + row * CELL + CELL / 2,
    };
  }

  function laneCenterX(col) {
    return GRID_X + col * CELL + CELL / 2;
  }

  function getUnlockedLaneIndices() {
    const a = [];
    for (let c = 0; c < COLS; c++) if (laneUnlocked[c]) a.push(c);
    return a;
  }

  function pickRandomOpenLane() {
    const open = getUnlockedLaneIndices();
    if (open.length === 0) return -1;
    return open[(Math.random() * open.length) | 0];
  }

  /** 該道上有敵在植株「前方」（靠生成端、螢幕下方） */
  function hasMobAheadInLane(laneCol, plantCenterY) {
    const margin = 12;
    return mobs.some((m) => m.lane === laneCol && m.y > plantCenterY - margin);
  }

  function spawnDownProjectile(laneCol, startY) {
    projectiles.push({
      x: laneCenterX(laneCol),
      y: startY,
      vx: 0,
      vy: PROJ_SPEED,
      lane: laneCol,
      dmg: 1,
    });
  }

  function gridFromPixel(px, py) {
    const col = Math.floor((px - GRID_X) / CELL);
    const row = Math.floor((py - GRID_Y) / CELL);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
    return { row, col };
  }

  function setActiveModal(mode) {
    settingsModal.classList.add("hidden");
    activeModal = mode;
    shopModal.classList.toggle("hidden", mode !== "buy");
    sellModal.classList.toggle("hidden", mode !== "sell");
  }

  function closeAllModals() {
    activeModal = null;
    shopModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    settingsModal.classList.add("hidden");
  }

  function openSettingsPanel() {
    activeModal = null;
    shopModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    settingsModal.classList.remove("hidden");
  }

  function isUiBlocking() {
    return activeModal !== null || !settingsModal.classList.contains("hidden");
  }

  function sellOneEnemyFromInv(preferSelected) {
    let idx = -1;
    if (preferSelected && selectedEnemySlot >= 0) {
      const t = enemyInv[selectedEnemySlot];
      if (isValidEnemyWorker(t)) idx = selectedEnemySlot;
    }
    if (idx === -1) {
      idx = enemyInv.findIndex((x) => isValidEnemyWorker(x));
    }
    if (idx === -1) {
      showWarning("沒有可賣出的單位！");
      return false;
    }
    const kind = enemyInv[idx];
    enemyInv[idx] = null;
    money += sellPriceFor(kind);
    refreshInvUi();
    return true;
  }

  btnBuy.addEventListener("click", () => {
    if (money < STRAWBERRY_COST) {
      closeAllModals();
      return;
    }
    if (!addPlantSeed()) {
      closeAllModals();
      return;
    }
    money -= STRAWBERRY_COST;
    refreshInvUi();
    closeAllModals();
  });

  btnBuyFern.addEventListener("click", () => {
    if (money < FERN_COST) {
      closeAllModals();
      return;
    }
    if (!addPlantFern()) {
      closeAllModals();
      return;
    }
    money -= FERN_COST;
    refreshInvUi();
    closeAllModals();
  });

  btnClose.addEventListener("click", closeAllModals);

  btnSellSelected.addEventListener("click", () => {
    if (selectedEnemySlot < 0 || !isValidEnemyWorker(enemyInv[selectedEnemySlot])) {
      showWarning("請先在背包點選蜜蜂、蝴蝶或烏鴉！");
      return;
    }
    sellOneEnemyFromInv(true);
  });

  btnSellOne.addEventListener("click", () => {
    sellOneEnemyFromInv(false);
  });

  btnSellAll.addEventListener("click", () => {
    let total = 0;
    for (let i = 0; i < enemyInv.length; i++) {
      const k = enemyInv[i];
      if (isValidEnemyWorker(k)) {
        total += sellPriceFor(k);
        enemyInv[i] = null;
      }
    }
    if (total === 0) {
      showWarning("沒有可賣的單位！");
      return;
    }
    money += total;
    refreshInvUi();
  });

  btnCloseSell.addEventListener("click", closeAllModals);

  function tryRedeemCode() {
    const code = codeInput.value.trim();
    if (!code) {
      showWarning("請輸入代碼");
      return;
    }
    if (redeemedCodes.has(code)) {
      showWarning("此代碼已使用過");
      return;
    }
    if (code === CODE_REWARD_RAVEN) {
      if (!addEnemyToInv("raven")) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("已領取限定版烏鴉！請在敵人背包查看。");
      saveGame();
      return;
    }
    showWarning("代碼無效（請注意大小寫）");
  }

  btnSettings.addEventListener("click", () => openSettingsPanel());
  btnCloseSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));
  btnRedeemCode.addEventListener("click", () => tryRedeemCode());
  codeInput.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      e.preventDefault();
      tryRedeemCode();
    }
  });
  btnWipeProgress.addEventListener("click", () => {
    if (!confirm("確定要清除所有遊戲進度？此操作無法復原。")) return;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      /* ignore */
    }
    location.reload();
  });

  function setBackpackOpen(open) {
    invPanelVisible = open;
    inventoryPanel.classList.toggle("collapsed", !open);
    inventoryPanel.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("backpack-open", open);
  }

  btnCloseBackpack.addEventListener("click", () => setBackpackOpen(false));

  function isTypingInField(target) {
    if (!target || target === document.body) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
  }

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (isTypingInField(e.target)) return;
    if (e.code === "KeyE") tryInteract();
    if (e.code === "KeyR") tryPurchaseUpgrade();
    if (e.code === "KeyB") {
      setBackpackOpen(!invPanelVisible);
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  function rectsOverlap(ax, ay, ar, bx, by, bw, bh) {
    return ax + ar > bx && ax - ar < bx + bw && ay + ar > by && ay - ar < by + bh;
  }

  function dist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.hypot(dx, dy);
  }

  function rollSpawnMob() {
    const sum = MOB_SPAWN_WEIGHTS.reduce((a, x) => a + x.weight, 0);
    let r = Math.random() * sum;
    for (const m of MOB_SPAWN_WEIGHTS) {
      r -= m.weight;
      if (r <= 0) return m.type;
    }
    return MOB_SPAWN_WEIGHTS[MOB_SPAWN_WEIGHTS.length - 1].type;
  }

  function tryPurchaseUpgrade() {
    if (isUiBlocking()) return;

    for (let i = 0; i < graySlots.length; i++) {
      const s = graySlots[i];
      if (!s.locked) continue;
      const price = GRAY_SLOT_UNLOCK_PRICE[i];
      if (price <= 0) continue;
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      if (dist(player.x, player.y, cx, cy) < 44) {
        if (money < price) {
          showWarning("解鎖此灰格需要 $" + price);
          return;
        }
        money -= price;
        s.locked = false;
        refreshInvUi();
        return;
      }
    }

    const g = gridFromPixel(player.x, player.y);
    if (g && !laneUnlocked[g.col]) {
      const price = LANE_UNLOCK_PRICE[g.col];
      if (price <= 0) return;
      if (money < price) {
        showWarning("解鎖第 " + (g.col + 1) + " 道種植需要 $" + price);
        return;
      }
      money -= price;
      laneUnlocked[g.col] = true;
      refreshInvUi();
      return;
    }
  }

  function tryInteract() {
    if (isUiBlocking()) return;

    for (let i = 0; i < graySlots.length; i++) {
      const s = graySlots[i];
      if (s.locked) continue;
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      if (dist(player.x, player.y, cx, cy) < 36 && s.worker) {
        const w = s.worker;
        if (!addEnemyToInv(w)) return;
        s.worker = null;
        refreshInvUi();
        return;
      }
    }

    const g = gridFromPixel(player.x, player.y);
    if (g) {
      if (!laneUnlocked[g.col]) {
        showWarning("此種植道尚未解鎖，站在該欄花園格按 R 購買");
        return;
      }
      const hasPlant = plants.some((p) => p.row === g.row && p.col === g.col);
      if (!hasPlant) {
        const item = takePlantItemForPlanting();
        if (!item) {
          if (plantInv.indexOf("seed") === -1 && plantInv.indexOf("fern") === -1) {
            showWarning("沒有草莓苗或蕨類幼苗！");
          }
          return;
        }
        const kind = item === "seed" ? "strawberry" : "fern";
        plants.push({
          row: g.row,
          col: g.col,
          kind,
          growLeft: GROW_TIME,
          mature: false,
          shootCd: 0,
        });
        return;
      }
    }

    for (let i = 0; i < graySlots.length; i++) {
      const s = graySlots[i];
      if (s.locked || s.worker) continue;
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      if (dist(player.x, player.y, cx, cy) < 36 && hasEnemyWorkerInv()) {
        const kind = takeEnemyForWorker();
        if (!kind) return;
        s.worker = kind;
        refreshInvUi();
        return;
      }
    }
  }

  function update(dt) {
    const inBuy = rectsOverlap(player.x, player.y, player.r, shopRect.x, shopRect.y, shopRect.w, shopRect.h);
    const inSell = rectsOverlap(player.x, player.y, player.r, sellShopRect.x, sellShopRect.y, sellShopRect.w, sellShopRect.h);
    if (inBuy) {
      if (activeModal !== "buy") setActiveModal("buy");
    } else if (inSell) {
      if (activeModal !== "sell") setActiveModal("sell");
    } else if (activeModal === "buy" || activeModal === "sell") {
      closeAllModals();
    }

    let matureNow = false;
    for (const p of plants) {
      if (!p.mature) {
        p.growLeft -= dt;
        if (p.growLeft <= 0) {
          p.mature = true;
          p.growLeft = 0;
          p.shootCd = 0;
          matureNow = true;
        }
      } else if (p.kind === "strawberry") {
        p.shootCd += dt;
        if (p.shootCd >= SHOOT_INTERVAL) {
          p.shootCd = 0;
          const pc = cellCenter(p.row, p.col);
          const shootY = pc.y - 10;
          if (hasMobAheadInLane(p.col, pc.y)) {
            spawnDownProjectile(p.col, shootY);
          }
        }
      } else if (p.kind === "fern") {
        const pc = cellCenter(p.row, p.col);
        for (let j = mobs.length - 1; j >= 0; j--) {
          const mob = mobs[j];
          if (mob.lane !== p.col) continue;
          if (mob.y <= pc.y + 4) continue;
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE) continue;
          mob.hp -= FERN_DPS * dt;
          if (mob.hp <= 0) {
            addEnemyToInv(mob.type);
            mobs.splice(j, 1);
          }
        }
      }
    }
    if (matureNow) anyMaturePlant = plants.some((pl) => pl.mature);

    if (anyMaturePlant) {
      spawnAcc += dt;
      while (spawnAcc >= SPAWN_INTERVAL) {
        spawnAcc -= SPAWN_INTERVAL;
        const kind = rollSpawnMob();
        const lane = pickRandomOpenLane();
        if (lane < 0) break;
        const cx = laneCenterX(lane);
        const sy = spawnerRect.y - 8;
        if (kind === "bee") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BEE_HP,
            speed: 40,
            type: "bee",
            lane,
          });
        } else if (kind === "butterfly") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BUTTERFLY_HP,
            speed: 34,
            type: "butterfly",
            lane,
          });
        }
      }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      let hit = false;
      for (let j = mobs.length - 1; j >= 0; j--) {
        const mob = mobs[j];
        if (mob.lane !== pr.lane) continue;
        if (dist(pr.x, pr.y, mob.x, mob.y) < PROJ_HIT_R) {
          mob.hp -= pr.dmg;
          hit = true;
          if (mob.hp <= 0) {
            addEnemyToInv(mob.type);
            mobs.splice(j, 1);
          }
          break;
        }
      }
      if (hit || pr.x < 0 || pr.y < 0 || pr.x > canvas.width || pr.y > canvas.height) {
        projectiles.splice(i, 1);
      }
    }

    for (let i = mobs.length - 1; i >= 0; i--) {
      const mob = mobs[i];
      mob.y -= mob.speed * dt;
      mob.x = laneCenterX(mob.lane);
      if (mob.y < GRID_Y - 30) {
        mobs.splice(i, 1);
      }
    }

    let income = 0;
    for (const s of graySlots) {
      if (s.worker === "bee") income += BEE_DOLLAR_PER_SEC * dt;
      if (s.worker === "butterfly") income += BUTTERFLY_DOLLAR_PER_SEC * dt;
      if (s.worker === "raven") income += RAVEN_DOLLAR_PER_SEC * dt;
    }
    if (income > 0) {
      money += income;
      moneyEl.textContent = String(Math.floor(money * 100) / 100);
    }

    let mx = 0,
      my = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) my -= 1;
    if (keys["KeyS"] || keys["ArrowDown"]) my += 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) mx -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) mx += 1;
    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      mx /= len;
      my /= len;
      player.x += mx * player.speed * dt;
      player.y += my * player.speed * dt;
    }

    const margin = 24;
    player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
    player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
  }

  /**
   * 手繪風草莓角色（接近參考圖）：倒三角紅身、上方波浪綠葉、白籽、大眼白底黑瞳孔（略帶鬥雞眼趣味）
   */
  function drawStrawberryCharacter(c, cx, cy, scale) {
    const s = scale;
    c.save();
    c.translate(cx, cy);

    c.fillStyle = "#e53935";
    c.beginPath();
    c.moveTo(-11 * s, -2 * s);
    c.lineTo(11 * s, -2 * s);
    c.lineTo(0, 15 * s);
    c.closePath();
    c.fill();

    c.fillStyle = "#66bb6a";
    c.beginPath();
    c.moveTo(-12 * s, -2 * s);
    c.bezierCurveTo(-11 * s, -10 * s, -6 * s, -13.5 * s, -2 * s, -11.5 * s);
    c.bezierCurveTo(0.5 * s, -13 * s, 3 * s, -13 * s, 5 * s, -11.2 * s);
    c.bezierCurveTo(9 * s, -13 * s, 12 * s, -9 * s, 12 * s, -2 * s);
    c.lineTo(-12 * s, -2 * s);
    c.closePath();
    c.fill();

    c.fillStyle = "#ffffff";
    const seeds = [
      [-5.2, 0.8],
      [3.4, 0.2],
      [-1.8, 3.2],
      [5.1, 4.8],
      [-6, 5.5],
      [0.2, 4.2],
      [2.6, 6.8],
      [4.2, 8.9],
      [-3.8, 8.2],
      [1.1, 10.2],
      [-2.5, 11.5],
      [5.8, 2.8],
      [-0.6, 7.4],
    ];
    for (const [sx, sy] of seeds) {
      c.beginPath();
      c.arc(sx * s, sy * s, 1.15 * s, 0, Math.PI * 2);
      c.fill();
    }

    const eyeY = -3.4 * s;
    const eyeR = 4.1 * s;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(-5.4 * s, eyeY, eyeR, 0, Math.PI * 2);
    c.arc(5.4 * s, eyeY, eyeR, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#1a1a1a";
    c.beginPath();
    c.arc(-4.9 * s, eyeY + 0.35 * s, 1.75 * s, 0, Math.PI * 2);
    c.arc(5.95 * s, eyeY - 0.45 * s, 1.75 * s, 0, Math.PI * 2);
    c.fill();

    c.restore();
  }

  /** 參考圖：蓬鬆綠葉、大白眼＋紅瞳、底部菱形盆 */
  function drawFernCharacter(c, cx, cy, scale) {
    const s = scale;
    c.save();
    c.translate(cx, cy);

    c.fillStyle = "#5cb85c";
    c.beginPath();
    c.arc(0, 2 * s, 11 * s, Math.PI, 0);
    c.lineTo(8.5 * s, 7 * s);
    c.quadraticCurveTo(0, 10 * s, -8.5 * s, 7 * s);
    c.closePath();
    c.fill();

    const frondCount = 19;
    c.lineCap = "round";
    for (let i = 0; i < frondCount; i++) {
      const t = i / (frondCount - 1);
      const ang = -Math.PI * 0.92 + t * Math.PI * 0.84;
      const len = (11 + Math.sin(t * Math.PI) * 5) * s;
      const wob = (Math.sin(i * 1.7) * 0.15 + 1) * s;
      c.strokeStyle = i % 3 === 0 ? "#2e7d32" : "#66bb6a";
      c.lineWidth = (2 + (i % 2)) * wob * 0.5;
      c.beginPath();
      c.moveTo(Math.cos(ang) * 2.5 * s, 6 * s + Math.sin(ang) * 1.5 * s);
      c.quadraticCurveTo(
        Math.cos(ang - 0.08) * len * 0.45,
        2 * s + Math.sin(ang) * len * 0.25,
        Math.cos(ang - 0.02) * len * 0.92,
        -10 * s + Math.sin(ang) * len * 0.35
      );
      c.stroke();
    }

    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(-4.2 * s, -2.5 * s, 3.6 * s, 0, Math.PI * 2);
    c.arc(4.2 * s, -2.5 * s, 3.6 * s, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#c62828";
    c.beginPath();
    c.arc(-3.6 * s, -2.2 * s, 1.45 * s, 0, Math.PI * 2);
    c.arc(4.8 * s, -2.8 * s, 1.45 * s, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = "#1b5e20";
    c.lineWidth = 1.4 * s;
    c.beginPath();
    c.moveTo(0, 10 * s);
    c.lineTo(4.5 * s, 15 * s);
    c.lineTo(0, 19 * s);
    c.lineTo(-4.5 * s, 15 * s);
    c.closePath();
    c.stroke();

    c.fillStyle = "#388e3c";
    c.beginPath();
    c.moveTo(0, 11 * s);
    c.lineTo(3 * s, 15 * s);
    c.lineTo(0, 18 * s);
    c.lineTo(-3 * s, 15 * s);
    c.closePath();
    c.fill();

    c.restore();
  }

  function getFernIconDataUrl() {
    if (fernIconDataUrl) return fernIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawFernCharacter(ictx, 20, 24, 0.88);
      fernIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return fernIconDataUrl;
  }

  function getStrawberrySeedIconDataUrl() {
    if (strawberrySeedIconDataUrl) return strawberrySeedIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawStrawberryCharacter(ictx, 20, 22, 1.05);
      strawberrySeedIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return strawberrySeedIconDataUrl;
  }

  function drawProjectile(pr) {
    const r = 7;
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();
    ctx.strokeStyle = "#b71c1c";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawBeeWorld(b, showHp) {
    const x = b.x;
    const y = b.y;
    if (showHp === undefined) showHp = true;
    const wingT = performance.now() / 80;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(-10, -2 + Math.sin(wingT) * 2, 9, 5, -0.5, 0, Math.PI * 2);
    ctx.ellipse(10, -2 + Math.sin(wingT + 1) * 2, 9, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(-6, -18);
    ctx.moveTo(4, -12);
    ctx.lineTo(6, -18);
    ctx.stroke();

    const stripes = 4;
    const bodyW = 13;
    const bodyH = 10;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.clip();
    for (let i = -stripes; i <= stripes; i++) {
      ctx.fillStyle = (i + stripes) % 2 === 0 ? "#212121" : "#fdd835";
      ctx.fillRect(i * 6.5 - 20, -bodyH, 7, bodyH * 2);
    }
    ctx.restore();
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-5, -2, 3.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-4.5, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(5.5, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff7043";
    ctx.beginPath();
    ctx.moveTo(12, 1);
    ctx.lineTo(20, 0);
    ctx.lineTo(12, -1);
    ctx.fill();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(b.hp))), 0, 0);
    }

    ctx.restore();
  }

  function drawButterflyWorld(m, showHp) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const wingT = performance.now() / 55;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(255, 152, 0, 0.55)";
    ctx.beginPath();
    ctx.ellipse(-12, -1 + Math.sin(wingT) * 2, 11, 7, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(233, 30, 99, 0.5)";
    ctx.beginPath();
    ctx.ellipse(12, -1 + Math.sin(wingT + 1.2) * 2, 11, 7, 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#4a148c";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, -10);
    ctx.lineTo(-5, -16);
    ctx.moveTo(3, -10);
    ctx.lineTo(5, -16);
    ctx.stroke();

    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-2.5, -4, 2.2, 0, Math.PI * 2);
    ctx.arc(2.5, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-2.2, -3.8, 0.9, 0, Math.PI * 2);
    ctx.arc(2.8, -4.2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 4);
    }

    ctx.restore();
  }

  /** @param {{ x: number, y: number, hp: number }} m */
  function drawRavenWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1.05 : worldScale;
    const flap = Math.sin(performance.now() / 88) * 0.14;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    ctx.fillStyle = "#0a0a0a";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-6 - i * 2.5, 12);
      ctx.lineTo(-11 - i * 3, 24 + i * 2);
      ctx.lineTo(-2 - i * 1.5, 16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#121212";
    ctx.beginPath();
    ctx.ellipse(-17, 3 + flap * 9, 13, 8.5, -0.38 + flap * 0.2, 0, Math.PI * 2);
    ctx.ellipse(17, 3 + flap * 9, 13, 8.5, 0.38 - flap * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 0.75;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(side * 7, -4 + k * 3.2);
        ctx.lineTo(side * 19, 2 + k * 2.2 + flap * 7);
        ctx.stroke();
      }
    }

    const bodyGrad = ctx.createLinearGradient(-9, -16, 9, 14);
    bodyGrad.addColorStop(0, "#353535");
    bodyGrad.addColorStop(0.45, "#151515");
    bodyGrad.addColorStop(1, "#050505");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 5, 11.5, 16.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.fillStyle = "rgba(84, 110, 122, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 9, 5.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1c1c1c";
    ctx.beginPath();
    ctx.arc(0, -11, 9.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#455a64";
    ctx.beginPath();
    ctx.moveTo(7, -9);
    ctx.lineTo(19, -6.5);
    ctx.lineTo(8, -1.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 0.65;
    ctx.stroke();

    ctx.fillStyle = "#fafafa";
    ctx.beginPath();
    ctx.arc(-4.2, -12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffca28";
    ctx.beginPath();
    ctx.arc(-3.3, -12, 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-3.6, -11.7, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-7.5, -15);
    ctx.quadraticCurveTo(-2, -16.5, 1, -14.5);
    ctx.stroke();

    ctx.strokeStyle = "#4e342e";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-4, 19);
    ctx.lineTo(-5, 26);
    ctx.moveTo(4, 19);
    ctx.lineTo(5, 26);
    ctx.stroke();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 24);
    }

    ctx.restore();
  }

  function drawMobWorld(m, showHp) {
    if (m.type === "butterfly") drawButterflyWorld(m, showHp);
    else if (m.type === "raven") drawRavenWorld(m, showHp, 1.05);
    else drawBeeWorld(m, showHp);
  }

  function drawGrid() {
    const priceRow = Math.floor(ROWS / 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = GRID_X + c * CELL;
        const y = GRID_Y + r * CELL;
        const open = laneUnlocked[c];
        ctx.fillStyle = open ? "#2d6a3e" : "#4a3520";
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        ctx.strokeStyle = "#1a1510";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
        if (!open && LANE_UNLOCK_PRICE[c] > 0 && r === priceRow) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "#ffca28";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("R $" + LANE_UNLOCK_PRICE[c], x + CELL / 2, y + CELL / 2 + 4);
        }
      }
    }
  }

  function drawPlants() {
    for (const p of plants) {
      const cx = GRID_X + p.col * CELL + CELL / 2;
      const cy = GRID_Y + p.row * CELL + CELL / 2;
      const pk = p.kind || "strawberry";
      if (!p.mature) {
        const t = 1 - p.growLeft / GROW_TIME;
        ctx.fillStyle = pk === "fern" ? "#2e4a2e" : "#4a3728";
        ctx.beginPath();
        ctx.arc(cx, cy - 4 + 8 * (1 - t), 6 + 4 * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(Math.ceil(p.growLeft) + "s", cx, cy + 14);
      } else if (pk === "fern") {
        drawFernCharacter(ctx, cx, cy + 2, 0.78);
      } else {
        drawStrawberryCharacter(ctx, cx, cy - 2, 1);
      }
    }
  }

  function drawShop() {
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(shopRect.x, shopRect.y, shopRect.w, shopRect.h);
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 3;
    ctx.strokeRect(shopRect.x, shopRect.y, shopRect.w, shopRect.h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("商店", shopRect.x + shopRect.w / 2, shopRect.y + 28);
    ctx.font = "11px sans-serif";
    ctx.fillText("$" + STRAWBERRY_COST, shopRect.x + shopRect.w / 2, shopRect.y + 48);
  }

  function drawSellShop() {
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(sellShopRect.x, sellShopRect.y, sellShopRect.w, sellShopRect.h);
    ctx.strokeStyle = "#4e342e";
    ctx.lineWidth = 3;
    ctx.strokeRect(sellShopRect.x, sellShopRect.y, sellShopRect.w, sellShopRect.h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("回收", sellShopRect.x + sellShopRect.w / 2, sellShopRect.y + 30);
    ctx.font = "11px sans-serif";
    ctx.fillText("蜜蜂／蝶／烏鴉", sellShopRect.x + sellShopRect.w / 2, sellShopRect.y + 50);
  }

  function drawSpawner() {
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("生成", spawnerRect.x + spawnerRect.w / 2, spawnerRect.y + spawnerRect.h / 2 + 4);
  }

  function drawGraySlots() {
    graySlots.forEach((s, i) => {
      ctx.fillStyle = "#6a6a6a";
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = "#444";
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      if (s.locked) {
        const lx = s.x + s.w / 2;
        const ly = s.y + s.h / 2 - 4;
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.strokeRect(lx - 7, ly - 4, 14, 10);
        ctx.beginPath();
        ctx.arc(lx, ly - 4, 5, Math.PI, 0);
        ctx.stroke();
        const price = GRAY_SLOT_UNLOCK_PRICE[i];
        if (price > 0) {
          ctx.fillStyle = "#ffeb3b";
          ctx.font = "bold 8px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("$" + price, s.x + s.w / 2, s.y + s.h - 3);
        }
      } else if (s.worker) {
        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;
        if (s.worker === "bee") {
          drawBeeWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "bee" }, false);
        } else if (s.worker === "butterfly") {
          drawButterflyWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "butterfly" }, false);
        } else if (s.worker === "raven") {
          drawRavenWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "raven" }, false, 0.5);
        }
        ctx.fillStyle = "#000";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        const rateLabel = s.worker === "butterfly" ? "$2/s" : s.worker === "raven" ? "$10/s" : "$1/s";
        ctx.fillText(rateLabel, s.x + s.w / 2, s.y + s.h - 2);
      }
    });
    ctx.fillStyle = "#aaa";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("後方放置區 · 有工人 E 收回 · 鎖定格 R 購買", GRID_X + (COLS * CELL) / 2, grayRowY - 8);
  }

  function drawPlayer() {
    ctx.fillStyle = "#42a5f5";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1565c0";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawLabels() {
    ctx.fillStyle = "#9ccc65";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      "中央綠道起始解鎖 · 草莓直線射擊 · 蕨近戰同欄每秒 2 傷 · 商店可買蕨 $50",
      GRID_X,
      GRID_Y - 92
    );
  }

  function loop(now) {
    const last = loop.last || now;
    loop.last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    update(dt);

    saveAcc += dt;
    if (saveAcc >= SAVE_INTERVAL_SEC) {
      saveAcc = 0;
      saveGame();
    }

    ctx.fillStyle = "#252b20";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLabels();
    drawGraySlots();
    drawGrid();
    drawPlants();
    for (const pr of projectiles) drawProjectile(pr);
    drawSpawner();
    drawShop();
    drawSellShop();
    for (const mob of mobs) drawMobWorld(mob);
    drawPlayer();

    requestAnimationFrame(loop);
  }

  if (sellRavenPriceEl) sellRavenPriceEl.textContent = String(SELL_RAVEN_PRICE);

  buildInvSlots();
  loadGame();
  refreshInvUi();
  requestAnimationFrame(loop);
})();
