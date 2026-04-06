(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const moneyEl = document.getElementById("moneyVal");
  const plantCountEl = document.getElementById("plantCount");
  const enemyCountEl = document.getElementById("enemyCount");
  const plantSlotsEl = document.getElementById("plantSlots");
  const enemySlotsEl = document.getElementById("enemySlots");
  const gearSlotsEl = document.getElementById("gearSlots");
  const shovelStackCountEl = document.getElementById("shovelStackCount");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const toast = document.getElementById("toast");
  const shopModal = document.getElementById("shopModal");
  const gearModal = document.getElementById("gearModal");
  const sellModal = document.getElementById("sellModal");
  const btnBuy = document.getElementById("btnBuy");
  const btnBuyFern = document.getElementById("btnBuyFern");
  const btnBuyGrape = document.getElementById("btnBuyGrape");
  const btnBuyPineapple = document.getElementById("btnBuyPineapple");
  const pineapplePriceEl = document.getElementById("pineapplePrice");
  const btnClose = document.getElementById("btnClose");
  const btnBuyShovel = document.getElementById("btnBuyShovel");
  const btnCloseGear = document.getElementById("btnCloseGear");
  const shovelPriceEl = document.getElementById("shovelPrice");
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
  const rebirthModal = document.getElementById("rebirthModal");
  const btnUnlockSpawner = document.getElementById("btnUnlockSpawner");
  const btnSpawnerDefault = document.getElementById("btnSpawnerDefault");
  const btnSpawnerUpgrade = document.getElementById("btnSpawnerUpgrade");
  const btnCloseRebirth = document.getElementById("btnCloseRebirth");
  const sellRavenPriceEl = document.getElementById("sellRavenPrice");
  const sellBeetlePriceEl = document.getElementById("sellBeetlePrice");
  const sellDragonflyPriceEl = document.getElementById("sellDragonflyPrice");
  const sellLizardPriceEl = document.getElementById("sellLizardPrice");
  const sellSnakePriceEl = document.getElementById("sellSnakePrice");
  const sellJayPriceEl = document.getElementById("sellJayPrice");

  const PLANT_SLOTS = 10;
  const ENEMY_SLOTS = 100;
  const SAVE_KEY = "plantsVsEverythingSaveV1";
  const REDEMPTION_CODES_KEY = "plantsVsEverythingRedeemedCodes";
  /** 區分大小寫；兌換後取得 1 鳳梨苗 */
  const CODE_REWARD_PINEAPPLE = "HXO1";
  /** 兌換後取得 1 巨型蕨苗（種下為 2× 體型與近戰傷害） */
  const CODE_REWARD_MEGA_FERN = "B154ERN";
  /** 種植時一般苗有機率變為巨型（2× 繪製、2× 傷害；子彈外觀不變） */
  const MEGA_PLANT_CHANCE = 0.05;
  const SAVE_INTERVAL_SEC = 2;

  const ROWS = 7;
  const COLS = 7;
  const CELL = 56;
  const GRID_X = 280;
  const GRID_Y = 140;
  const STRAWBERRY_COST = 20;
  const FERN_COST = 50;
  const GROW_TIME_STRAWBERRY = 5;
  const GROW_TIME_FERN = 10;
  const GROW_TIME_GRAPE = 15;
  const FERN_DPS = 2;
  /** 葡萄：每發 1 傷，發射間隔（秒） */
  const GRAPE_SHOOT_INTERVAL = 0.3;
  const GRAPE_COST = 500;
  const PINEAPPLE_COST = 2000;
  /** 鳳梨：成熟後同欄近戰，與蕨相同判定距離 */
  const GROW_TIME_PINEAPPLE = 12;
  const PINEAPPLE_DPS = 15;
  const SHOVEL_COST = 35;
  /** 蕨類／鳳梨近戰：同欄、在植株前方（靠生成端）的距離內 */
  const FERN_MELEE_RANGE = 72;
  const SPAWN_INTERVAL_BASE = 7;
  /** 每多解鎖一條種植道，生成間隔少 1 秒（中央起始道不扣） */
  const MIN_SPAWN_INTERVAL_SEC = 1.5;
  const KILLS_PER_DRAGONFLY_BOSS = 100;
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
  const BEETLE_HP = 10;
  const BEETLE_DOLLAR_PER_SEC = 4;
  const BEETLE_SPEED = 36;
  const SELL_BEETLE_PRICE = 12;
  const DRAGONFLY_HP = 70;
  const DRAGONFLY_DOLLAR_PER_SEC = 17;
  const DRAGONFLY_SPEED = 26;
  const SELL_DRAGONFLY_PRICE = 60;
  const LIZARD_HP = 30;
  const LIZARD_SPEED = 35;
  const LIZARD_DOLLAR_PER_SEC = 8;
  const SELL_LIZARD_PRICE = 22;
  const SNAKE_HP = 50;
  const SNAKE_SPEED = 27;
  const SNAKE_DOLLAR_PER_SEC = 11;
  const SELL_SNAKE_PRICE = 35;
  const JAY_HP = 80;
  const JAY_SPEED = 22;
  const JAY_DOLLAR_PER_SEC = 15;
  const SELL_JAY_PRICE = 52;
  /** 轉生店：解鎖升級生成池 */
  const SPAWNER_UPGRADE_COST_MONEY = 4000;
  const SPAWNER_UPGRADE_DRAGONFLIES = 3;

  /** 權重 3:2:1（蜜蜂:蝴蝶:甲蟲），甲蟲約 1/6 */
  const MOB_SPAWN_WEIGHTS = [
    { type: "bee", weight: 3 },
    { type: "butterfly", weight: 2 },
    { type: "beetle", weight: 1 },
  ];
  /** 升級池：蜥蜴為主體，蛇約 1/4，冠藍鴉約 1/10（權重 13:5:2） */
  const MOB_SPAWN_WEIGHTS_UPGRADE = [
    { type: "lizard", weight: 13 },
    { type: "snake", weight: 5 },
    { type: "jay", weight: 2 },
  ];

  /** 灰格 1 免費；格 2～10 對應 index 1～9 */
  const GRAY_SLOT_UNLOCK_PRICE = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 30000];

  /** 中央道（欄 3）免費；其餘六道由中往外：左 300/600/1200，右 2400/4800/9600 */
  const LANE_UNLOCK_PRICE = [300, 600, 1200, 0, 2400, 4800, 9600];

  const shopRect = { x: 40, y: 208, w: 100, h: 158 };
  const gearShopRect = { x: 40, y: 378, w: 100, h: 86 };
  const sellShopRect = { x: 780, y: 220, w: 100, h: 140 };
  const rebirthShopRect = { x: 780, y: 365, w: 100, h: 96 };
  const spawnerRect = {
    x: GRID_X + 4,
    y: GRID_Y + ROWS * CELL + 6,
    w: COLS * CELL - 8,
    h: 58,
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
      /** @type {null | 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly'} */
      worker: null,
    });
  }

  /** 僅中央綠道（欄 3）起始解鎖 */
  const laneUnlocked = [false, false, false, true, false, false, false];

  /** @type {(null | 'seed' | 'fern' | 'fern_mega' | 'grape' | 'pineapple')[]} */
  const plantInv = new Array(PLANT_SLOTS).fill(null);
  /** @type {(null | 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly')[]} */
  const enemyInv = new Array(ENEMY_SLOTS).fill(null);

  let selectedPlantSlot = -1;
  let selectedEnemySlot = -1;
  /** @type {null | 'shovel'} */
  let selectedGear = null;
  let shovelCount = 0;
  /** @type {null | 'buy' | 'sell' | 'gear' | 'rebirth'} */
  let activeModal = null;
  let money = 20;
  let invPanelVisible = false;

  /** 背包小圖（程式繪製快取） */
  let strawberrySeedIconDataUrl = "";
  let fernIconDataUrl = "";
  let grapeIconDataUrl = "";
  let pineappleIconDataUrl = "";

  const keys = {};
  const player = {
    x: GRID_X + (COLS * CELL) / 2,
    y: GRID_Y + ROWS * CELL + 80,
    r: 14,
    speed: 180,
  };

  /** @type {{ row: number, col: number, kind: 'strawberry' | 'fern' | 'grape' | 'pineapple', growLeft: number, mature: boolean, shootCd: number, mega?: boolean }[]} */
  const plants = [];

  /** @type {{ x: number, y: number, hp: number, speed: number, type: 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly' | 'lizard' | 'snake' | 'jay', lane: number }[]} */
  const mobs = [];

  /** @type {{ x: number, y: number, vx: number, vy: number, dmg: number, lane: number, src?: 'strawberry' | 'grape' }[]} */
  const projectiles = [];

  let spawnAcc = 0;
  let anyMaturePlant = false;
  let toastTimer = 0;
  let saveAcc = 0;
  /** 成功收進背包的擊殺數（滿包不計），每 100 生成蜻蜓王 */
  let defeatCount = 0;
  /** 是否已付費解鎖升級生成表 */
  let spawnerUpgradeOwned = false;
  /** 0＝預設池，1＝升級池（需已解鎖） */
  let activeSpawnTable = 0;

  function isValidEnemyWorker(w) {
    return (
      w === "bee" ||
      w === "butterfly" ||
      w === "raven" ||
      w === "beetle" ||
      w === "dragonfly" ||
      w === "lizard" ||
      w === "snake" ||
      w === "jay"
    );
  }

  function countDragonfliesInInv() {
    return enemyInv.filter((x) => x === "dragonfly").length;
  }

  /** @returns {boolean} 是否成功從背包移除 n 隻蜻蜓王 */
  function consumeDragonfliesFromInv(n) {
    let left = n;
    for (let i = 0; i < enemyInv.length && left > 0; i++) {
      if (enemyInv[i] === "dragonfly") {
        enemyInv[i] = null;
        left--;
      }
    }
    return left === 0;
  }

  function syncSpawnTableState() {
    if (activeSpawnTable === 1 && !spawnerUpgradeOwned) activeSpawnTable = 0;
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
      /* 配額滿或私密模式 */
    }
  }

  let redeemedCodes = loadRedeemedCodesSet();

  function countUnlockedLanes() {
    let n = 0;
    for (let c = 0; c < COLS; c++) if (laneUnlocked[c]) n++;
    return n;
  }

  function getSpawnIntervalSec() {
    const unlocked = countUnlockedLanes();
    return Math.max(MIN_SPAWN_INTERVAL_SEC, SPAWN_INTERVAL_BASE - (unlocked - 1));
  }

  function trySpawnDragonflyBoss() {
    const lane = pickRandomOpenLane();
    if (lane < 0) {
      showWarning("沒有已解鎖的種植道，蜻蜓王無法出現！");
      return;
    }
    const cx = laneCenterX(lane);
    const sy = spawnerRect.y - 8;
    mobs.push({
      x: cx,
      y: sy,
      hp: DRAGONFLY_HP,
      speed: DRAGONFLY_SPEED,
      type: "dragonfly",
      lane,
    });
    showSuccess("蜻蜓王出現！紅身綠翅，請小心應對。");
  }

  function registerEnemyDefeatForBoss() {
    defeatCount += 1;
    while (defeatCount >= KILLS_PER_DRAGONFLY_BOSS) {
      defeatCount -= KILLS_PER_DRAGONFLY_BOSS;
      trySpawnDragonflyBoss();
    }
  }

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
        mega: !!p.mega,
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
        src: pr.src === "grape" ? "grape" : "strawberry",
      })),
      player: { x: player.x, y: player.y },
      spawnAcc,
      anyMaturePlant,
      defeatCount,
      shovelCount,
      spawnerUpgradeOwned,
      activeSpawnTable,
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
          plantInv[i] =
            t === "seed" || t === "fern" || t === "fern_mega" || t === "grape" || t === "pineapple" ? t : null;
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
          const k =
            p.kind === "fern"
              ? "fern"
              : p.kind === "grape"
                ? "grape"
                : p.kind === "pineapple"
                  ? "pineapple"
                  : "strawberry";
          plants.push({
            row: p.row | 0,
            col: p.col | 0,
            kind: k,
            growLeft: Math.max(0, Number(p.growLeft) || 0),
            mature: !!p.mature,
            shootCd: Math.max(0, Number(p.shootCd) || 0),
            mega: !!p.mega,
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
          if (m.type === "dragonfly") {
            typ = "dragonfly";
            spd = DRAGONFLY_SPEED;
            maxHp = DRAGONFLY_HP;
          } else if (m.type === "raven") {
            typ = "raven";
            spd = RAVEN_SPEED;
            maxHp = RAVEN_HP;
          } else if (m.type === "beetle") {
            typ = "beetle";
            spd = BEETLE_SPEED;
            maxHp = BEETLE_HP;
          } else if (m.type === "lizard") {
            typ = "lizard";
            spd = LIZARD_SPEED;
            maxHp = LIZARD_HP;
          } else if (m.type === "snake") {
            typ = "snake";
            spd = SNAKE_SPEED;
            maxHp = SNAKE_HP;
          } else if (m.type === "jay") {
            typ = "jay";
            spd = JAY_SPEED;
            maxHp = JAY_HP;
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
            src: pr.src === "grape" ? "grape" : "strawberry",
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
      if (typeof raw.shovelCount === "number" && isFinite(raw.shovelCount)) {
        shovelCount = Math.max(0, Math.floor(raw.shovelCount));
      }
      if (typeof raw.defeatCount === "number" && isFinite(raw.defeatCount)) {
        let dc = Math.floor(raw.defeatCount);
        if (dc < 0) dc = 0;
        defeatCount = dc % KILLS_PER_DRAGONFLY_BOSS;
      }
      if (typeof raw.spawnerUpgradeOwned === "boolean") spawnerUpgradeOwned = raw.spawnerUpgradeOwned;
      if (typeof raw.activeSpawnTable === "number") activeSpawnTable = raw.activeSpawnTable === 1 ? 1 : 0;
      syncSpawnTableState();
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

  function growTotalForFieldKind(kind) {
    if (kind === "fern") return GROW_TIME_FERN;
    if (kind === "grape") return GROW_TIME_GRAPE;
    if (kind === "pineapple") return GROW_TIME_PINEAPPLE;
    return GROW_TIME_STRAWBERRY;
  }

  function plantDamageMult(p) {
    return p.mega ? 2 : 1;
  }

  function plantDrawScale(p) {
    return p.mega ? 2 : 1;
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

  function addPlantGrape() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("植物背包已滿（10 格）！");
      return false;
    }
    plantInv[idx] = "grape";
    refreshInvUi();
    return true;
  }

  function addPlantPineapple() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("植物背包已滿（10 格）！");
      return false;
    }
    plantInv[idx] = "pineapple";
    refreshInvUi();
    return true;
  }

  function plantBackpackHasSpace() {
    return plantInv.indexOf(null) !== -1;
  }

  function addPlantFernMega() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("植物背包已滿（10 格）！");
      return false;
    }
    plantInv[idx] = "fern_mega";
    refreshInvUi();
    return true;
  }

  /** @param {'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly'} kind */
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
    if (kind === "beetle") return SELL_BEETLE_PRICE;
    if (kind === "dragonfly") return SELL_DRAGONFLY_PRICE;
    if (kind === "lizard") return SELL_LIZARD_PRICE;
    if (kind === "snake") return SELL_SNAKE_PRICE;
    if (kind === "jay") return SELL_JAY_PRICE;
    return SELL_BEE_PRICE;
  }

  /** @returns {null | 'seed' | 'fern' | 'fern_mega' | 'grape' | 'pineapple'} */
  function takePlantItemForPlanting() {
    if (selectedPlantSlot >= 0) {
      const t = plantInv[selectedPlantSlot];
      if (t === "seed" || t === "fern" || t === "fern_mega" || t === "grape" || t === "pineapple") {
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
    idx = plantInv.indexOf("grape");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "grape";
    }
    idx = plantInv.indexOf("pineapple");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "pineapple";
    }
    idx = plantInv.indexOf("fern_mega");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "fern_mega";
    }
    return null;
  }

  /** @returns {null | 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly'} */
  function takeEnemyForWorker() {
    if (selectedEnemySlot >= 0) {
      const t = enemyInv[selectedEnemySlot];
      if (isValidEnemyWorker(t)) {
        enemyInv[selectedEnemySlot] = null;
        refreshInvUi();
        return t;
      }
    }
    for (const typ of ["bee", "butterfly", "beetle", "lizard", "snake", "jay", "dragonfly", "raven"]) {
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
    if (shovelStackCountEl) shovelStackCountEl.textContent = String(shovelCount);
    if (shovelCount <= 0) selectedGear = null;

    const pSlots = plantSlotsEl.querySelectorAll(".inv-slot");
    pSlots.forEach((el, i) => {
      el.classList.toggle("filled", plantInv[i] !== null);
      el.classList.toggle("selected-plant", i === selectedPlantSlot);
      el.classList.toggle("inv-slot-mega", plantInv[i] === "fern_mega");
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
      } else if (plantInv[i] === "fern_mega") {
        const url = getFernIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "2× 蕨種子";
          m.title = "2× 體型蕨種子（兌換）：種下即巨型蕨（2× 體型、2× 近戰傷害）";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "蕨+";
          sp.style.fontSize = "12px";
          sp.style.color = "#fff59d";
          sp.title = "2× 體型蕨種子（兌換）";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "grape") {
        const url = getGrapeIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "葡萄苗";
          m.title = "葡萄苗";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "葡";
          sp.style.fontSize = "13px";
          sp.style.color = "#e1bee7";
          sp.title = "葡萄苗";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "pineapple") {
        const url = getPineappleIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "鳳梨苗";
          m.title = "鳳梨苗（近戰 15／秒）";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "鳳";
          sp.style.fontSize = "13px";
          sp.style.color = "#ffe082";
          sp.title = "鳳梨苗";
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
      } else if (enemyInv[i] === "beetle") {
        const m = document.createElement("span");
        m.className = "icon-beetle";
        m.title = "甲蟲";
        el.appendChild(m);
      } else if (enemyInv[i] === "dragonfly") {
        const m = document.createElement("span");
        m.className = "icon-dragonfly";
        m.title = "蜻蜓王";
        el.appendChild(m);
      } else if (enemyInv[i] === "lizard") {
        const m = document.createElement("span");
        m.className = "icon-lizard";
        m.title = "蜥蜴";
        el.appendChild(m);
      } else if (enemyInv[i] === "snake") {
        const m = document.createElement("span");
        m.className = "icon-snake";
        m.title = "蛇";
        el.appendChild(m);
      } else if (enemyInv[i] === "jay") {
        const m = document.createElement("span");
        m.className = "icon-jay";
        m.title = "冠藍鴉";
        el.appendChild(m);
      }
    });

    if (gearSlotsEl) {
      const gearSlot = gearSlotsEl.querySelector("[data-gear='shovel']");
      if (gearSlot) {
        gearSlot.classList.toggle("filled", shovelCount > 0);
        gearSlot.classList.toggle("selected-gear", selectedGear === "shovel" && shovelCount > 0);
        gearSlot.innerHTML = "";
        const icon = document.createElement("span");
        icon.className = "icon-shovel";
        gearSlot.appendChild(icon);
        const badge = document.createElement("span");
        badge.className = "gear-stack-count";
        badge.textContent = "×" + shovelCount;
        gearSlot.appendChild(badge);
        gearSlot.title = "鏟子 ×" + shovelCount + "（點選後對植株按 E）";
      }
    }
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
      selectedGear = null;
      refreshInvUi();
    });

    enemySlotsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".inv-slot");
      if (!t || t.dataset.enemyIdx === undefined) return;
      const i = Number(t.dataset.enemyIdx);
      selectedEnemySlot = selectedEnemySlot === i ? -1 : i;
      selectedGear = null;
      refreshInvUi();
    });

    if (gearSlotsEl) {
      gearSlotsEl.innerHTML = "";
      const gd = document.createElement("div");
      gd.className = "inv-slot gear-slot";
      gd.dataset.gear = "shovel";
      gearSlotsEl.appendChild(gd);
      gearSlotsEl.addEventListener("click", (e) => {
        const t = e.target.closest(".inv-slot");
        if (!t || t.dataset.gear !== "shovel") return;
        if (shovelCount <= 0) {
          showWarning("沒有鏟子！到左下「道具店」購買。");
          return;
        }
        selectedGear = selectedGear === "shovel" ? null : "shovel";
        selectedPlantSlot = -1;
        selectedEnemySlot = -1;
        refreshInvUi();
      });
    }
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

  /** @param {{ dmg?: number, src?: 'strawberry' | 'grape' }} [opts] */
  function spawnDownProjectile(laneCol, startY, opts) {
    const o = opts || {};
    const dmg = typeof o.dmg === "number" && o.dmg > 0 ? o.dmg : 1;
    const src = o.src === "grape" ? "grape" : "strawberry";
    projectiles.push({
      x: laneCenterX(laneCol),
      y: startY,
      vx: 0,
      vy: PROJ_SPEED,
      lane: laneCol,
      dmg,
      src,
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
    if (gearModal) gearModal.classList.toggle("hidden", mode !== "gear");
    sellModal.classList.toggle("hidden", mode !== "sell");
    if (rebirthModal) {
      rebirthModal.classList.toggle("hidden", mode !== "rebirth");
      if (mode === "rebirth") updateRebirthModal();
    }
  }

  function closeAllModals() {
    activeModal = null;
    shopModal.classList.add("hidden");
    if (gearModal) gearModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    if (rebirthModal) rebirthModal.classList.add("hidden");
    settingsModal.classList.add("hidden");
  }

  function openSettingsPanel() {
    activeModal = null;
    shopModal.classList.add("hidden");
    if (gearModal) gearModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    if (rebirthModal) rebirthModal.classList.add("hidden");
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

  if (btnBuyGrape) {
    btnBuyGrape.addEventListener("click", () => {
      if (money < GRAPE_COST) {
        closeAllModals();
        return;
      }
      if (!addPlantGrape()) {
        closeAllModals();
        return;
      }
      money -= GRAPE_COST;
      refreshInvUi();
      closeAllModals();
    });
  }

  if (btnBuyPineapple) {
    btnBuyPineapple.addEventListener("click", () => {
      if (money < PINEAPPLE_COST) {
        closeAllModals();
        return;
      }
      if (!addPlantPineapple()) {
        closeAllModals();
        return;
      }
      money -= PINEAPPLE_COST;
      refreshInvUi();
      closeAllModals();
    });
  }

  btnClose.addEventListener("click", closeAllModals);

  if (btnBuyShovel) {
    btnBuyShovel.addEventListener("click", () => {
      if (money < SHOVEL_COST) {
        showWarning("金錢不足！鏟子需 $" + SHOVEL_COST);
        closeAllModals();
        return;
      }
      money -= SHOVEL_COST;
      shovelCount += 1;
      refreshInvUi();
      closeAllModals();
    });
  }
  if (btnCloseGear) btnCloseGear.addEventListener("click", closeAllModals);

  btnSellSelected.addEventListener("click", () => {
    if (selectedEnemySlot < 0 || !isValidEnemyWorker(enemyInv[selectedEnemySlot])) {
      showWarning("請先在背包點選可賣出的單位！");
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

  function updateRebirthModal() {
    if (!rebirthModal || !btnUnlockSpawner || !btnSpawnerDefault || !btnSpawnerUpgrade) return;
    btnUnlockSpawner.disabled = spawnerUpgradeOwned;
    btnUnlockSpawner.textContent = spawnerUpgradeOwned ? "已解鎖升級池" : "解鎖（3×蜻蜓王 + $" + SPAWNER_UPGRADE_COST_MONEY + "）";
    btnSpawnerDefault.classList.toggle("btn-spawner-active", activeSpawnTable === 0);
    btnSpawnerUpgrade.classList.toggle("btn-spawner-active", activeSpawnTable === 1);
    btnSpawnerUpgrade.disabled = !spawnerUpgradeOwned;
  }

  if (btnUnlockSpawner) {
    btnUnlockSpawner.addEventListener("click", () => {
      if (spawnerUpgradeOwned) {
        showWarning("你已解鎖升級生成池。");
        return;
      }
      if (countDragonfliesInInv() < SPAWNER_UPGRADE_DRAGONFLIES) {
        showWarning("需要背包內有 " + SPAWNER_UPGRADE_DRAGONFLIES + " 隻蜻蜓王。");
        return;
      }
      if (money < SPAWNER_UPGRADE_COST_MONEY) {
        showWarning("金錢不足！解鎖需 $" + SPAWNER_UPGRADE_COST_MONEY);
        return;
      }
      if (!consumeDragonfliesFromInv(SPAWNER_UPGRADE_DRAGONFLIES)) {
        showWarning("無法扣除蜻蜓王，請重試。");
        return;
      }
      money -= SPAWNER_UPGRADE_COST_MONEY;
      spawnerUpgradeOwned = true;
      activeSpawnTable = 1;
      syncSpawnTableState();
      refreshInvUi();
      updateRebirthModal();
      showSuccess("已解鎖升級生成池！可切換 Default／Upgrade 1。");
      saveGame();
    });
  }
  if (btnSpawnerDefault) {
    btnSpawnerDefault.addEventListener("click", () => {
      activeSpawnTable = 0;
      updateRebirthModal();
      saveGame();
    });
  }
  if (btnSpawnerUpgrade) {
    btnSpawnerUpgrade.addEventListener("click", () => {
      if (!spawnerUpgradeOwned) {
        showWarning("請先解鎖升級生成池。");
        return;
      }
      activeSpawnTable = 1;
      updateRebirthModal();
      saveGame();
    });
  }
  if (btnCloseRebirth) btnCloseRebirth.addEventListener("click", closeAllModals);

  function tryRedeemCode() {
    if (!codeInput) return;
    const code = codeInput.value.trim();
    if (!code) {
      showWarning("請輸入代碼");
      return;
    }
    if (redeemedCodes.has(code)) {
      showWarning("此代碼已使用過");
      return;
    }
    if (code === CODE_REWARD_PINEAPPLE) {
      if (!plantBackpackHasSpace()) {
        showWarning("植物背包已滿，請先清出一格再放兌換獎勵。");
        return;
      }
      if (!addPlantPineapple()) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("已領取 1 個鳳梨苗！請在植物背包查看。");
      saveGame();
      return;
    }
    if (code === CODE_REWARD_MEGA_FERN) {
      if (!plantBackpackHasSpace()) {
        showWarning("植物背包已滿，請先清出一格再放兌換獎勵。");
        return;
      }
      if (!addPlantFernMega()) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("已領取 1 粒 2× 體型蕨種子！種下後即為巨型蕨。請在植物背包查看。");
      saveGame();
      return;
    }
    showWarning("代碼無效（請注意大小寫）");
  }

  if (btnRedeemCode && codeInput) {
    btnRedeemCode.addEventListener("click", () => tryRedeemCode());
    codeInput.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        tryRedeemCode();
      }
    });
  }

  btnSettings.addEventListener("click", () => openSettingsPanel());
  btnCloseSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));
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

  function getActiveSpawnWeights() {
    syncSpawnTableState();
    if (activeSpawnTable === 1 && spawnerUpgradeOwned) return MOB_SPAWN_WEIGHTS_UPGRADE;
    return MOB_SPAWN_WEIGHTS;
  }

  function rollSpawnMob() {
    const table = getActiveSpawnWeights();
    const sum = table.reduce((a, x) => a + x.weight, 0);
    let r = Math.random() * sum;
    for (const m of table) {
      r -= m.weight;
      if (r <= 0) return m.type;
    }
    return table[table.length - 1].type;
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
      if (hasPlant) {
        if (selectedGear === "shovel" && shovelCount > 0) {
          const pi = plants.findIndex((p) => p.row === g.row && p.col === g.col);
          if (pi >= 0) {
            plants.splice(pi, 1);
            shovelCount--;
            if (shovelCount <= 0) selectedGear = null;
            anyMaturePlant = plants.some((pl) => pl.mature);
            refreshInvUi();
          }
          return;
        }
      }
      if (!hasPlant) {
        const item = takePlantItemForPlanting();
        if (!item) {
          if (
            plantInv.indexOf("seed") === -1 &&
            plantInv.indexOf("fern") === -1 &&
            plantInv.indexOf("grape") === -1 &&
            plantInv.indexOf("pineapple") === -1 &&
            plantInv.indexOf("fern_mega") === -1
          ) {
            showWarning("沒有可種植的苗（草莓／蕨／葡萄／鳳梨）！");
          }
          return;
        }
        // 僅兌換碼給的 fern_mega 事先決定巨型；商店／其餘苗的巨型一律在種植當下骰定
        const mega = item === "fern_mega" ? true : Math.random() < MEGA_PLANT_CHANCE;
        const kind =
          item === "seed"
            ? "strawberry"
            : item === "fern" || item === "fern_mega"
              ? "fern"
              : item === "grape"
                ? "grape"
                : "pineapple";
        plants.push({
          row: g.row,
          col: g.col,
          kind,
          growLeft: growTotalForFieldKind(kind),
          mature: false,
          shootCd: 0,
          mega,
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
    const inGearShop = rectsOverlap(player.x, player.y, player.r, gearShopRect.x, gearShopRect.y, gearShopRect.w, gearShopRect.h);
    const inSell = rectsOverlap(player.x, player.y, player.r, sellShopRect.x, sellShopRect.y, sellShopRect.w, sellShopRect.h);
    const inRebirth = rectsOverlap(
      player.x,
      player.y,
      player.r,
      rebirthShopRect.x,
      rebirthShopRect.y,
      rebirthShopRect.w,
      rebirthShopRect.h
    );
    if (inBuy) {
      if (activeModal !== "buy") setActiveModal("buy");
    } else if (inGearShop) {
      if (activeModal !== "gear") setActiveModal("gear");
    } else if (inSell) {
      if (activeModal !== "sell") setActiveModal("sell");
    } else if (inRebirth) {
      if (activeModal !== "rebirth") setActiveModal("rebirth");
    } else if (activeModal === "buy" || activeModal === "sell" || activeModal === "gear" || activeModal === "rebirth") {
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
            const dmg = plantDamageMult(p);
            spawnDownProjectile(p.col, shootY, { src: "strawberry", dmg });
          }
        }
      } else if (p.kind === "grape") {
        p.shootCd += dt;
        if (p.shootCd >= GRAPE_SHOOT_INTERVAL) {
          p.shootCd = 0;
          const pc = cellCenter(p.row, p.col);
          const shootY = pc.y - 10;
          if (hasMobAheadInLane(p.col, pc.y)) {
            spawnDownProjectile(p.col, shootY, { src: "grape", dmg: plantDamageMult(p) });
          }
        }
      } else if (p.kind === "fern") {
        const pc = cellCenter(p.row, p.col);
        const dps = FERN_DPS * plantDamageMult(p);
        for (let j = mobs.length - 1; j >= 0; j--) {
          const mob = mobs[j];
          if (mob.lane !== p.col) continue;
          if (mob.y <= pc.y + 4) continue;
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE) continue;
          mob.hp -= dps * dt;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type)) registerEnemyDefeatForBoss();
            mobs.splice(j, 1);
          }
        }
      } else if (p.kind === "pineapple") {
        const pc = cellCenter(p.row, p.col);
        const dps = PINEAPPLE_DPS * plantDamageMult(p);
        for (let j = mobs.length - 1; j >= 0; j--) {
          const mob = mobs[j];
          if (mob.lane !== p.col) continue;
          if (mob.y <= pc.y + 4) continue;
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE) continue;
          mob.hp -= dps * dt;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type)) registerEnemyDefeatForBoss();
            mobs.splice(j, 1);
          }
        }
      }
    }
    if (matureNow) anyMaturePlant = plants.some((pl) => pl.mature);

    if (anyMaturePlant) {
      spawnAcc += dt;
      const spawnEvery = getSpawnIntervalSec();
      while (spawnAcc >= spawnEvery) {
        spawnAcc -= spawnEvery;
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
        } else if (kind === "beetle") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BEETLE_HP,
            speed: BEETLE_SPEED,
            type: "beetle",
            lane,
          });
        } else if (kind === "lizard") {
          mobs.push({
            x: cx,
            y: sy,
            hp: LIZARD_HP,
            speed: LIZARD_SPEED,
            type: "lizard",
            lane,
          });
        } else if (kind === "snake") {
          mobs.push({
            x: cx,
            y: sy,
            hp: SNAKE_HP,
            speed: SNAKE_SPEED,
            type: "snake",
            lane,
          });
        } else if (kind === "jay") {
          mobs.push({
            x: cx,
            y: sy,
            hp: JAY_HP,
            speed: JAY_SPEED,
            type: "jay",
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
            if (addEnemyToInv(mob.type)) registerEnemyDefeatForBoss();
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
      if (s.worker === "beetle") income += BEETLE_DOLLAR_PER_SEC * dt;
      if (s.worker === "dragonfly") income += DRAGONFLY_DOLLAR_PER_SEC * dt;
      if (s.worker === "lizard") income += LIZARD_DOLLAR_PER_SEC * dt;
      if (s.worker === "snake") income += SNAKE_DOLLAR_PER_SEC * dt;
      if (s.worker === "jay") income += JAY_DOLLAR_PER_SEC * dt;
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
   * 植物角色慣例：成熟株皆有大眼（白鞏膜＋瞳孔）。新植物請在角色繪製尾端呼叫此函式，參數比照既有植株。
   * @param {CanvasRenderingContext2D} c
   * @param {object} opt
   * @param {number} opt.y — 雙眼中心連線的 y（已乘 scale 前的本地座標）
   * @param {number} [opt.spread=4.5] — 單眼距離角色中心的水平半距
   * @param {number} [opt.whiteR=3.2] — 眼白半徑
   * @param {number} [opt.pupilR=1.3] — 瞳孔半徑
   * @param {string} [opt.pupilColor='#1a1a1a']
   * @param {number} [opt.pupilLX=0] [opt.pupilLY=0] [opt.pupilRX=0] [opt.pupilRY=0] — 瞳孔相對眼白的偏移（本地座標，未乘 scale 的係數會在內部乘 scale）
   */
  function drawCutePlantEyes(c, scale, opt) {
    const s = scale;
    const y = opt.y * s;
    const spread = (opt.spread != null ? opt.spread : 4.5) * s;
    const whiteR = (opt.whiteR != null ? opt.whiteR : 3.2) * s;
    const pupilR = (opt.pupilR != null ? opt.pupilR : 1.3) * s;
    const pc = opt.pupilColor || "#1a1a1a";
    const plx = (opt.pupilLX || 0) * s;
    const ply = (opt.pupilLY || 0) * s;
    const prx = (opt.pupilRX || 0) * s;
    const pry = (opt.pupilRY || 0) * s;

    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(-spread, y, whiteR, 0, Math.PI * 2);
    c.arc(spread, y, whiteR, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = pc;
    c.beginPath();
    c.arc(-spread + plx, y + ply, pupilR, 0, Math.PI * 2);
    c.arc(spread + prx, y + pry, pupilR, 0, Math.PI * 2);
    c.fill();
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

    drawCutePlantEyes(c, s, {
      y: -3.4,
      spread: 5.4,
      whiteR: 4.1,
      pupilR: 1.75,
      pupilColor: "#1a1a1a",
      pupilLX: 0.5,
      pupilLY: 0.35,
      pupilRX: 0.55,
      pupilRY: -0.45,
    });

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

    drawCutePlantEyes(c, s, {
      y: -2.5,
      spread: 4.2,
      whiteR: 3.6,
      pupilR: 1.45,
      pupilColor: "#c62828",
      pupilLX: 0.6,
      pupilLY: 0.3,
      pupilRX: 0.6,
      pupilRY: -0.3,
    });

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

  /** 鳳梨：金黃橢圓身、頂端綠冠、大眼 */
  function drawPineappleCharacter(c, cx, cy, scale) {
    const s = scale;
    c.save();
    c.translate(cx, cy);

    const crownN = 9;
    c.lineCap = "round";
    for (let i = 0; i < crownN; i++) {
      const t = i / (crownN - 1);
      const ang = -Math.PI * 0.55 + t * Math.PI * 1.1;
      c.strokeStyle = i % 2 === 0 ? "#1b5e20" : "#388e3c";
      c.lineWidth = (2.1 + (i % 2)) * s;
      c.beginPath();
      c.moveTo(Math.sin(ang) * 2 * s, -8 * s);
      c.lineTo(Math.sin(ang) * 5 * s, -20 * s - Math.cos(ang) * 4 * s);
      c.stroke();
    }

    const body = c.createRadialGradient(-4 * s, -2 * s, 2 * s, 2 * s, 6 * s, 16 * s);
    body.addColorStop(0, "#fff9c4");
    body.addColorStop(0.35, "#fdd835");
    body.addColorStop(0.7, "#f9a825");
    body.addColorStop(1, "#f57f17");
    c.fillStyle = body;
    c.beginPath();
    c.ellipse(0, 4 * s, 12 * s, 14 * s, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#e65100";
    c.lineWidth = 1.3 * s;
    c.stroke();

    c.strokeStyle = "rgba(184, 119, 47, 0.55)";
    c.lineWidth = 0.9 * s;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const px = (-7 + col * 4.5) * s;
        const py = (-4 + row * 3.8) * s;
        c.beginPath();
        c.arc(px, py, 1.1 * s, 0, Math.PI * 2);
        c.stroke();
      }
    }

    drawCutePlantEyes(c, s, {
      y: 2,
      spread: 4,
      whiteR: 3.2,
      pupilR: 1.25,
      pupilColor: "#3e2723",
      pupilLX: 0.35,
      pupilLY: 0.15,
      pupilRX: -0.25,
      pupilRY: 0.1,
    });

    c.restore();
  }

  /** 藤、綠葉、紫葡萄串；成熟後朝同欄下方射出紫色子彈 */
  function drawGrapeCharacter(c, cx, cy, scale) {
    const s = scale;
    c.save();
    c.translate(cx, cy);

    c.strokeStyle = "#4e342e";
    c.lineWidth = 2.2 * s;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(0, 16 * s);
    c.quadraticCurveTo(2 * s, 4 * s, 0, -10 * s);
    c.stroke();

    c.fillStyle = "#558b2f";
    c.beginPath();
    c.ellipse(-9 * s, 4 * s, 8 * s, 5 * s, -0.45, 0, Math.PI * 2);
    c.ellipse(9 * s, 5 * s, 7 * s, 4.5 * s, 0.5, 0, Math.PI * 2);
    c.ellipse(0, 8 * s, 6 * s, 3.5 * s, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#33691e";
    c.lineWidth = 1 * s;
    c.stroke();

    const bunch = [
      [0, -8],
      [-3.5, -5],
      [3.5, -5],
      [0, -4],
      [-4, -1.5],
      [4, -1.5],
      [-2, 1],
      [2, 1],
      [0, 3],
    ];
    for (let i = 0; i < bunch.length; i++) {
      const [gx, gy] = bunch[i];
      c.fillStyle = i % 2 === 0 ? "#6a1b9a" : "#7b1fa2";
      c.beginPath();
      c.arc(gx * s, gy * s, 3.4 * s, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#38006b";
      c.lineWidth = 0.75 * s;
      c.stroke();
      c.fillStyle = "rgba(255,255,255,0.35)";
      c.beginPath();
      c.arc((gx - 0.9) * s, (gy - 0.9) * s, 1 * s, 0, Math.PI * 2);
      c.fill();
    }

    drawCutePlantEyes(c, s, {
      y: -11.2,
      spread: 4.35,
      whiteR: 3.25,
      pupilR: 1.35,
      pupilColor: "#4a148c",
      pupilLX: 0.4,
      pupilLY: 0.25,
      pupilRX: -0.3,
      pupilRY: 0.2,
    });

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

  function getGrapeIconDataUrl() {
    if (grapeIconDataUrl) return grapeIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawGrapeCharacter(ictx, 20, 26, 0.88);
      grapeIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return grapeIconDataUrl;
  }

  function getPineappleIconDataUrl() {
    if (pineappleIconDataUrl) return pineappleIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawPineappleCharacter(ictx, 20, 26, 0.72);
      pineappleIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return pineappleIconDataUrl;
  }

  function drawProjectile(pr) {
    const r = pr.src === "grape" ? 6.5 : 7;
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
    if (pr.src === "grape") {
      ctx.fillStyle = "#8e24aa";
      ctx.fill();
      ctx.strokeStyle = "#4a148c";
    } else {
      ctx.fillStyle = "#d32f2f";
      ctx.fill();
      ctx.strokeStyle = "#b71c1c";
    }
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

  /** @param {{ x: number, y: number, hp: number }} b */
  function drawBeetleWorld(b, showHp, worldScale) {
    const x = b.x;
    const y = b.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const wobble = Math.sin(performance.now() / 118) * 0.06;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wobble);
    ctx.scale(sc, sc);

    ctx.strokeStyle = "#4e342e";
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      const ly = 5 + i * 3.2;
      ctx.beginPath();
      ctx.moveTo(-13, ly);
      ctx.quadraticCurveTo(-17, ly + 2, -18, ly + 6);
      ctx.moveTo(13, ly);
      ctx.quadraticCurveTo(17, ly + 2, 18, ly + 6);
      ctx.stroke();
    }

    const shell = ctx.createRadialGradient(-5, -1, 1, 2, 4, 17);
    shell.addColorStop(0, "#81c784");
    shell.addColorStop(0.35, "#388e3c");
    shell.addColorStop(0.65, "#1b5e20");
    shell.addColorStop(1, "#0d2818");
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.ellipse(0, 3, 14, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b3a1a";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 13);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(-6, -1, 6.5, 4.5, -0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#263238";
    ctx.beginPath();
    ctx.ellipse(0, -9, 6.2, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#102027";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3.5, -12);
    ctx.lineTo(-7, -19);
    ctx.moveTo(3.5, -12);
    ctx.lineTo(7, -19);
    ctx.stroke();
    ctx.fillStyle = "#6d4c41";
    ctx.beginPath();
    ctx.arc(-7, -19, 1.2, 0, Math.PI * 2);
    ctx.arc(7, -19, 1.2, 0, Math.PI * 2);
    ctx.fill();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(b.hp))), 0, 3);
    }

    ctx.restore();
  }

  /** 蜻蜓王：紅身、綠翅、體型較大 */
  /** @param {{ x: number, y: number, hp: number }} m */
  function drawDragonflyWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1.18 : worldScale;
    const flap = Math.sin(performance.now() / 62) * 0.11;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    const wingG = ctx.createLinearGradient(-25, 0, -8, 5);
    wingG.addColorStop(0, "rgba(129, 199, 132, 0.92)");
    wingG.addColorStop(0.5, "rgba(56, 142, 60, 0.88)");
    wingG.addColorStop(1, "rgba(27, 94, 32, 0.75)");
    ctx.fillStyle = wingG;
    ctx.beginPath();
    ctx.ellipse(-24, -1 + flap * 7, 20, 12, -0.42 + flap * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wingG;
    ctx.beginPath();
    ctx.ellipse(24, -1 + flap * 7, 20, 12, 0.42 - flap * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(46, 125, 50, 0.95)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-24, -1 + flap * 7, 20, 12, -0.42 + flap * 0.12, 0, Math.PI * 2);
    ctx.ellipse(24, -1 + flap * 7, 20, 12, 0.42 - flap * 0.12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.7;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(side * 10, -6 + k * 3);
        ctx.lineTo(side * 22, 2 + k * 2.5 + flap * 5);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "#c62828";
    ctx.beginPath();
    ctx.ellipse(0, -8, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8e0000";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#b71c1c";
    for (let seg = 0; seg < 5; seg++) {
      const ry = 2 + seg * 3.6;
      const rw = 8 - seg * 0.65;
      ctx.beginPath();
      ctx.ellipse(0, ry, rw, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.arc(0, -16, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b71c1c";
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = "#1b5e20";
    ctx.beginPath();
    ctx.ellipse(-4.5, -17, 3.2, 4.5, -0.25, 0, Math.PI * 2);
    ctx.ellipse(4.5, -17, 3.2, 4.5, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(-5.5, -18, 1.1, 0, Math.PI * 2);
    ctx.arc(3.5, -18, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, -20);
    ctx.lineTo(-5, -26);
    ctx.moveTo(3, -20);
    ctx.lineTo(5, -26);
    ctx.stroke();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 3;
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 22);
      ctx.shadowBlur = 0;
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

  /** @param {{ x: number, y: number, hp: number }} m */
  function drawLizardWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#689f38";
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#33691e";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "#558b2f";
    ctx.beginPath();
    ctx.ellipse(10, 0, 8, 7, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff59d";
    ctx.beginPath();
    ctx.arc(13, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(14, -2, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#33691e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.quadraticCurveTo(-18, 10, -22, 18);
    ctx.stroke();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 14);
    }
    ctx.restore();
  }

  /** @param {{ x: number, y: number, hp: number }} m */
  function drawSnakeWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const w = Math.sin(performance.now() / 140) * 0.15;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(w);
    ctx.scale(sc, sc);
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.quadraticCurveTo(-4, -4, 14, 2);
    ctx.stroke();
    ctx.strokeStyle = "#1b5e20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -1);
    ctx.lineTo(18, -4);
    ctx.stroke();
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(16, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(17, -2, 0.85, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 16);
    }
    ctx.restore();
  }

  /** @param {{ x: number, y: number, hp: number }} m */
  function drawJayWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const flap = Math.sin(performance.now() / 72) * 0.12;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#1565c0";
    ctx.beginPath();
    ctx.ellipse(-14, 2 + flap * 6, 12, 8, -0.35 + flap * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0d47a1";
    ctx.beginPath();
    ctx.ellipse(12, 4 + flap * 5, 11, 7, 0.4 - flap * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eceff1";
    ctx.beginPath();
    ctx.ellipse(0, 6, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#37474f";
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(20, -8);
    ctx.lineTo(8, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-1, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 18);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function drawMobWorld(m, showHp) {
    if (m.type === "dragonfly") drawDragonflyWorld(m, showHp, 1.18);
    else if (m.type === "butterfly") drawButterflyWorld(m, showHp);
    else if (m.type === "raven") drawRavenWorld(m, showHp, 1.05);
    else if (m.type === "beetle") drawBeetleWorld(m, showHp, 1);
    else if (m.type === "lizard") drawLizardWorld(m, showHp, 0.95);
    else if (m.type === "snake") drawSnakeWorld(m, showHp, 0.92);
    else if (m.type === "jay") drawJayWorld(m, showHp, 0.88);
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
      const ps = plantDrawScale(p);
      if (!p.mature) {
        const total = growTotalForFieldKind(pk);
        const t = Math.min(1, Math.max(0, 1 - p.growLeft / total));
        ctx.fillStyle =
          pk === "fern" ? "#2e4a2e" : pk === "grape" ? "#4a148c" : pk === "pineapple" ? "#5d4037" : "#4a3728";
        ctx.beginPath();
        ctx.arc(cx, cy - 4 + 8 * (1 - t), (6 + 4 * t) * ps, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(Math.ceil(p.growLeft) + "s", cx, cy + 14 * ps);
      } else if (pk === "fern") {
        drawFernCharacter(ctx, cx, cy + 2, 0.78 * ps);
      } else if (pk === "grape") {
        drawGrapeCharacter(ctx, cx, cy + 2, 0.78 * ps);
      } else if (pk === "pineapple") {
        drawPineappleCharacter(ctx, cx, cy + 2, 0.72 * ps);
      } else {
        drawStrawberryCharacter(ctx, cx, cy - 2, 1 * ps);
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
    ctx.fillText("商店", shopRect.x + shopRect.w / 2, shopRect.y + 24);
    ctx.font = "9px sans-serif";
    ctx.fillText("苗 $" + STRAWBERRY_COST + " · 5s", shopRect.x + shopRect.w / 2, shopRect.y + 40);
    ctx.fillText("蕨 $" + FERN_COST + " · 10s 近2／s", shopRect.x + shopRect.w / 2, shopRect.y + 52);
    ctx.fillText("葡 $" + GRAPE_COST + " · 15s 射擊", shopRect.x + shopRect.w / 2, shopRect.y + 64);
    ctx.fillText("鳳 $" + PINEAPPLE_COST + " · " + GROW_TIME_PINEAPPLE + "s 近15／s", shopRect.x + shopRect.w / 2, shopRect.y + 76);
    ctx.fillText("靠近開選單", shopRect.x + shopRect.w / 2, shopRect.y + 90);
  }

  function drawGearShop() {
    ctx.fillStyle = "#455a64";
    ctx.fillRect(gearShopRect.x, gearShopRect.y, gearShopRect.w, gearShopRect.h);
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 3;
    ctx.strokeRect(gearShopRect.x, gearShopRect.y, gearShopRect.w, gearShopRect.h);
    ctx.fillStyle = "#eceff1";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("道具店", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 22);
    ctx.font = "10px sans-serif";
    ctx.fillText("鏟 $" + SHOVEL_COST, gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 42);
    ctx.fillStyle = "#b0bec5";
    ctx.font = "9px sans-serif";
    ctx.fillText("剷除植株", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 58);
    ctx.fillText("靠近開選單", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 72);
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
    ctx.fillText("蜂／蝶／蟲／蜻王／烏鴉", sellShopRect.x + sellShopRect.w / 2, sellShopRect.y + 50);
  }

  function drawRebirthShop() {
    ctx.fillStyle = "#37474f";
    ctx.fillRect(rebirthShopRect.x, rebirthShopRect.y, rebirthShopRect.w, rebirthShopRect.h);
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 3;
    ctx.strokeRect(rebirthShopRect.x, rebirthShopRect.y, rebirthShopRect.w, rebirthShopRect.h);
    ctx.fillStyle = "#eceff1";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    const rcx = rebirthShopRect.x + rebirthShopRect.w / 2;
    ctx.fillText("轉生店", rcx, rebirthShopRect.y + 22);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#b0bec5";
    ctx.fillText("生成池升級", rcx, rebirthShopRect.y + 40);
    ctx.fillText("切換表", rcx, rebirthShopRect.y + 54);
    ctx.fillText("靠近開選單", rcx, rebirthShopRect.y + 72);
  }

  function drawSpawner() {
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const cx = spawnerRect.x + spawnerRect.w / 2;
    ctx.fillText("生成", cx, spawnerRect.y + 14);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#8bc34a";
    ctx.fillText("~" + getSpawnIntervalSec().toFixed(1).replace(/\.0$/, "") + "s／隻", cx, spawnerRect.y + 28);
    const untilBoss = Math.max(0, KILLS_PER_DRAGONFLY_BOSS - defeatCount);
    ctx.font = "8px sans-serif";
    ctx.fillStyle = "#ffcc80";
    ctx.fillText("距蜻蜓王：還需 " + untilBoss + " 隻", cx, spawnerRect.y + 42);
    const poolLabel =
      activeSpawnTable === 1 && spawnerUpgradeOwned ? "池：Upgrade 1" : "池：Default";
    ctx.fillStyle = "#90a4ae";
    ctx.fillText(poolLabel, cx, spawnerRect.y + 52);
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
        } else if (s.worker === "beetle") {
          drawBeetleWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "beetle" }, false, 0.62);
        } else if (s.worker === "raven") {
          drawRavenWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "raven" }, false, 0.5);
        } else if (s.worker === "dragonfly") {
          drawDragonflyWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "dragonfly" }, false, 0.38);
        } else if (s.worker === "lizard") {
          drawLizardWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "lizard" }, false, 0.42);
        } else if (s.worker === "snake") {
          drawSnakeWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "snake" }, false, 0.4);
        } else if (s.worker === "jay") {
          drawJayWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "jay" }, false, 0.4);
        }
        ctx.fillStyle = "#000";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        const rateLabel =
          s.worker === "dragonfly"
            ? "$17/s"
            : s.worker === "raven"
              ? "$10/s"
              : s.worker === "beetle"
                ? "$4/s"
                : s.worker === "butterfly"
                  ? "$2/s"
                  : s.worker === "lizard"
                    ? "$8/s"
                    : s.worker === "snake"
                      ? "$11/s"
                      : s.worker === "jay"
                        ? "$15/s"
                        : "$1/s";
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
      "中央綠道起始解鎖 · 草莓／葡萄射擊 · 蕨／鳳梨近戰 · 種下時 5% 巨型（2× 體型／傷害；兌換蕨種除外） · 左下道具店鏟子 · 解鎖道生成 −1 秒 · 百隻出蜻蜓王 · 右下轉生店升級生成池",
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
    drawGearShop();
    drawSellShop();
    drawRebirthShop();
    for (const mob of mobs) drawMobWorld(mob);
    drawPlayer();

    requestAnimationFrame(loop);
  }

  if (sellRavenPriceEl) sellRavenPriceEl.textContent = String(SELL_RAVEN_PRICE);
  if (sellBeetlePriceEl) sellBeetlePriceEl.textContent = String(SELL_BEETLE_PRICE);
  if (sellDragonflyPriceEl) sellDragonflyPriceEl.textContent = String(SELL_DRAGONFLY_PRICE);
  if (sellLizardPriceEl) sellLizardPriceEl.textContent = String(SELL_LIZARD_PRICE);
  if (sellSnakePriceEl) sellSnakePriceEl.textContent = String(SELL_SNAKE_PRICE);
  if (sellJayPriceEl) sellJayPriceEl.textContent = String(SELL_JAY_PRICE);
  if (shovelPriceEl) shovelPriceEl.textContent = String(SHOVEL_COST);
  if (pineapplePriceEl) pineapplePriceEl.textContent = String(PINEAPPLE_COST);

  buildInvSlots();
  loadGame();
  refreshInvUi();
  updateRebirthModal();
  requestAnimationFrame(loop);
})();
