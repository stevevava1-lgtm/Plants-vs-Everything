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
  const btnBuyAppleTree = document.getElementById("btnBuyAppleTree");
  const appleTreePriceEl = document.getElementById("appleTreePrice");
  const btnBuyCoral = document.getElementById("btnBuyCoral");
  const coralPriceEl = document.getElementById("coralPrice");
  const btnClose = document.getElementById("btnClose");
  const btnBuyShovel = document.getElementById("btnBuyShovel");
  const btnBuyReclaimer = document.getElementById("btnBuyReclaimer");
  const btnCloseGear = document.getElementById("btnCloseGear");
  const shovelPriceEl = document.getElementById("shovelPrice");
  const reclaimerPriceEl = document.getElementById("reclaimerPrice");
  const favoriteModal = document.getElementById("favoriteModal");
  const favoriteGridEl = document.getElementById("favoriteGrid");
  const btnCloseFavorite = document.getElementById("btnCloseFavorite");
  const btnSellSelected = document.getElementById("btnSellSelected");
  const btnSellOne = document.getElementById("btnSellOne");
  const btnSellAll = document.getElementById("btnSellAll");
  const btnCloseSell = document.getElementById("btnCloseSell");
  const btnCloseBackpack = document.getElementById("btnCloseBackpack");
  const settingsModal = document.getElementById("settingsModal");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const enemyDexModal = document.getElementById("enemyDexModal");
  const enemyDexGridEl = document.getElementById("enemyDexGrid");
  const btnOpenEnemyDex = document.getElementById("btnOpenEnemyDex");
  const btnCloseEnemyDex = document.getElementById("btnCloseEnemyDex");
  const btnWipeProgress = document.getElementById("btnWipeProgress");
  const codeInput = document.getElementById("codeInput");
  const btnRedeemCode = document.getElementById("btnRedeemCode");
  const rebirthModal = document.getElementById("rebirthModal");
  const btnUnlockSpawner = document.getElementById("btnUnlockSpawner");
  const btnSpawnerDefault = document.getElementById("btnSpawnerDefault");
  const btnSpawnerUpgrade = document.getElementById("btnSpawnerUpgrade");
  const btnUnlockBeach = document.getElementById("btnUnlockBeach");
  const btnSpawnerBeach = document.getElementById("btnSpawnerBeach");
  const btnCloseRebirth = document.getElementById("btnCloseRebirth");
  const sellRavenPriceEl = document.getElementById("sellRavenPrice");
  const sellBeetlePriceEl = document.getElementById("sellBeetlePrice");
  const sellDragonflyPriceEl = document.getElementById("sellDragonflyPrice");
  const sellLizardPriceEl = document.getElementById("sellLizardPrice");
  const sellSnakePriceEl = document.getElementById("sellSnakePrice");
  const sellJayPriceEl = document.getElementById("sellJayPrice");
  const sellRobinPriceEl = document.getElementById("sellRobinPrice");
  const sellHawkPriceEl = document.getElementById("sellHawkPrice");

  const PLANT_SLOTS = 10;
  const ENEMY_SLOTS = 100;
  const SAVE_KEY = "plantsVsEverythingSaveV1";
  const REDEMPTION_CODES_KEY = "plantsVsEverythingRedeemedCodes";
  /** Case-sensitive; redeem for 1 pineapple seedling */
  const CODE_REWARD_PINEAPPLE = "HXO1";
  /** Redeem for 1 mega fern seedling (2× size and melee damage when planted) */
  const CODE_REWARD_MEGA_FERN = "B154ERN";
  /** Redeem for 1 mega apple tree seedling (2× size and apple damage when planted) */
  const CODE_REWARD_APPLE_TREE_MEGA = "H6VY43";
  /** Normal seedlings may roll mega on plant (2× draw and damage; projectile look unchanged) */
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
  /** Grape: 1 damage per shot, fire interval (seconds) */
  const GRAPE_SHOOT_INTERVAL = 0.3;
  const GRAPE_COST = 500;
  const PINEAPPLE_COST = 2000;
  /** Pineapple: melee in lane when mature, same range check as fern */
  const GROW_TIME_PINEAPPLE = 12;
  const PINEAPPLE_DPS = 15;
  /** Apple tree: $5000, 1 apple per second, 15 damage each */
  const APPLE_TREE_COST = 5000;
  const GROW_TIME_APPLE_TREE = 18;
  const APPLE_TREE_SHOOT_INTERVAL = 1;
  const APPLE_TREE_DMG = 15;
  /** Coral: buy only on ocean map; 30/s melee in ocean, 10/s out and grayed; 10s to recover when back */
  const CORAL_COST = 5000;
  const GROW_TIME_CORAL = 12;
  const CORAL_DPS_FULL = 30;
  const CORAL_DPS_WEAK = 10;
  const CORAL_RECOVER_SEC = 10;
  /** Ocean map: sea grass grows on empty green cells; retextured fern look */
  const SEA_GRASS_GROW_TIME = 10;
  const SEA_GRASS_DIE_OFF_TIME = 5;
  const SHOVEL_COST = 35;
  const RECLAIMER_COST = 100;
  const FAVORITE_SLOTS = 50;
  /** Fern / pineapple melee: same lane, in front of plant toward spawn side */
  const FERN_MELEE_RANGE = 72;
  const SPAWN_INTERVAL_BASE = 7;
  /** Each extra unlocked lane −1s spawn interval (center starter lane not counted) */
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
  const ROBIN_HP = 120;
  const ROBIN_SPEED = 28;
  const ROBIN_DOLLAR_PER_SEC = 17;
  const SELL_ROBIN_PRICE = 48;
  const HAWK_HP = 300;
  const HAWK_SPEED = 22;
  const HAWK_DOLLAR_PER_SEC = 21;
  const SELL_HAWK_PRICE = 95;
  /** 5% mega mobs: 2× draw, gray-slot income 2× */
  const MEGA_MOB_CHANCE = 0.05;
  /** Rebirth shop: unlocks upgraded spawn pool */
  const SPAWNER_UPGRADE_COST_MONEY = 4000;
  const SPAWNER_UPGRADE_DRAGONFLIES = 3;
  /** Beach rebirth: $100k + 3 hawks + 5 robins → beach map and ocean spawn table */
  const BEACH_REBIRTH_COST_MONEY = 100000;
  const BEACH_REBIRTH_HAWKS = 3;
  const BEACH_REBIRTH_ROBINS = 5;
  /** Beach table: weight ratio 1 : 1/3 : 1/7 : 1/10 : 1/50 (~mackerel 63% … eel 1.3%) */
  const MOB_SPAWN_WEIGHTS_BEACH = [
    { type: "mackerel", weight: 1050 },
    { type: "clownfish", weight: 350 },
    { type: "lionfish", weight: 150 },
    { type: "lemon_shark", weight: 105 },
    { type: "eel", weight: 21 },
  ];
  const MACKEREL_HP = 70;
  const MACKEREL_SPEED = 32;
  const MACKEREL_DOLLAR_PER_SEC = 17;
  const SELL_MACKEREL_PRICE = 28;
  const CLOWNFISH_HP = 120;
  const CLOWNFISH_SPEED = 30;
  const CLOWNFISH_DOLLAR_PER_SEC = 20;
  const SELL_CLOWNFISH_PRICE = 44;
  const LIONFISH_HP = 170;
  const LIONFISH_SPEED = 28;
  const LIONFISH_DOLLAR_PER_SEC = 21;
  const SELL_LIONFISH_PRICE = 60;
  const LEMON_SHARK_HP = 200;
  const LEMON_SHARK_SPEED = 26;
  const LEMON_SHARK_DOLLAR_PER_SEC = 23;
  const SELL_LEMON_SHARK_PRICE = 76;
  const EEL_HP = 250;
  const EEL_SPEED = 24;
  const EEL_DOLLAR_PER_SEC = 25;
  const SELL_EEL_PRICE = 92;
  const HAMMERHEAD_HP = 400;
  const HAMMERHEAD_SPEED = 22;
  const HAMMERHEAD_DOLLAR_PER_SEC = 33;
  const SELL_HAMMERHEAD_PRICE = 118;
  const GREAT_WHITE_HP = 1000;
  const GREAT_WHITE_SPEED = 18;
  const GREAT_WHITE_DOLLAR_PER_SEC = 100;
  const SELL_GREAT_WHITE_PRICE = 360;
  const KILLS_PER_HAMMERHEAD_BOSS = 100;
  const KILLS_PER_GREAT_WHITE_BOSS = 1000;

  /** Weights 3:2:1 (bee:butterfly:beetle); beetle ~1/6 */
  const MOB_SPAWN_WEIGHTS = [
    { type: "bee", weight: 3 },
    { type: "butterfly", weight: 2 },
    { type: "beetle", weight: 1 },
  ];
  /** Upgrade pool: total weight 50, robin 1/50; others scaled proportionally */
  const MOB_SPAWN_WEIGHTS_UPGRADE = [
    { type: "lizard", weight: 32 },
    { type: "snake", weight: 12 },
    { type: "jay", weight: 5 },
    { type: "robin", weight: 1 },
  ];

  /** Gray slot 1 free; slots 2–10 map to indices 1–9 */
  const GRAY_SLOT_UNLOCK_PRICE = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 30000];

  /** Center lane (col 3) free; six others outward from center: left 300/600/1200, right 2400/4800/9600 */
  const LANE_UNLOCK_PRICE = [300, 600, 1200, 0, 2400, 4800, 9600];

  const shopRect = { x: 40, y: 208, w: 100, h: 196 };
  const gearShopRect = { x: 40, y: 392, w: 100, h: 100 };
  const favoriteBoxRect = { x: 40, y: 496, w: 100, h: 72 };
  const sellShopRect = { x: 780, y: 220, w: 100, h: 140 };
  const rebirthShopRect = { x: 780, y: 365, w: 100, h: 96 };
  const spawnerRect = {
    x: GRID_X + 4,
    y: GRID_Y + ROWS * CELL + 6,
    w: COLS * CELL - 8,
    h: 72,
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
      /** @type {null | 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly' | 'lizard' | 'snake' | 'jay' | 'robin' | 'hawk'} */
      worker: null,
      workerMega: false,
    });
  }

  /** Only center green lane (col 3) starts unlocked */
  const laneUnlocked = [false, false, false, true, false, false, false];

  /** @type {(null | 'seed' | 'fern' | 'fern_mega' | 'grape' | 'pineapple' | 'apple_tree' | 'apple_tree_mega' | 'coral' | 'coral_mega')[]} */
  const plantInv = new Array(PLANT_SLOTS).fill(null);
  /** @type {(null | 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly' | 'lizard' | 'snake' | 'jay' | 'robin' | 'hawk')[]} */
  const enemyInv = new Array(ENEMY_SLOTS).fill(null);
  const enemyInvMega = new Array(ENEMY_SLOTS).fill(false);

  let selectedPlantSlot = -1;
  let selectedEnemySlot = -1;
  /** @type {null | 'shovel' | 'reclaimer'} */
  let selectedGear = null;
  let shovelCount = 0;
  let reclaimerCount = 0;
  /** @type {({ cat: 'plant' | 'enemy', item: string, mega?: boolean } | null)[]} */
  const favoriteBox = new Array(FAVORITE_SLOTS).fill(null);
  /** @type {null | 'buy' | 'sell' | 'gear' | 'rebirth' | 'favorite'} */
  let activeModal = null;
  let money = 20;
  let invPanelVisible = false;

  /** Backpack icons (procedurally drawn cache) */
  let strawberrySeedIconDataUrl = "";
  let fernIconDataUrl = "";
  let grapeIconDataUrl = "";
  let pineappleIconDataUrl = "";
  let appleTreeIconDataUrl = "";
  let coralIconDataUrl = "";

  const keys = {};
  const player = {
    x: GRID_X + (COLS * CELL) / 2,
    y: GRID_Y + ROWS * CELL + 80,
    r: 14,
    speed: 180,
  };

  /** @type {{ row: number, col: number, kind: 'strawberry' | 'fern' | 'grape' | 'pineapple' | 'apple_tree' | 'coral', growLeft: number, mature: boolean, shootCd: number, mega?: boolean, coralR?: number, coralG?: number, coralB?: number, coralStressed?: boolean, coralRecoverLeft?: number }[]} */
  const plants = [];

  /** @type {(null | { growAcc: number, mature?: boolean, dying?: boolean, dieLeft?: number })[][]} */
  const seaGrassGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  let lastWasOceanMap = false;

  /** @type {{ x: number, y: number, hp: number, speed: number, type: 'bee' | 'butterfly' | 'raven' | 'beetle' | 'dragonfly' | 'lizard' | 'snake' | 'jay' | 'robin' | 'hawk', lane: number, mega?: boolean }[]} */
  const mobs = [];

  /** @type {{ x: number, y: number, vx: number, vy: number, dmg: number, lane: number, src?: 'strawberry' | 'grape' | 'apple' }[]} */
  const projectiles = [];

  let spawnAcc = 0;
  let anyMaturePlant = false;
  let toastTimer = 0;
  let saveAcc = 0;
  /** Kills that entered inventory (full bag not counted); every 100 spawns dragonfly boss (non-ocean pool) */
  let defeatCount = 0;
  /** Ocean pool kill total (monotonic; hammerhead every 100, great white every 1000, separate progress) */
  let beachTotalKills = 0;
  /** Paid unlock for upgraded spawn table */
  let spawnerUpgradeOwned = false;
  /** Beach rebirth unlock (map + ocean pool) */
  let beachRebirthOwned = false;
  /** 0 = default pool, 1 = upgrade pool, 2 = beach ocean pool (needs beach unlock) */
  let activeSpawnTable = 0;

  function isOceanMap() {
    return activeSpawnTable === 2 && beachRebirthOwned;
  }

  function isValidEnemyWorker(w) {
    return (
      w === "bee" ||
      w === "butterfly" ||
      w === "raven" ||
      w === "beetle" ||
      w === "dragonfly" ||
      w === "lizard" ||
      w === "snake" ||
      w === "jay" ||
      w === "robin" ||
      w === "hawk" ||
      w === "mackerel" ||
      w === "clownfish" ||
      w === "lionfish" ||
      w === "lemon_shark" ||
      w === "eel" ||
      w === "hammerhead" ||
      w === "great_white"
    );
  }

  const ENEMY_DEX_ORDER = [
    "bee",
    "butterfly",
    "beetle",
    "raven",
    "dragonfly",
    "lizard",
    "snake",
    "jay",
    "robin",
    "hawk",
    "mackerel",
    "clownfish",
    "lionfish",
    "lemon_shark",
    "eel",
    "hammerhead",
    "great_white",
  ];

  const ENEMY_DEX_NAMES = {
    bee: "Bee",
    butterfly: "Butterfly",
    beetle: "Beetle",
    raven: "Raven",
    dragonfly: "Dragonfly",
    lizard: "Lizard",
    snake: "Snake",
    jay: "Jay",
    robin: "Robin",
    hawk: "Hawk",
    mackerel: "Mackerel",
    clownfish: "Clownfish",
    lionfish: "Lionfish",
    lemon_shark: "Lemon shark",
    eel: "Eel",
    hammerhead: "Hammerhead",
    great_white: "Great white",
  };

  /** @type {Record<string, boolean>} */
  const enemyDexCollected = {};

  function registerEnemyDex(kind) {
    if (!isValidEnemyWorker(kind)) return;
    enemyDexCollected[kind] = true;
  }

  function loadEnemyDexFromSave(arr) {
    for (let i = 0; i < ENEMY_DEX_ORDER.length; i++) delete enemyDexCollected[ENEMY_DEX_ORDER[i]];
    if (Array.isArray(arr)) {
      arr.forEach((t) => {
        if (typeof t === "string" && isValidEnemyWorker(t)) enemyDexCollected[t] = true;
      });
    }
  }

  function syncEnemyDexFromInventory() {
    for (let i = 0; i < enemyInv.length; i++) {
      if (isValidEnemyWorker(enemyInv[i])) registerEnemyDex(enemyInv[i]);
    }
    graySlots.forEach((s) => {
      if (s.worker && isValidEnemyWorker(s.worker)) registerEnemyDex(s.worker);
    });
    for (let i = 0; i < favoriteBox.length; i++) {
      const e = favoriteBox[i];
      if (e && e.cat === "enemy" && isValidEnemyWorker(e.item)) registerEnemyDex(e.item);
    }
  }

  function enemyDexIconClass(type) {
    return "icon-" + type.replace(/_/g, "-");
  }

  function renderEnemyDex() {
    if (!enemyDexGridEl) return;
    enemyDexGridEl.innerHTML = "";
    for (let i = 0; i < ENEMY_DEX_ORDER.length; i++) {
      const type = ENEMY_DEX_ORDER[i];
      const cell = document.createElement("div");
      cell.className = "enemy-dex-cell";
      cell.setAttribute("role", "listitem");
      if (type === "raven") {
        cell.classList.add("enemy-dex-raven");
        const lim = document.createElement("div");
        lim.className = "enemy-dex-limited-tag";
        lim.textContent = "Limited";
        cell.appendChild(lim);
      }
      const known = !!enemyDexCollected[type];
      if (known) {
        cell.classList.add("enemy-dex-known");
        const wrap = document.createElement("div");
        wrap.className = "enemy-dex-icon-wrap";
        const icon = document.createElement("span");
        icon.className = "enemy-dex-icon " + enemyDexIconClass(type);
        icon.setAttribute("aria-hidden", "true");
        wrap.appendChild(icon);
        cell.appendChild(wrap);
        const label = document.createElement("div");
        label.className = "enemy-dex-label";
        label.textContent = ENEMY_DEX_NAMES[type] || type;
        cell.appendChild(label);
      } else {
        cell.classList.add("enemy-dex-unknown");
        const q = document.createElement("div");
        q.className = "enemy-dex-q";
        q.textContent = "?";
        q.setAttribute("aria-label", "Unknown");
        cell.appendChild(q);
        const label = document.createElement("div");
        label.className = "enemy-dex-label";
        label.textContent = "?";
        cell.appendChild(label);
      }
      enemyDexGridEl.appendChild(cell);
    }
  }

  function openEnemyDexModal() {
    if (settingsModal) settingsModal.classList.add("hidden");
    if (enemyDexModal) {
      renderEnemyDex();
      enemyDexModal.classList.remove("hidden");
    }
  }

  function closeEnemyDexModal() {
    if (enemyDexModal) enemyDexModal.classList.add("hidden");
  }

  function enemyMobDrawScale(m) {
    return m.mega ? 2 : 1;
  }

  function dollarPerSecForGrayWorker(worker) {
    if (worker === "bee") return BEE_DOLLAR_PER_SEC;
    if (worker === "butterfly") return BUTTERFLY_DOLLAR_PER_SEC;
    if (worker === "raven") return RAVEN_DOLLAR_PER_SEC;
    if (worker === "beetle") return BEETLE_DOLLAR_PER_SEC;
    if (worker === "dragonfly") return DRAGONFLY_DOLLAR_PER_SEC;
    if (worker === "lizard") return LIZARD_DOLLAR_PER_SEC;
    if (worker === "snake") return SNAKE_DOLLAR_PER_SEC;
    if (worker === "jay") return JAY_DOLLAR_PER_SEC;
    if (worker === "robin") return ROBIN_DOLLAR_PER_SEC;
    if (worker === "hawk") return HAWK_DOLLAR_PER_SEC;
    if (worker === "mackerel") return MACKEREL_DOLLAR_PER_SEC;
    if (worker === "clownfish") return CLOWNFISH_DOLLAR_PER_SEC;
    if (worker === "lionfish") return LIONFISH_DOLLAR_PER_SEC;
    if (worker === "lemon_shark") return LEMON_SHARK_DOLLAR_PER_SEC;
    if (worker === "eel") return EEL_DOLLAR_PER_SEC;
    if (worker === "hammerhead") return HAMMERHEAD_DOLLAR_PER_SEC;
    if (worker === "great_white") return GREAT_WHITE_DOLLAR_PER_SEC;
    return 0;
  }

  function countDragonfliesInInv() {
    return enemyInv.filter((x) => x === "dragonfly").length;
  }

  /** @returns {boolean} true if n dragonflies were removed from inventory */
  function consumeDragonfliesFromInv(n) {
    let left = n;
    for (let i = 0; i < enemyInv.length && left > 0; i++) {
      if (enemyInv[i] === "dragonfly") {
        enemyInv[i] = null;
        enemyInvMega[i] = false;
        left--;
      }
    }
    return left === 0;
  }

  function countHawksInInv() {
    return enemyInv.filter((x) => x === "hawk").length;
  }

  function countRobinsInInv() {
    return enemyInv.filter((x) => x === "robin").length;
  }

  /** @returns {boolean} */
  function consumeHawksFromInv(n) {
    let left = n;
    for (let i = 0; i < enemyInv.length && left > 0; i++) {
      if (enemyInv[i] === "hawk") {
        enemyInv[i] = null;
        enemyInvMega[i] = false;
        left--;
      }
    }
    return left === 0;
  }

  /** @returns {boolean} */
  function consumeRobinsFromInv(n) {
    let left = n;
    for (let i = 0; i < enemyInv.length && left > 0; i++) {
      if (enemyInv[i] === "robin") {
        enemyInv[i] = null;
        enemyInvMega[i] = false;
        left--;
      }
    }
    return left === 0;
  }

  function syncSpawnTableState() {
    if (activeSpawnTable === 2 && !beachRebirthOwned) activeSpawnTable = 0;
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
      /* quota full or private mode */
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
      showWarning("No unlocked lane — dragonfly boss cannot spawn.");
      return;
    }
    const cx = laneCenterX(lane);
    const sy = spawnerRect.y - 8;
    const mega = Math.random() < MEGA_MOB_CHANCE;
    mobs.push({
      x: cx,
      y: sy,
      hp: DRAGONFLY_HP,
      speed: DRAGONFLY_SPEED,
      type: "dragonfly",
      lane,
      mega,
    });
    showSuccess("Dragonfly boss spawned!");
  }

  function trySpawnHawkBoss() {
    const lane = pickRandomOpenLane();
    if (lane < 0) {
      showWarning("No unlocked lane — hawk cannot spawn.");
      return;
    }
    const cx = laneCenterX(lane);
    const sy = spawnerRect.y - 8;
    const mega = Math.random() < MEGA_MOB_CHANCE;
    mobs.push({
      x: cx,
      y: sy,
      hp: HAWK_HP,
      speed: HAWK_SPEED,
      type: "hawk",
      lane,
      mega,
    });
    showSuccess("Hawk spawned!");
  }

  function trySpawnHammerheadBoss() {
    const lane = pickRandomOpenLane();
    if (lane < 0) {
      showWarning("No unlocked lane — hammerhead cannot spawn.");
      return;
    }
    const cx = laneCenterX(lane);
    const sy = spawnerRect.y - 8;
    const mega = Math.random() < MEGA_MOB_CHANCE;
    mobs.push({
      x: cx,
      y: sy,
      hp: HAMMERHEAD_HP,
      speed: HAMMERHEAD_SPEED,
      type: "hammerhead",
      lane,
      mega,
    });
    showSuccess("Hammerhead spawned!");
  }

  function trySpawnGreatWhiteBoss() {
    const lane = pickRandomOpenLane();
    if (lane < 0) {
      showWarning("No unlocked lane — great white cannot spawn.");
      return;
    }
    const cx = laneCenterX(lane);
    const sy = spawnerRect.y - 8;
    const mega = Math.random() < MEGA_MOB_CHANCE;
    mobs.push({
      x: cx,
      y: sy,
      hp: GREAT_WHITE_HP,
      speed: GREAT_WHITE_SPEED,
      type: "great_white",
      lane,
      mega,
    });
    showSuccess("Great white shark spawned!");
  }

  function registerEnemyDefeatForBoss() {
    syncSpawnTableState();
    if (activeSpawnTable === 2 && beachRebirthOwned) {
      beachTotalKills += 1;
      if (beachTotalKills > 0 && beachTotalKills % KILLS_PER_GREAT_WHITE_BOSS === 0) {
        trySpawnGreatWhiteBoss();
      } else if (beachTotalKills > 0 && beachTotalKills % KILLS_PER_HAMMERHEAD_BOSS === 0) {
        trySpawnHammerheadBoss();
      }
      return;
    }
    defeatCount += 1;
    syncSpawnTableState();
    while (defeatCount >= KILLS_PER_DRAGONFLY_BOSS) {
      defeatCount -= KILLS_PER_DRAGONFLY_BOSS;
      syncSpawnTableState();
      if (activeSpawnTable === 1 && spawnerUpgradeOwned) trySpawnHawkBoss();
      else trySpawnDragonflyBoss();
    }
  }

  function getSavePayload() {
    return {
      v: 1,
      money,
      laneUnlocked: laneUnlocked.slice(),
      gray: graySlots.map((s) => ({
        locked: !!s.locked,
        worker: s.worker,
        workerMega: !!s.workerMega,
      })),
      plantInv: plantInv.slice(),
      enemyInv: enemyInv.slice(),
      enemyInvMega: enemyInvMega.slice(),
      plants: plants.map((p) => {
        const o = {
          row: p.row,
          col: p.col,
          kind: p.kind || "strawberry",
          growLeft: p.growLeft,
          mature: p.mature,
          shootCd: p.shootCd,
          mega: !!p.mega,
        };
        if (p.kind === "coral") {
          o.coralR = typeof p.coralR === "number" ? p.coralR : 200;
          o.coralG = typeof p.coralG === "number" ? p.coralG : 120;
          o.coralB = typeof p.coralB === "number" ? p.coralB : 160;
          o.coralStressed = !!p.coralStressed;
          o.coralRecoverLeft = Math.max(0, typeof p.coralRecoverLeft === "number" ? p.coralRecoverLeft : 0);
        }
        return o;
      }),
      mobs: mobs.map((m) => ({
        x: m.x,
        y: m.y,
        hp: m.hp,
        speed: m.speed,
        type: m.type,
        lane: m.lane,
        mega: !!m.mega,
      })),
      projectiles: projectiles.map((pr) => ({
        x: pr.x,
        y: pr.y,
        vx: pr.vx,
        vy: pr.vy,
        dmg: pr.dmg,
        lane: pr.lane,
        src: pr.src === "grape" ? "grape" : pr.src === "apple" ? "apple" : "strawberry",
      })),
      player: { x: player.x, y: player.y },
      spawnAcc,
      anyMaturePlant,
      defeatCount,
      beachTotalKills,
      shovelCount,
      reclaimerCount,
      favorites: favoriteBox.map((e) =>
        e ? { cat: e.cat, item: e.item, mega: e.cat === "enemy" && e.mega ? true : undefined } : null
      ),
      spawnerUpgradeOwned,
      beachRebirthOwned,
      activeSpawnTable:
        activeSpawnTable === 2 ? 2 : activeSpawnTable === 1 ? 1 : 0,
      seaGrass: seaGrassGrid.map((row) =>
        row.map((cell) =>
          cell
            ? {
                growAcc: cell.growAcc,
                mature: !!cell.mature,
                dying: !!cell.dying,
                dieLeft: typeof cell.dieLeft === "number" ? cell.dieLeft : 0,
              }
            : null
        )
      ),
      enemyDex: ENEMY_DEX_ORDER.filter((t) => enemyDexCollected[t]),
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
          graySlots[i].workerMega = !!(g.workerMega && graySlots[i].worker);
        });
      }

      if (Array.isArray(raw.plantInv) && raw.plantInv.length === PLANT_SLOTS) {
        for (let i = 0; i < PLANT_SLOTS; i++) {
          const t = raw.plantInv[i];
          plantInv[i] =
            t === "seed" ||
            t === "fern" ||
            t === "fern_mega" ||
            t === "grape" ||
            t === "pineapple" ||
            t === "apple_tree" ||
            t === "apple_tree_mega" ||
            t === "coral" ||
            t === "coral_mega"
              ? t
              : null;
        }
      }

      if (Array.isArray(raw.enemyInv) && raw.enemyInv.length === ENEMY_SLOTS) {
        for (let i = 0; i < ENEMY_SLOTS; i++) {
          const t = raw.enemyInv[i];
          enemyInv[i] = isValidEnemyWorker(t) ? t : null;
        }
      }
      if (Array.isArray(raw.enemyInvMega) && raw.enemyInvMega.length === ENEMY_SLOTS) {
        for (let i = 0; i < ENEMY_SLOTS; i++) {
          enemyInvMega[i] = !!(raw.enemyInvMega[i] && enemyInv[i]);
        }
      } else {
        for (let i = 0; i < ENEMY_SLOTS; i++) enemyInvMega[i] = false;
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
                  : p.kind === "apple_tree"
                    ? "apple_tree"
                    : p.kind === "coral"
                      ? "coral"
                      : "strawberry";
          const pl = {
            row: p.row | 0,
            col: p.col | 0,
            kind: k,
            growLeft: Math.max(0, Number(p.growLeft) || 0),
            mature: !!p.mature,
            shootCd: Math.max(0, Number(p.shootCd) || 0),
            mega: !!p.mega,
          };
          if (k === "coral") {
            pl.coralR = Math.min(255, Math.max(0, Number(p.coralR) || 200));
            pl.coralG = Math.min(255, Math.max(0, Number(p.coralG) || 120));
            pl.coralB = Math.min(255, Math.max(0, Number(p.coralB) || 160));
            pl.coralStressed = !!p.coralStressed;
            pl.coralRecoverLeft = Math.max(0, typeof p.coralRecoverLeft === "number" ? p.coralRecoverLeft : CORAL_RECOVER_SEC);
          }
          plants.push(pl);
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
          } else if (m.type === "robin") {
            typ = "robin";
            spd = ROBIN_SPEED;
            maxHp = ROBIN_HP;
          } else if (m.type === "hawk") {
            typ = "hawk";
            spd = HAWK_SPEED;
            maxHp = HAWK_HP;
          } else if (m.type === "mackerel") {
            typ = "mackerel";
            spd = MACKEREL_SPEED;
            maxHp = MACKEREL_HP;
          } else if (m.type === "clownfish") {
            typ = "clownfish";
            spd = CLOWNFISH_SPEED;
            maxHp = CLOWNFISH_HP;
          } else if (m.type === "lionfish") {
            typ = "lionfish";
            spd = LIONFISH_SPEED;
            maxHp = LIONFISH_HP;
          } else if (m.type === "lemon_shark") {
            typ = "lemon_shark";
            spd = LEMON_SHARK_SPEED;
            maxHp = LEMON_SHARK_HP;
          } else if (m.type === "eel") {
            typ = "eel";
            spd = EEL_SPEED;
            maxHp = EEL_HP;
          } else if (m.type === "hammerhead") {
            typ = "hammerhead";
            spd = HAMMERHEAD_SPEED;
            maxHp = HAMMERHEAD_HP;
          } else if (m.type === "great_white") {
            typ = "great_white";
            spd = GREAT_WHITE_SPEED;
            maxHp = GREAT_WHITE_HP;
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
            mega: !!m.mega,
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
            src:
              pr.src === "grape" ? "grape" : pr.src === "apple" ? "apple" : "strawberry",
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
      if (typeof raw.reclaimerCount === "number" && isFinite(raw.reclaimerCount)) {
        reclaimerCount = Math.max(0, Math.floor(raw.reclaimerCount));
      }
      if (Array.isArray(raw.favorites) && raw.favorites.length === FAVORITE_SLOTS) {
        for (let i = 0; i < FAVORITE_SLOTS; i++) {
          const e = raw.favorites[i];
          if (!isValidFavoriteEntry(e)) {
            favoriteBox[i] = null;
            continue;
          }
          const mega = e.cat === "enemy" && e.mega ? true : undefined;
          favoriteBox[i] = mega ? { cat: e.cat, item: e.item, mega } : { cat: e.cat, item: e.item };
        }
      }
      if (typeof raw.spawnerUpgradeOwned === "boolean") spawnerUpgradeOwned = raw.spawnerUpgradeOwned;
      if (typeof raw.beachRebirthOwned === "boolean") beachRebirthOwned = raw.beachRebirthOwned;
      if (typeof raw.activeSpawnTable === "number") {
        if (raw.activeSpawnTable === 2) activeSpawnTable = 2;
        else if (raw.activeSpawnTable === 1) activeSpawnTable = 1;
        else activeSpawnTable = 0;
      }
      syncSpawnTableState();
      for (const pl of plants) {
        if (pl.kind !== "coral" || !pl.mature) continue;
        if (typeof pl.coralR !== "number" || typeof pl.coralG !== "number" || typeof pl.coralB !== "number") {
          const rgb = rollCoralOceanRgb();
          pl.coralR = rgb.r;
          pl.coralG = rgb.g;
          pl.coralB = rgb.b;
        }
        const ocean = isOceanMap();
        if (typeof pl.coralStressed !== "boolean") {
          pl.coralStressed = !ocean;
        }
        if (typeof pl.coralRecoverLeft !== "number") {
          pl.coralRecoverLeft = pl.coralStressed && ocean ? CORAL_RECOVER_SEC : 0;
        }
      }
      if (typeof raw.beachTotalKills === "number" && isFinite(raw.beachTotalKills)) {
        beachTotalKills = Math.max(0, Math.floor(raw.beachTotalKills));
      } else {
        beachTotalKills = 0;
      }
      if (typeof raw.defeatCount === "number" && isFinite(raw.defeatCount)) {
        let dc = Math.floor(raw.defeatCount);
        if (dc < 0) dc = 0;
        if (beachRebirthOwned && activeSpawnTable === 2) {
          defeatCount = dc;
          if (typeof raw.beachTotalKills !== "number") beachTotalKills = dc;
        } else defeatCount = dc % KILLS_PER_DRAGONFLY_BOSS;
      }
      if (Array.isArray(raw.seaGrass) && raw.seaGrass.length === ROWS) {
        for (let r = 0; r < ROWS; r++) {
          if (!Array.isArray(raw.seaGrass[r])) continue;
          for (let c = 0; c < COLS; c++) {
            const rawCell = raw.seaGrass[r][c];
            if (!rawCell) {
              seaGrassGrid[r][c] = null;
              continue;
            }
            seaGrassGrid[r][c] = {
              growAcc: Math.max(0, Number(rawCell.growAcc) || 0),
              mature: !!rawCell.mature,
              dying: !!rawCell.dying,
              dieLeft:
                typeof rawCell.dieLeft === "number" && rawCell.dieLeft > 0 ? rawCell.dieLeft : undefined,
            };
          }
        }
      }
      anyMaturePlant = plants.some((pl) => pl.mature);
      loadEnemyDexFromSave(Array.isArray(raw.enemyDex) ? raw.enemyDex : []);
      syncEnemyDexFromInventory();
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(getSavePayload()));
    } catch (e) {
      /* quota full or private mode */
    }
  }

  function loadGame() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (!s) return;
      applySavePayload(JSON.parse(s));
    } catch (e) {
      /* no save or corrupt */
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
    if (kind === "apple_tree") return GROW_TIME_APPLE_TREE;
    if (kind === "coral") return GROW_TIME_CORAL;
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
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "seed";
    refreshInvUi();
    return true;
  }

  function addPlantFern() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "fern";
    refreshInvUi();
    return true;
  }

  function addPlantGrape() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "grape";
    refreshInvUi();
    return true;
  }

  function addPlantPineapple() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "pineapple";
    refreshInvUi();
    return true;
  }

  function addPlantAppleTree() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "apple_tree";
    refreshInvUi();
    return true;
  }

  function addPlantCoral() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "coral";
    refreshInvUi();
    return true;
  }

  function syncShopCoralButton() {
    if (!btnBuyCoral) return;
    const ok = isOceanMap();
    btnBuyCoral.disabled = !ok;
    btnBuyCoral.title = ok ? "Buy coral (ocean map only)" : "Ocean map (beach pool) only";
  }

  function plantBackpackHasSpace() {
    return plantInv.indexOf(null) !== -1;
  }

  function isValidPlantInvToken(t) {
    return (
      t === "seed" ||
      t === "fern" ||
      t === "fern_mega" ||
      t === "grape" ||
      t === "pineapple" ||
      t === "apple_tree" ||
      t === "apple_tree_mega" ||
      t === "coral" ||
      t === "coral_mega"
    );
  }

  function isValidFavoriteEntry(e) {
    if (!e || typeof e !== "object") return false;
    if (e.cat === "plant" && typeof e.item === "string" && isValidPlantInvToken(e.item)) return true;
    if (e.cat === "enemy" && typeof e.item === "string" && isValidEnemyWorker(e.item)) {
      if (e.mega != null && typeof e.mega !== "boolean") return false;
      return true;
    }
    return false;
  }

  /** Map field plant back to backpack seed type (mega fern → fern_mega) */
  function plantToSeedItem(p) {
    const k = p.kind || "strawberry";
    if (k === "strawberry") return "seed";
    if (k === "fern") return p.mega ? "fern_mega" : "fern";
    if (k === "grape") return "grape";
    if (k === "pineapple") return "pineapple";
    if (k === "apple_tree") return p.mega ? "apple_tree_mega" : "apple_tree";
    if (k === "coral") return p.mega ? "coral_mega" : "coral";
    return "seed";
  }

  /** @returns {boolean} true if added (does not call refreshInvUi) */
  function tryAddToPlantInv(item) {
    const ix = plantInv.indexOf(null);
    if (ix === -1) return false;
    plantInv[ix] = item;
    return true;
  }

  function addPlantFernMega() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "fern_mega";
    refreshInvUi();
    return true;
  }

  function addPlantAppleTreeMega() {
    const idx = plantInv.indexOf(null);
    if (idx === -1) {
      showWarning("Plant bag full (10 slots).");
      return false;
    }
    plantInv[idx] = "apple_tree_mega";
    refreshInvUi();
    return true;
  }

  /** @param {boolean} [mega] */
  function addEnemyToInv(kind, mega) {
    if (mega === undefined) mega = false;
    if (!isValidEnemyWorker(kind)) return false;
    const idx = enemyInv.indexOf(null);
    if (idx === -1) {
      showWarning("Enemy bag full (100 slots).");
      return false;
    }
    enemyInv[idx] = kind;
    enemyInvMega[idx] = !!mega;
    registerEnemyDex(kind);
    refreshInvUi();
    return true;
  }

  function sellPriceFor(kind, mega) {
    let base = SELL_BEE_PRICE;
    if (kind === "butterfly") base = SELL_BUTTERFLY_PRICE;
    else if (kind === "raven") base = SELL_RAVEN_PRICE;
    else if (kind === "beetle") base = SELL_BEETLE_PRICE;
    else if (kind === "dragonfly") base = SELL_DRAGONFLY_PRICE;
    else if (kind === "lizard") base = SELL_LIZARD_PRICE;
    else if (kind === "snake") base = SELL_SNAKE_PRICE;
    else if (kind === "jay") base = SELL_JAY_PRICE;
    else if (kind === "robin") base = SELL_ROBIN_PRICE;
    else if (kind === "hawk") base = SELL_HAWK_PRICE;
    else if (kind === "mackerel") base = SELL_MACKEREL_PRICE;
    else if (kind === "clownfish") base = SELL_CLOWNFISH_PRICE;
    else if (kind === "lionfish") base = SELL_LIONFISH_PRICE;
    else if (kind === "lemon_shark") base = SELL_LEMON_SHARK_PRICE;
    else if (kind === "eel") base = SELL_EEL_PRICE;
    else if (kind === "hammerhead") base = SELL_HAMMERHEAD_PRICE;
    else if (kind === "great_white") base = SELL_GREAT_WHITE_PRICE;
    return mega ? base * 2 : base;
  }

  /** @returns {null | 'seed' | 'fern' | 'fern_mega' | 'grape' | 'pineapple' | 'apple_tree' | 'apple_tree_mega' | 'coral' | 'coral_mega'} */
  function takePlantItemForPlanting() {
    if (selectedPlantSlot >= 0) {
      const t = plantInv[selectedPlantSlot];
      if (
        t === "seed" ||
        t === "fern" ||
        t === "fern_mega" ||
        t === "grape" ||
        t === "pineapple" ||
        t === "apple_tree" ||
        t === "apple_tree_mega" ||
        t === "coral" ||
        t === "coral_mega"
      ) {
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
    idx = plantInv.indexOf("apple_tree");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "apple_tree";
    }
    idx = plantInv.indexOf("apple_tree_mega");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "apple_tree_mega";
    }
    idx = plantInv.indexOf("coral");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "coral";
    }
    idx = plantInv.indexOf("coral_mega");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "coral_mega";
    }
    idx = plantInv.indexOf("fern_mega");
    if (idx !== -1) {
      plantInv[idx] = null;
      refreshInvUi();
      return "fern_mega";
    }
    return null;
  }

  /** @returns {null | { type: string, mega: boolean }} */
  function takeEnemyForWorker() {
    if (selectedEnemySlot >= 0) {
      const t = enemyInv[selectedEnemySlot];
      if (isValidEnemyWorker(t)) {
        const mega = enemyInvMega[selectedEnemySlot];
        enemyInv[selectedEnemySlot] = null;
        enemyInvMega[selectedEnemySlot] = false;
        refreshInvUi();
        return { type: t, mega };
      }
    }
    for (const typ of [
      "bee",
      "butterfly",
      "beetle",
      "lizard",
      "snake",
      "jay",
      "robin",
      "hawk",
      "mackerel",
      "clownfish",
      "lionfish",
      "lemon_shark",
      "eel",
      "hammerhead",
      "great_white",
      "dragonfly",
      "raven",
    ]) {
      const idx = enemyInv.indexOf(typ);
      if (idx !== -1) {
        const mega = enemyInvMega[idx];
        enemyInv[idx] = null;
        enemyInvMega[idx] = false;
        refreshInvUi();
        return { type: typ, mega };
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
    const reclaimerStackCountEl = document.getElementById("reclaimerStackCount");
    if (reclaimerStackCountEl) reclaimerStackCountEl.textContent = String(reclaimerCount);
    if (shovelCount <= 0 && selectedGear === "shovel") selectedGear = null;
    if (reclaimerCount <= 0 && selectedGear === "reclaimer") selectedGear = null;

    const pSlots = plantSlotsEl.querySelectorAll(".inv-slot");
    pSlots.forEach((el, i) => {
      el.classList.toggle("filled", plantInv[i] !== null);
      el.classList.toggle("selected-plant", i === selectedPlantSlot);
      el.classList.toggle(
        "inv-slot-mega",
        plantInv[i] === "fern_mega" || plantInv[i] === "apple_tree_mega" || plantInv[i] === "coral_mega"
      );
      el.innerHTML = "";
      if (plantInv[i] === "seed") {
        const url = getStrawberrySeedIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "Strawberry seed";
          m.title = "Strawberry seed";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Sb";
          sp.style.fontSize = "14px";
          sp.style.color = "#ffcdd2";
          sp.title = "Strawberry seed";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "fern") {
        const url = getFernIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "Fern seed";
          m.title = "Fern seed";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Fn";
          sp.style.fontSize = "13px";
          sp.style.color = "#a5d6a7";
          sp.title = "Fern seed";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "fern_mega") {
        const url = getFernIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "2× fern seed";
          m.title = "2× fern (redeem): mega fern when planted";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Fn+";
          sp.style.fontSize = "12px";
          sp.style.color = "#fff59d";
          sp.title = "2× fern (redeem)";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "grape") {
        const url = getGrapeIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "Grape seed";
          m.title = "Grape seed";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Gp";
          sp.style.fontSize = "13px";
          sp.style.color = "#e1bee7";
          sp.title = "Grape seed";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "pineapple") {
        const url = getPineappleIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "Pineapple seed";
          m.title = "Pineapple (melee 15/s)";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Pn";
          sp.style.fontSize = "13px";
          sp.style.color = "#ffe082";
          sp.title = "Pineapple seed";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "apple_tree") {
        const url = getAppleTreeIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "Apple tree seed";
          m.title = "Apple tree (1 apple/s, 15 dmg)";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Ap";
          sp.style.fontSize = "12px";
          sp.style.color = "#c8e6c9";
          sp.title = "Apple tree seed";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "apple_tree_mega") {
        const url = getAppleTreeIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = "2× apple tree";
          m.title = "2× apple tree (redeem): mega when planted";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.textContent = "Ap+";
          sp.style.fontSize = "11px";
          sp.style.color = "#fff59d";
          sp.title = "2× apple tree (redeem)";
          el.appendChild(sp);
        }
      } else if (plantInv[i] === "coral" || plantInv[i] === "coral_mega") {
        const url = getCoralIconDataUrl();
        if (url) {
          const m = document.createElement("img");
          m.className = "icon-seed-img";
          m.src = url;
          m.alt = plantInv[i] === "coral_mega" ? "2× coral seed" : "Coral seed";
          m.title =
            plantInv[i] === "coral_mega"
              ? "Mega coral (2× melee)"
              : "Coral (melee 30/s on ocean map)";
          el.appendChild(m);
        } else {
          const sp = document.createElement("span");
          sp.className = "icon-coral";
          sp.title = plantInv[i] === "coral_mega" ? "Mega coral seed" : "Coral seed";
          el.appendChild(sp);
        }
      }
    });

    const eSlots = enemySlotsEl.querySelectorAll(".inv-slot");
    eSlots.forEach((el, i) => {
      el.classList.toggle("filled", enemyInv[i] !== null);
      el.classList.toggle("selected-enemy", i === selectedEnemySlot);
      el.classList.toggle("inv-slot-mega", !!enemyInvMega[i] && enemyInv[i] !== null);
      el.innerHTML = "";
      const em = enemyInvMega[i];
      const ms = em ? " (mega)" : "";
      if (enemyInv[i] === "bee") {
        const m = document.createElement("span");
        m.className = "icon-bee";
        m.title = "Bee" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "butterfly") {
        const m = document.createElement("span");
        m.className = "icon-butterfly";
        m.title = "Butterfly" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "raven") {
        const m = document.createElement("span");
        m.className = "icon-raven";
        m.title = "Raven" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "beetle") {
        const m = document.createElement("span");
        m.className = "icon-beetle";
        m.title = "Beetle" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "dragonfly") {
        const m = document.createElement("span");
        m.className = "icon-dragonfly";
        m.title = "Dragonfly" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "lizard") {
        const m = document.createElement("span");
        m.className = "icon-lizard";
        m.title = "Lizard" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "snake") {
        const m = document.createElement("span");
        m.className = "icon-snake";
        m.title = "Snake" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "jay") {
        const m = document.createElement("span");
        m.className = "icon-jay";
        m.title = "Jay" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "robin") {
        const m = document.createElement("span");
        m.className = "icon-robin";
        m.title = "Robin" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "hawk") {
        const m = document.createElement("span");
        m.className = "icon-hawk";
        m.title = "Hawk" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "mackerel") {
        const m = document.createElement("span");
        m.className = "icon-mackerel";
        m.title = "Mackerel" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "clownfish") {
        const m = document.createElement("span");
        m.className = "icon-clownfish";
        m.title = "Clownfish" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "lionfish") {
        const m = document.createElement("span");
        m.className = "icon-lionfish";
        m.title = "Lionfish" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "lemon_shark") {
        const m = document.createElement("span");
        m.className = "icon-lemon-shark";
        m.title = "Lemon shark" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "eel") {
        const m = document.createElement("span");
        m.className = "icon-eel";
        m.title = "Eel" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "hammerhead") {
        const m = document.createElement("span");
        m.className = "icon-hammerhead";
        m.title = "Hammerhead" + ms;
        el.appendChild(m);
      } else if (enemyInv[i] === "great_white") {
        const m = document.createElement("span");
        m.className = "icon-great-white";
        m.title = "Great white" + ms;
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
        gearSlot.title = "Shovel ×" + shovelCount + " (select, then E on plant to dig)";
      }
      const reclaimSlot = gearSlotsEl.querySelector("[data-gear='reclaimer']");
      if (reclaimSlot) {
        reclaimSlot.classList.toggle("filled", reclaimerCount > 0);
        reclaimSlot.classList.toggle("selected-gear", selectedGear === "reclaimer" && reclaimerCount > 0);
        reclaimSlot.innerHTML = "";
        const iconR = document.createElement("span");
        iconR.className = "icon-reclaimer";
        reclaimSlot.appendChild(iconR);
        const badgeR = document.createElement("span");
        badgeR.className = "gear-stack-count";
        badgeR.textContent = "×" + reclaimerCount;
        reclaimSlot.appendChild(badgeR);
        reclaimSlot.title = "Reclaimer ×" + reclaimerCount + " (select, then E to recover one seed)";
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
      selectedEnemySlot = -1;
      selectedPlantSlot = selectedPlantSlot === i ? -1 : i;
      selectedGear = null;
      refreshInvUi();
    });

    enemySlotsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".inv-slot");
      if (!t || t.dataset.enemyIdx === undefined) return;
      const i = Number(t.dataset.enemyIdx);
      selectedPlantSlot = -1;
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
      const gd2 = document.createElement("div");
      gd2.className = "inv-slot gear-slot";
      gd2.dataset.gear = "reclaimer";
      gearSlotsEl.appendChild(gd2);
      gearSlotsEl.addEventListener("click", (e) => {
        const t = e.target.closest(".inv-slot");
        if (!t || !t.dataset.gear) return;
        if (t.dataset.gear === "shovel") {
          if (shovelCount <= 0) {
            showWarning("No shovel! Buy at the gear shop (bottom-left).");
            return;
          }
          selectedGear = selectedGear === "shovel" ? null : "shovel";
        } else if (t.dataset.gear === "reclaimer") {
          if (reclaimerCount <= 0) {
            showWarning("No reclaimer! Buy at the gear shop (bottom-left).");
            return;
          }
          selectedGear = selectedGear === "reclaimer" ? null : "reclaimer";
        }
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

  /** True if a mob is ahead of the plant in lane (spawn side, toward bottom of screen) */
  function hasMobAheadInLane(laneCol, plantCenterY) {
    const margin = 12;
    return mobs.some((m) => m.lane === laneCol && m.y > plantCenterY - margin);
  }

  /** @param {{ dmg?: number, src?: 'strawberry' | 'grape' | 'apple' }} [opts] */
  function spawnDownProjectile(laneCol, startY, opts) {
    const o = opts || {};
    const dmg = typeof o.dmg === "number" && o.dmg > 0 ? o.dmg : 1;
    const src = o.src === "grape" ? "grape" : o.src === "apple" ? "apple" : "strawberry";
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
    if (favoriteModal) {
      favoriteModal.classList.toggle("hidden", mode !== "favorite");
      if (mode === "favorite") renderFavoriteGrid();
    }
  }

  function closeAllModals() {
    activeModal = null;
    shopModal.classList.add("hidden");
    if (gearModal) gearModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    if (rebirthModal) rebirthModal.classList.add("hidden");
    if (favoriteModal) favoriteModal.classList.add("hidden");
    settingsModal.classList.add("hidden");
    closeEnemyDexModal();
  }

  function openSettingsPanel() {
    activeModal = null;
    shopModal.classList.add("hidden");
    if (gearModal) gearModal.classList.add("hidden");
    sellModal.classList.add("hidden");
    if (rebirthModal) rebirthModal.classList.add("hidden");
    if (favoriteModal) favoriteModal.classList.add("hidden");
    closeEnemyDexModal();
    settingsModal.classList.remove("hidden");
  }

  function isUiBlocking() {
    return (
      activeModal !== null ||
      !settingsModal.classList.contains("hidden") ||
      (enemyDexModal && !enemyDexModal.classList.contains("hidden"))
    );
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
      showWarning("Nothing to sell!");
      return false;
    }
    const kind = enemyInv[idx];
    const mega = enemyInvMega[idx];
    enemyInv[idx] = null;
    enemyInvMega[idx] = false;
    money += sellPriceFor(kind, mega);
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

  if (btnBuyAppleTree) {
    btnBuyAppleTree.addEventListener("click", () => {
      if (money < APPLE_TREE_COST) {
        closeAllModals();
        return;
      }
      if (!addPlantAppleTree()) {
        closeAllModals();
        return;
      }
      money -= APPLE_TREE_COST;
      refreshInvUi();
      closeAllModals();
    });
  }

  if (btnBuyCoral) {
    btnBuyCoral.addEventListener("click", () => {
      if (!isOceanMap()) {
        showWarning("Coral only on ocean map — switch to Beach Ocean pool.");
        closeAllModals();
        return;
      }
      if (money < CORAL_COST) {
        closeAllModals();
        return;
      }
      if (!addPlantCoral()) {
        closeAllModals();
        return;
      }
      money -= CORAL_COST;
      refreshInvUi();
      closeAllModals();
    });
  }

  btnClose.addEventListener("click", closeAllModals);

  if (btnBuyShovel) {
    btnBuyShovel.addEventListener("click", () => {
      if (money < SHOVEL_COST) {
        showWarning("Not enough cash! Shovel costs $" + SHOVEL_COST);
        closeAllModals();
        return;
      }
      money -= SHOVEL_COST;
      shovelCount += 1;
      refreshInvUi();
      closeAllModals();
    });
  }
  if (btnBuyReclaimer) {
    btnBuyReclaimer.addEventListener("click", () => {
      if (money < RECLAIMER_COST) {
        showWarning("Not enough cash! Reclaimer costs $" + RECLAIMER_COST);
        closeAllModals();
        return;
      }
      money -= RECLAIMER_COST;
      reclaimerCount += 1;
      refreshInvUi();
      closeAllModals();
    });
  }
  if (btnCloseGear) btnCloseGear.addEventListener("click", closeAllModals);
  if (btnCloseFavorite) btnCloseFavorite.addEventListener("click", closeAllModals);

  btnSellSelected.addEventListener("click", () => {
    if (selectedEnemySlot < 0 || !isValidEnemyWorker(enemyInv[selectedEnemySlot])) {
      showWarning("Select a unit in the backpack first.");
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
        total += sellPriceFor(k, enemyInvMega[i]);
        enemyInv[i] = null;
        enemyInvMega[i] = false;
      }
    }
    if (total === 0) {
      showWarning("Nothing to sell!");
      return;
    }
    money += total;
    refreshInvUi();
  });

  btnCloseSell.addEventListener("click", closeAllModals);

  function updateRebirthModal() {
    if (!rebirthModal || !btnUnlockSpawner || !btnSpawnerDefault || !btnSpawnerUpgrade) return;
    btnUnlockSpawner.disabled = spawnerUpgradeOwned;
    btnUnlockSpawner.textContent = spawnerUpgradeOwned
      ? "Upgrade pool unlocked"
      : "Unlock (3× dragonfly + $" + SPAWNER_UPGRADE_COST_MONEY + ")";
    btnSpawnerDefault.classList.toggle("btn-spawner-active", activeSpawnTable === 0);
    btnSpawnerUpgrade.classList.toggle("btn-spawner-active", activeSpawnTable === 1);
    btnSpawnerUpgrade.disabled = !spawnerUpgradeOwned;
    if (btnUnlockBeach) {
      btnUnlockBeach.disabled = beachRebirthOwned;
      btnUnlockBeach.textContent = beachRebirthOwned
        ? "Beach ocean unlocked"
        : "Unlock beach (3× hawk + 5× robin + $100000)";
    }
    if (btnSpawnerBeach) {
      btnSpawnerBeach.classList.toggle("btn-spawner-active", activeSpawnTable === 2);
      btnSpawnerBeach.disabled = !beachRebirthOwned;
    }
  }

  if (btnUnlockSpawner) {
    btnUnlockSpawner.addEventListener("click", () => {
      if (spawnerUpgradeOwned) {
        showWarning("Upgrade pool already unlocked.");
        return;
      }
      if (countDragonfliesInInv() < SPAWNER_UPGRADE_DRAGONFLIES) {
        showWarning("Need " + SPAWNER_UPGRADE_DRAGONFLIES + " dragonflies in bag.");
        return;
      }
      if (money < SPAWNER_UPGRADE_COST_MONEY) {
        showWarning("Not enough cash! Unlock costs $" + SPAWNER_UPGRADE_COST_MONEY);
        return;
      }
      if (!consumeDragonfliesFromInv(SPAWNER_UPGRADE_DRAGONFLIES)) {
        showWarning("Could not consume dragonflies. Try again.");
        return;
      }
      money -= SPAWNER_UPGRADE_COST_MONEY;
      spawnerUpgradeOwned = true;
      activeSpawnTable = 1;
      syncSpawnTableState();
      refreshInvUi();
      updateRebirthModal();
      showSuccess("Upgrade pool unlocked! Switch Default / Upgrade 1.");
      saveGame();
    });
  }
  if (btnSpawnerDefault) {
    btnSpawnerDefault.addEventListener("click", () => {
      activeSpawnTable = 0;
      syncSpawnTableState();
      updateRebirthModal();
      saveGame();
    });
  }
  if (btnSpawnerUpgrade) {
    btnSpawnerUpgrade.addEventListener("click", () => {
      if (!spawnerUpgradeOwned) {
        showWarning("Unlock the upgrade pool first.");
        return;
      }
      activeSpawnTable = 1;
      syncSpawnTableState();
      updateRebirthModal();
      saveGame();
    });
  }
  if (btnUnlockBeach) {
    btnUnlockBeach.addEventListener("click", () => {
      if (beachRebirthOwned) {
        showWarning("Beach ocean already unlocked.");
        return;
      }
      if (countHawksInInv() < BEACH_REBIRTH_HAWKS) {
        showWarning("Need " + BEACH_REBIRTH_HAWKS + " hawks in bag.");
        return;
      }
      if (countRobinsInInv() < BEACH_REBIRTH_ROBINS) {
        showWarning("Need " + BEACH_REBIRTH_ROBINS + " robins in bag.");
        return;
      }
      if (money < BEACH_REBIRTH_COST_MONEY) {
        showWarning("Not enough cash! Beach unlock costs $" + BEACH_REBIRTH_COST_MONEY);
        return;
      }
      if (!consumeHawksFromInv(BEACH_REBIRTH_HAWKS) || !consumeRobinsFromInv(BEACH_REBIRTH_ROBINS)) {
        showWarning("Could not consume hawks or robins. Try again.");
        return;
      }
      money -= BEACH_REBIRTH_COST_MONEY;
      beachRebirthOwned = true;
      activeSpawnTable = 2;
      syncSpawnTableState();
      refreshInvUi();
      updateRebirthModal();
      showSuccess("Beach unlocked! Beach map + Beach Ocean spawn pool.");
      saveGame();
    });
  }
  if (btnSpawnerBeach) {
    btnSpawnerBeach.addEventListener("click", () => {
      if (!beachRebirthOwned) {
        showWarning("Unlock beach ocean first.");
        return;
      }
      activeSpawnTable = 2;
      syncSpawnTableState();
      updateRebirthModal();
      saveGame();
    });
  }
  if (btnCloseRebirth) btnCloseRebirth.addEventListener("click", closeAllModals);

  function tryRedeemCode() {
    if (!codeInput) return;
    const code = codeInput.value.trim();
    if (!code) {
      showWarning("Enter a code.");
      return;
    }
    if (redeemedCodes.has(code)) {
      showWarning("Code already redeemed.");
      return;
    }
    if (code === CODE_REWARD_PINEAPPLE) {
      if (!plantBackpackHasSpace()) {
        showWarning("Plant bag full — free a slot for reward.");
        return;
      }
      if (!addPlantPineapple()) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("Got 1 pineapple seed! Check plant bag.");
      saveGame();
      return;
    }
    if (code === CODE_REWARD_MEGA_FERN) {
      if (!plantBackpackHasSpace()) {
        showWarning("Plant bag full — free a slot for reward.");
        return;
      }
      if (!addPlantFernMega()) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("Got 1 mega fern seed! Check plant bag.");
      saveGame();
      return;
    }
    if (code === CODE_REWARD_APPLE_TREE_MEGA) {
      if (!plantBackpackHasSpace()) {
        showWarning("Plant bag full — free a slot for reward.");
        return;
      }
      if (!addPlantAppleTreeMega()) return;
      redeemedCodes.add(code);
      persistRedeemedCodesSet(redeemedCodes);
      codeInput.value = "";
      showSuccess("Got 1 mega apple tree seed! Check plant bag.");
      saveGame();
      return;
    }
    showWarning("Invalid code (case-sensitive).");
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
  if (btnOpenEnemyDex) btnOpenEnemyDex.addEventListener("click", () => openEnemyDexModal());
  if (btnCloseEnemyDex) btnCloseEnemyDex.addEventListener("click", () => closeEnemyDexModal());
  btnWipeProgress.addEventListener("click", () => {
    if (!confirm("Clear all progress? This cannot be undone.")) return;
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
    if (e.code === "Space") {
      e.preventDefault();
      if (isUiBlocking()) {
        if (activeModal === "favorite") closeAllModals();
        return;
      }
      if (
        rectsOverlap(player.x, player.y, player.r, favoriteBoxRect.x, favoriteBoxRect.y, favoriteBoxRect.w, favoriteBoxRect.h)
      ) {
        setActiveModal("favorite");
      }
      return;
    }
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
    if (activeSpawnTable === 2 && beachRebirthOwned) return MOB_SPAWN_WEIGHTS_BEACH;
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
          showWarning("Unlock this gray slot for $" + price);
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
        showWarning("Unlock lane " + (g.col + 1) + " for $" + price);
        return;
      }
      money -= price;
      laneUnlocked[g.col] = true;
      refreshInvUi();
      return;
    }
  }

  function renderFavoriteGrid() {
    if (!favoriteGridEl) return;
    favoriteGridEl.innerHTML = "";
    for (let i = 0; i < FAVORITE_SLOTS; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "favorite-slot-btn";
      b.dataset.favIdx = String(i);
      const entry = favoriteBox[i];
      if (entry) {
        b.classList.add("has-item");
        b.textContent = entry.cat === "plant" ? "P" : "E";
        b.title =
          (entry.cat === "plant" ? "Plant: " : "Enemy: ") +
          entry.item +
          (entry.cat === "enemy" && entry.mega ? " (mega)" : "") +
          " (click to retrieve)";
      } else {
        b.classList.add("empty");
        b.title = "Empty";
      }
      favoriteGridEl.appendChild(b);
    }
  }

  function tryRetrieveFavoriteSlot(index) {
    const entry = favoriteBox[index];
    if (!entry) return;
    if (entry.cat === "plant") {
      if (!tryAddToPlantInv(entry.item)) {
        showWarning("Plant bag full — stash item kept.");
        return;
      }
    } else {
      const ix = enemyInv.indexOf(null);
      if (ix === -1) {
        showWarning("Enemy bag full — stash item kept.");
        return;
      }
      enemyInv[ix] = entry.item;
      enemyInvMega[ix] = !!entry.mega;
      registerEnemyDex(entry.item);
    }
    favoriteBox[index] = null;
    refreshInvUi();
    renderFavoriteGrid();
    saveGame();
  }

  /** @returns {boolean} handled (including toasts) */
  function tryDepositFavorite() {
    if (!rectsOverlap(player.x, player.y, player.r, favoriteBoxRect.x, favoriteBoxRect.y, favoriteBoxRect.w, favoriteBoxRect.h)) {
      return false;
    }
    const fi = favoriteBox.indexOf(null);
    if (fi === -1) {
      showWarning("Stash full (50 slots).");
      return true;
    }
    let cat = null;
    let item = null;
    if (selectedPlantSlot >= 0) {
      const t = plantInv[selectedPlantSlot];
      if (!t) {
        showWarning("Select a slot with an item.");
        return true;
      }
      cat = "plant";
      item = t;
      plantInv[selectedPlantSlot] = null;
      selectedPlantSlot = -1;
    } else if (selectedEnemySlot >= 0) {
      const t = enemyInv[selectedEnemySlot];
      if (!t || !isValidEnemyWorker(t)) {
        showWarning("Select a slot with an item.");
        return true;
      }
      cat = "enemy";
      item = t;
      const favMega = enemyInvMega[selectedEnemySlot];
      enemyInv[selectedEnemySlot] = null;
      enemyInvMega[selectedEnemySlot] = false;
      selectedEnemySlot = -1;
      favoriteBox[fi] = favMega ? { cat, item, mega: true } : { cat, item };
      refreshInvUi();
      renderFavoriteGrid();
      saveGame();
      return true;
    } else {
      showWarning("Select something in the backpack to stash.");
      return true;
    }
    favoriteBox[fi] = { cat, item };
    refreshInvUi();
    renderFavoriteGrid();
    saveGame();
    return true;
  }

  function tryInteract() {
    if (isUiBlocking()) return;

    if (tryDepositFavorite()) return;

    for (let i = 0; i < graySlots.length; i++) {
      const s = graySlots[i];
      if (s.locked) continue;
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      if (dist(player.x, player.y, cx, cy) < 36 && s.worker) {
        const w = s.worker;
        if (!addEnemyToInv(w, !!s.workerMega)) return;
        s.worker = null;
        s.workerMega = false;
        refreshInvUi();
        return;
      }
    }

    const g = gridFromPixel(player.x, player.y);
    if (g) {
      if (!laneUnlocked[g.col]) {
        showWarning("Lane locked — stand on that column and press R to buy.");
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
        if (selectedGear === "reclaimer" && reclaimerCount > 0) {
          const pi = plants.findIndex((p) => p.row === g.row && p.col === g.col);
          if (pi >= 0) {
            const seedItem = plantToSeedItem(plants[pi]);
            if (!tryAddToPlantInv(seedItem)) {
              showWarning("Plant bag full — plant and reclaimer kept.");
              return;
            }
            plants.splice(pi, 1);
            reclaimerCount--;
            if (reclaimerCount <= 0) selectedGear = null;
            anyMaturePlant = plants.some((pl) => pl.mature);
            refreshInvUi();
            saveGame();
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
            plantInv.indexOf("apple_tree") === -1 &&
            plantInv.indexOf("apple_tree_mega") === -1 &&
            plantInv.indexOf("coral") === -1 &&
            plantInv.indexOf("coral_mega") === -1 &&
            plantInv.indexOf("fern_mega") === -1
          ) {
            showWarning("No seeds to plant (strawberry / fern / grape / pineapple / apple / coral)!");
          }
          return;
        }
        // Only code-given fern_mega / apple_tree_mega are mega by rule; shop / other seeds roll mega on plant
        const mega =
          item === "fern_mega" || item === "apple_tree_mega" || item === "coral_mega"
            ? true
            : Math.random() < MEGA_PLANT_CHANCE;
        const kind =
          item === "seed"
            ? "strawberry"
            : item === "fern" || item === "fern_mega"
              ? "fern"
              : item === "grape"
                ? "grape"
                : item === "apple_tree" || item === "apple_tree_mega"
                  ? "apple_tree"
                  : item === "coral" || item === "coral_mega"
                    ? "coral"
                    : "pineapple";
        seaGrassGrid[g.row][g.col] = null;
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
        const took = takeEnemyForWorker();
        if (!took) return;
        s.worker = took.type;
        s.workerMega = took.mega;
        registerEnemyDex(took.type);
        refreshInvUi();
        saveGame();
        return;
      }
    }
  }

  function updateSeaGrass(dt) {
    const ocean = isOceanMap();
    if (lastWasOceanMap && !ocean) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const g = seaGrassGrid[r][c];
          if (g) {
            g.dying = true;
            g.dieLeft = SEA_GRASS_DIE_OFF_TIME;
          }
        }
      }
    }
    if (!lastWasOceanMap && ocean) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const g = seaGrassGrid[r][c];
          if (g && g.dying) {
            g.dying = false;
            g.dieLeft = undefined;
          }
        }
      }
    }
    lastWasOceanMap = ocean;

    if (!ocean) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const g = seaGrassGrid[r][c];
          if (g && g.dying && typeof g.dieLeft === "number") {
            g.dieLeft -= dt;
            if (g.dieLeft <= 0) seaGrassGrid[r][c] = null;
          }
        }
      }
      return;
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!laneUnlocked[c]) continue;
        if (plants.some((p) => p.row === r && p.col === c)) {
          seaGrassGrid[r][c] = null;
          continue;
        }
        let g = seaGrassGrid[r][c];
        if (g && g.dying) {
          g.dying = false;
          g.dieLeft = undefined;
        }
        if (!g) {
          seaGrassGrid[r][c] = { growAcc: 0 };
          g = seaGrassGrid[r][c];
        }
        if (!g.mature) {
          g.growAcc += dt;
          if (g.growAcc >= SEA_GRASS_GROW_TIME) {
            g.mature = true;
            g.growAcc = SEA_GRASS_GROW_TIME;
          }
        }
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
      syncShopCoralButton();
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
          if (p.kind === "coral") {
            const rgb = rollCoralOceanRgb();
            p.coralR = rgb.r;
            p.coralG = rgb.g;
            p.coralB = rgb.b;
            const ocean = isOceanMap();
            p.coralStressed = !ocean;
            p.coralRecoverLeft = ocean ? 0 : CORAL_RECOVER_SEC;
          }
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
      } else if (p.kind === "apple_tree") {
        p.shootCd += dt;
        if (p.shootCd >= APPLE_TREE_SHOOT_INTERVAL) {
          p.shootCd = 0;
          const pc = cellCenter(p.row, p.col);
          const shootY = pc.y - 10;
          if (hasMobAheadInLane(p.col, pc.y)) {
            const dmg = APPLE_TREE_DMG * plantDamageMult(p);
            spawnDownProjectile(p.col, shootY, { src: "apple", dmg });
          }
        }
      } else if (p.kind === "fern") {
        const pc = cellCenter(p.row, p.col);
        const dps = FERN_DPS * plantDamageMult(p);
        for (let j = mobs.length - 1; j >= 0; j--) {
          const mob = mobs[j];
          if (mob.lane !== p.col) continue;
          if (mob.y <= pc.y + 4) continue;
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE * enemyMobDrawScale(mob)) continue;
          mob.hp -= dps * dt;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type, !!mob.mega)) registerEnemyDefeatForBoss();
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
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE * enemyMobDrawScale(mob)) continue;
          mob.hp -= dps * dt;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type, !!mob.mega)) registerEnemyDefeatForBoss();
            mobs.splice(j, 1);
          }
        }
      } else if (p.kind === "coral") {
        const ocean = isOceanMap();
        if (!ocean) {
          p.coralStressed = true;
          p.coralRecoverLeft = CORAL_RECOVER_SEC;
        } else if (p.coralStressed) {
          p.coralRecoverLeft -= dt;
          if (p.coralRecoverLeft <= 0) {
            p.coralStressed = false;
            p.coralRecoverLeft = 0;
          }
        }
        const pc = cellCenter(p.row, p.col);
        const dps = (p.coralStressed ? CORAL_DPS_WEAK : CORAL_DPS_FULL) * plantDamageMult(p);
        for (let j = mobs.length - 1; j >= 0; j--) {
          const mob = mobs[j];
          if (mob.lane !== p.col) continue;
          if (mob.y <= pc.y + 4) continue;
          if (dist(pc.x, pc.y, mob.x, mob.y) > FERN_MELEE_RANGE * enemyMobDrawScale(mob)) continue;
          mob.hp -= dps * dt;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type, !!mob.mega)) registerEnemyDefeatForBoss();
            mobs.splice(j, 1);
          }
        }
      }
    }
    if (matureNow) anyMaturePlant = plants.some((pl) => pl.mature);

    updateSeaGrass(dt);

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
        const mega = Math.random() < MEGA_MOB_CHANCE;
        if (kind === "bee") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BEE_HP,
            speed: 40,
            type: "bee",
            lane,
            mega,
          });
        } else if (kind === "butterfly") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BUTTERFLY_HP,
            speed: 34,
            type: "butterfly",
            lane,
            mega,
          });
        } else if (kind === "beetle") {
          mobs.push({
            x: cx,
            y: sy,
            hp: BEETLE_HP,
            speed: BEETLE_SPEED,
            type: "beetle",
            lane,
            mega,
          });
        } else if (kind === "lizard") {
          mobs.push({
            x: cx,
            y: sy,
            hp: LIZARD_HP,
            speed: LIZARD_SPEED,
            type: "lizard",
            lane,
            mega,
          });
        } else if (kind === "snake") {
          mobs.push({
            x: cx,
            y: sy,
            hp: SNAKE_HP,
            speed: SNAKE_SPEED,
            type: "snake",
            lane,
            mega,
          });
        } else if (kind === "jay") {
          mobs.push({
            x: cx,
            y: sy,
            hp: JAY_HP,
            speed: JAY_SPEED,
            type: "jay",
            lane,
            mega,
          });
        } else if (kind === "robin") {
          mobs.push({
            x: cx,
            y: sy,
            hp: ROBIN_HP,
            speed: ROBIN_SPEED,
            type: "robin",
            lane,
            mega,
          });
        } else if (kind === "mackerel") {
          mobs.push({
            x: cx,
            y: sy,
            hp: MACKEREL_HP,
            speed: MACKEREL_SPEED,
            type: "mackerel",
            lane,
            mega,
          });
        } else if (kind === "clownfish") {
          mobs.push({
            x: cx,
            y: sy,
            hp: CLOWNFISH_HP,
            speed: CLOWNFISH_SPEED,
            type: "clownfish",
            lane,
            mega,
          });
        } else if (kind === "lionfish") {
          mobs.push({
            x: cx,
            y: sy,
            hp: LIONFISH_HP,
            speed: LIONFISH_SPEED,
            type: "lionfish",
            lane,
            mega,
          });
        } else if (kind === "lemon_shark") {
          mobs.push({
            x: cx,
            y: sy,
            hp: LEMON_SHARK_HP,
            speed: LEMON_SHARK_SPEED,
            type: "lemon_shark",
            lane,
            mega,
          });
        } else if (kind === "eel") {
          mobs.push({
            x: cx,
            y: sy,
            hp: EEL_HP,
            speed: EEL_SPEED,
            type: "eel",
            lane,
            mega,
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
        if (dist(pr.x, pr.y, mob.x, mob.y) < PROJ_HIT_R * enemyMobDrawScale(mob)) {
          mob.hp -= pr.dmg;
          hit = true;
          if (mob.hp <= 0) {
            if (addEnemyToInv(mob.type, !!mob.mega)) registerEnemyDefeatForBoss();
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
      if (!s.worker) continue;
      const base = dollarPerSecForGrayWorker(s.worker);
      const mult = s.workerMega ? 2 : 1;
      income += base * mult * dt;
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
   * Plant convention: mature plants have large eyes (sclera + pupils). Call at end of new plant draws; match existing params.
   * @param {CanvasRenderingContext2D} c
   * @param {object} opt
   * @param {number} opt.y — eye line y in local coords before scale
   * @param {number} [opt.spread=4.5] — half horizontal distance from center to each eye
   * @param {number} [opt.whiteR=3.2] — sclera radius
   * @param {number} [opt.pupilR=1.3] — pupil radius
   * @param {string} [opt.pupilColor='#1a1a1a']
   * @param {number} [opt.pupilLX=0] [opt.pupilLY=0] [opt.pupilRX=0] [opt.pupilRY=0] — pupil offset from sclera (local; scaled inside)
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
   * Hand-drawn strawberry: inverted red triangle, wavy green leaves, white seeds, large eyes (slight cross-eyed look).
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

  /** HSL (hue 0–360, saturation/lightness 0–1) → RGB */
  function hslToRgb(hDeg, s, l) {
    const h = (((hDeg % 360) + 360) % 360) / 360;
    let r;
    let g;
    let b;
    if (s <= 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  /** Ocean coral palette: random vivid color, excluding black/white/brown/gray */
  function rollCoralOceanRgb() {
    for (let i = 0; i < 140; i++) {
      const hue = Math.random() * 360;
      const sat = 0.48 + Math.random() * 0.52;
      const light = 0.35 + Math.random() * 0.3;
      if (light < 0.12 || light > 0.88) continue;
      if (sat < 0.42) continue;
      if (hue >= 15 && hue <= 48 && light >= 0.2 && light <= 0.58) continue;
      const rgb = hslToRgb(hue, sat, light);
      const mx = Math.max(rgb.r, rgb.g, rgb.b);
      const mn = Math.min(rgb.r, rgb.g, rgb.b);
      if (mx - mn < 38) continue;
      if (mx < 42) continue;
      if (mn > 238) continue;
      return rgb;
    }
    return { r: 0, g: 191, b: 165 };
  }

  /** Coral: branching + base; large eyes, socket ring matches coral hue */
  function drawCoralCharacter(c, cx, cy, scale, r, g, b, stressed, recoverLeft, ocean) {
    const s = scale;
    c.save();
    c.translate(cx, cy);
    const base = stressed ? "#9e9e9e" : "rgb(" + r + "," + g + "," + b + ")";
    const dark = stressed ? "#616161" : "rgba(" + Math.max(0, r - 55) + "," + Math.max(0, g - 45) + "," + Math.max(0, b - 40) + ",1)";
    c.lineCap = "round";
    const br = 7;
    for (let k = 0; k < br; k++) {
      const ang = (-Math.PI * 0.65 + (k / (br - 1)) * Math.PI * 1.3) + (Math.sin(k * 2.1) * 0.08);
      const len = (13 + (k % 3) * 3) * s;
      c.strokeStyle = k % 2 === 0 ? base : dark;
      c.lineWidth = (1.8 + (k % 2)) * s;
      c.beginPath();
      c.moveTo(Math.sin(ang) * 1.8 * s, 8 * s);
      c.quadraticCurveTo(Math.sin(ang) * len * 0.42, 0, Math.sin(ang) * 0.15 * len, -len * 0.92);
      c.stroke();
    }
    c.fillStyle = stressed ? "#bdbdbd" : "rgba(" + r + "," + g + "," + b + ",0.88)";
    c.beginPath();
    c.moveTo(-12 * s, 10 * s);
    c.quadraticCurveTo(-13 * s, 14 * s, -5 * s, 12.5 * s);
    c.quadraticCurveTo(0, 13.5 * s, 5 * s, 12.5 * s);
    c.quadraticCurveTo(13 * s, 14 * s, 12 * s, 10 * s);
    c.lineTo(9 * s, 9 * s);
    c.lineTo(-9 * s, 9 * s);
    c.closePath();
    c.fill();
    c.strokeStyle = stressed ? "#757575" : dark;
    c.lineWidth = 1.2 * s;
    c.stroke();

    const socketFill = stressed
      ? "#bdbdbd"
      : "rgb(" +
        Math.max(0, Math.round(r * 0.72)) +
        "," +
        Math.max(0, Math.round(g * 0.68)) +
        "," +
        Math.max(0, Math.round(b * 0.7)) +
        ")";
    const socketEdge = stressed
      ? "#757575"
      : "rgb(" +
        Math.max(0, Math.round(r * 0.48)) +
        "," +
        Math.max(0, Math.round(g * 0.44)) +
        "," +
        Math.max(0, Math.round(b * 0.46)) +
        ")";
    const eyeY = -4 * s;
    const spread = 7.5 * s;
    const socketR = 6 * s;
    const whiteR = 4.5 * s;
    const pupilR = 2 * s;
    for (const ex of [-spread, spread]) {
      c.fillStyle = socketFill;
      c.beginPath();
      c.arc(ex, eyeY, socketR, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = socketEdge;
      c.lineWidth = 1.15 * s;
      c.stroke();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(ex, eyeY, whiteR, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#1a1a1a";
      c.beginPath();
      c.arc(ex + 0.45 * s, eyeY - 0.35 * s, pupilR, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.5)";
      c.beginPath();
      c.arc(ex - 1.2 * s, eyeY - 1.2 * s, 0.85 * s, 0, Math.PI * 2);
      c.fill();
    }

    if (stressed && ocean && recoverLeft > 0.05) {
      c.fillStyle = "#fff";
      c.font = "bold 10px sans-serif";
      c.textAlign = "center";
      c.fillText(Math.ceil(recoverLeft) + "s", 0, -16 * s);
    }
    c.restore();
  }

  /** Reference style: fluffy green leaves, large white eyes + red pupils, diamond pot base */
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

  /** Sea grass: fern silhouette, teal / sea-green palette (decorative, no combat) */
  function drawSeaGrassCharacter(c, cx, cy, scale, maturity) {
    const m = Math.max(0.12, Math.min(1, maturity));
    const s = scale * m;
    c.save();
    c.translate(cx, cy);

    c.fillStyle = "#26a69a";
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
      c.strokeStyle = i % 3 === 0 ? "#00695c" : "#4db6ac";
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
      pupilColor: "#004d40",
      pupilLX: 0.6,
      pupilLY: 0.3,
      pupilRX: 0.6,
      pupilRY: -0.3,
    });

    c.strokeStyle = "#004d40";
    c.lineWidth = 1.4 * s;
    c.beginPath();
    c.moveTo(0, 10 * s);
    c.lineTo(4.5 * s, 15 * s);
    c.lineTo(0, 19 * s);
    c.lineTo(-4.5 * s, 15 * s);
    c.closePath();
    c.stroke();

    c.fillStyle = "#00796b";
    c.beginPath();
    c.moveTo(0, 11 * s);
    c.lineTo(3 * s, 15 * s);
    c.lineTo(0, 18 * s);
    c.lineTo(-3 * s, 15 * s);
    c.closePath();
    c.fill();

    c.restore();
  }

  /** Pineapple: golden oval body, green crown, large eyes */
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

  /** Vine, green leaves, purple bunches; shoots purple projectiles down-lane when mature */
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

  /** Apple tree: brown trunk, green crown, three small apples, oversized eyes */
  function drawAppleTreeCharacter(c, cx, cy, scale) {
    const s = scale;
    c.save();
    c.translate(cx, cy);

    c.fillStyle = "#4e342e";
    c.strokeStyle = "#3e2723";
    c.lineWidth = 1.2 * s;
    c.fillRect(-5 * s, 2 * s, 10 * s, 16 * s);
    c.strokeRect(-5 * s, 2 * s, 10 * s, 16 * s);

    c.fillStyle = "#2e7d32";
    c.beginPath();
    c.arc(0, -8 * s, 15 * s, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#1b5e20";
    c.lineWidth = 1.4 * s;
    c.stroke();

    c.fillStyle = "#1b5e20";
    c.beginPath();
    c.ellipse(-10 * s, -4 * s, 9 * s, 7 * s, -0.35, 0, Math.PI * 2);
    c.ellipse(10 * s, -4 * s, 9 * s, 7 * s, 0.35, 0, Math.PI * 2);
    c.fill();

    const apples = [
      [-9 * s, -14 * s],
      [8 * s, -13 * s],
      [0, -20 * s],
    ];
    for (let i = 0; i < apples.length; i++) {
      const [ax, ay] = apples[i];
      c.fillStyle = "#c62828";
      c.beginPath();
      c.arc(ax, ay, 3.2 * s, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#8e0000";
      c.lineWidth = 0.65 * s;
      c.stroke();
      c.fillStyle = "#43a047";
      c.beginPath();
      c.ellipse(ax + 0.8 * s, ay - 3.4 * s, 1.4 * s, 0.9 * s, 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.45)";
      c.beginPath();
      c.arc(ax - 1 * s, ay - 0.8 * s, 0.9 * s, 0, Math.PI * 2);
      c.fill();
    }

    drawCutePlantEyes(c, s, {
      y: 5.5,
      spread: 6.2,
      whiteR: 5.8,
      pupilR: 2.1,
      pupilColor: "#1a237e",
      pupilLX: 0.5,
      pupilLY: 0.35,
      pupilRX: -0.45,
      pupilRY: 0.3,
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

  function getCoralIconDataUrl() {
    if (coralIconDataUrl) return coralIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawCoralCharacter(ictx, 20, 24, 0.88, 236, 64, 122, false, 0, true);
      coralIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return coralIconDataUrl;
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

  function getAppleTreeIconDataUrl() {
    if (appleTreeIconDataUrl) return appleTreeIconDataUrl;
    try {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 44;
      const ictx = ic.getContext("2d");
      if (!ictx) return "";
      ictx.clearRect(0, 0, 40, 44);
      drawAppleTreeCharacter(ictx, 20, 28, 0.55);
      appleTreeIconDataUrl = ic.toDataURL("image/png");
    } catch (e) {
      return "";
    }
    return appleTreeIconDataUrl;
  }

  function drawProjectile(pr) {
    if (pr.src === "apple") {
      const r = 8;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#e53935";
      ctx.fill();
      ctx.strokeStyle = "#b71c1c";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(pr.x - 2.5, pr.y - 2.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#43a047";
      ctx.beginPath();
      ctx.ellipse(pr.x + 5, pr.y - 7, 4, 2.2, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2e7d32";
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }
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

  function drawBeeWorld(b, showHp, worldScale) {
    const x = b.x;
    const y = b.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const wingT = performance.now() / 80;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

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

  function drawButterflyWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const wingT = performance.now() / 55;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

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

  /** Dragonfly boss: red body, green wings, larger */
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

  /** Robin: gray back, orange belly */
  function drawRobinWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const flap = Math.sin(performance.now() / 74) * 0.11;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#90a4ae";
    ctx.beginPath();
    ctx.ellipse(-13, 2 + flap * 5, 11, 7.5, -0.32 + flap * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78909c";
    ctx.beginPath();
    ctx.ellipse(12, 2 + flap * 5, 10, 7, 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7043";
    ctx.beginPath();
    ctx.ellipse(0, 6, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#37474f";
    ctx.beginPath();
    ctx.moveTo(5, -2);
    ctx.lineTo(18, -6);
    ctx.lineTo(7, 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-2, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-1.2, -1, 0.9, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 2;
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 17);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  /** Hawk: large brown-winged raptor */
  function drawHawkWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    if (showHp === undefined) showHp = true;
    const sc = worldScale === undefined ? 1 : worldScale;
    const flap = Math.sin(performance.now() / 68) * 0.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const wingG = ctx.createLinearGradient(-32, -4, -6, 8);
    wingG.addColorStop(0, "#5d4037");
    wingG.addColorStop(0.55, "#8d6e63");
    wingG.addColorStop(1, "#4e342e");
    ctx.fillStyle = wingG;
    ctx.beginPath();
    ctx.ellipse(-22, -2 + flap * 6, 22, 13, -0.42 + flap * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wingG;
    ctx.beginPath();
    ctx.ellipse(22, -2 + flap * 6, 22, 13, 0.42 - flap * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3e2723";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = "#6d4c41";
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffcc80";
    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(26, -2);
    ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(-3, -8, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-2.2, -8, 1, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 3;
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 22);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function drawMackerelWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    const w = Math.sin(performance.now() / 100) * 0.08;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(w);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#90a4ae";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#37474f";
    ctx.lineWidth = 1;
    ctx.stroke();
    for (let i = -1; i <= 1; i++) {
      ctx.strokeStyle = "#546e7a";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-10 + i * 4, -2);
      ctx.lineTo(12, -2 + i * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#263238";
    ctx.beginPath();
    ctx.arc(12, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 12);
    }
    ctx.restore();
  }

  function drawClownfishWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#ff6f00";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -5, 5, 10);
    ctx.fillRect(2, -5, 5, 10);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(10, -1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 14);
    }
    ctx.restore();
  }

  function drawLionfishWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const sp = Math.sin(performance.now() / 90) * 0.15;
    ctx.strokeStyle = "#7b1fa2";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) {
      const ang = -0.8 + i * 0.25 + sp;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(-20 * Math.cos(ang), -14 * Math.sin(ang));
      ctx.stroke();
    }
    ctx.fillStyle = "#ff7043";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#bf360c";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(6, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(7, -2, 0.8, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 15);
    }
    ctx.restore();
  }

  function drawLemonSharkWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#fff59d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fdd835";
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-32, -6);
    ctx.lineTo(-32, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(12, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f9a825";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (showHp) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 14);
    }
    ctx.restore();
  }

  function drawEelWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    const t = performance.now() / 120;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.strokeStyle = "#37474f";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.quadraticCurveTo(0, -4 + Math.sin(t) * 3, 18, 0);
    ctx.stroke();
    ctx.fillStyle = "#78909c";
    ctx.beginPath();
    ctx.ellipse(18, 0, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(20, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 16);
    }
    ctx.restore();
  }

  function drawHammerheadWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    const wob = Math.sin(performance.now() / 700 + x * 0.01) * 0.04;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.rotate(wob);

    const hammerGrad = ctx.createLinearGradient(-34, -14, 10, 6);
    hammerGrad.addColorStop(0, "#7894a8");
    hammerGrad.addColorStop(0.45, "#5c7585");
    hammerGrad.addColorStop(1, "#3d4f5c");
    ctx.fillStyle = hammerGrad;
    ctx.beginPath();
    ctx.ellipse(0, -9, 30, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(25,35,42,0.45)";
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.fillStyle = "rgba(180,200,215,0.22)";
    ctx.beginPath();
    ctx.ellipse(-6, -12, 10, 4, -0.15, 0, Math.PI * 2);
    ctx.fill();

    const bodyGrad = ctx.createRadialGradient(8, 4, 2, 14, 8, 22);
    bodyGrad.addColorStop(0, "#6d8694");
    bodyGrad.addColorStop(0.55, "#4a5f6b");
    bodyGrad.addColorStop(1, "#2e3d45");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(10, 5, 15, 12, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(176,190,200,0.35)";
    ctx.beginPath();
    ctx.ellipse(12, 10, 9, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(20,28,32,0.55)";
    ctx.lineWidth = 1.05;
    ctx.lineCap = "round";
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.moveTo(2 + g * 3.5, 2);
      ctx.quadraticCurveTo(5 + g * 3.5, 8 + g * 2, 8 + g * 3.5, 14 + g);
      ctx.stroke();
    }

    ctx.fillStyle = "#263238";
    ctx.beginPath();
    ctx.ellipse(18, -4, 2.6, 2.1, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(19, -4.5, 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(55,71,79,0.9)";
    ctx.beginPath();
    ctx.moveTo(4, 12);
    ctx.quadraticCurveTo(-2, 18, -8, 22);
    ctx.lineTo(-5, 24);
    ctx.quadraticCurveTo(2, 20, 8, 14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(38,50,56,0.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, 14);
    ctx.quadraticCurveTo(30, 10, 34, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 16);
    ctx.quadraticCurveTo(32, 14, 36, 10);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(10, 5, 15, 12, 0.08, 0, Math.PI * 2);
    ctx.stroke();

    if (showHp) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 24);
    }
    ctx.restore();
  }

  function drawGreatWhiteWorld(m, showHp, worldScale) {
    const x = m.x;
    const y = m.y;
    const sc = worldScale === undefined ? 1 : worldScale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "#eceff1";
    ctx.beginPath();
    ctx.ellipse(2, 0, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#90a4ae";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#cfd8dc";
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-38, -4);
    ctx.lineTo(-38, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(18, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(19, -5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    if (showHp) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.max(1, Math.ceil(m.hp))), 0, 24);
    }
    ctx.restore();
  }

  function drawMobWorld(m, showHp) {
    const ms = enemyMobDrawScale(m);
    if (m.type === "dragonfly") drawDragonflyWorld(m, showHp, 1.18 * ms);
    else if (m.type === "butterfly") drawButterflyWorld(m, showHp, ms);
    else if (m.type === "raven") drawRavenWorld(m, showHp, 1.05 * ms);
    else if (m.type === "beetle") drawBeetleWorld(m, showHp, 1 * ms);
    else if (m.type === "lizard") drawLizardWorld(m, showHp, 0.95 * ms);
    else if (m.type === "snake") drawSnakeWorld(m, showHp, 0.92 * ms);
    else if (m.type === "jay") drawJayWorld(m, showHp, 0.88 * ms);
    else if (m.type === "robin") drawRobinWorld(m, showHp, 0.86 * ms);
    else if (m.type === "hawk") drawHawkWorld(m, showHp, 1.02 * ms);
    else if (m.type === "mackerel") drawMackerelWorld(m, showHp, 0.88 * ms);
    else if (m.type === "clownfish") drawClownfishWorld(m, showHp, 0.85 * ms);
    else if (m.type === "lionfish") drawLionfishWorld(m, showHp, 0.82 * ms);
    else if (m.type === "lemon_shark") drawLemonSharkWorld(m, showHp, 0.78 * ms);
    else if (m.type === "eel") drawEelWorld(m, showHp, 0.8 * ms);
    else if (m.type === "hammerhead") drawHammerheadWorld(m, showHp, 0.72 * ms);
    else if (m.type === "great_white") drawGreatWhiteWorld(m, showHp, 0.68 * ms);
    else drawBeeWorld(m, showHp, ms);
  }

  function drawGrid() {
    const priceRow = Math.floor(ROWS / 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = GRID_X + c * CELL;
        const y = GRID_Y + r * CELL;
        const open = laneUnlocked[c];
        if (isOceanMap()) {
          ctx.fillStyle = open ? "#e6d5b0" : "#a08060";
        } else {
          ctx.fillStyle = open ? "#2d6a3e" : "#4a3520";
        }
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        ctx.strokeStyle = isOceanMap() ? "#8d6e63" : "#1a1510";
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
          pk === "fern"
            ? "#2e4a2e"
            : pk === "grape"
              ? "#4a148c"
              : pk === "pineapple"
                ? "#5d4037"
                : pk === "apple_tree"
                  ? "#33691e"
                  : pk === "coral"
                    ? "#ff7043"
                    : "#4a3728";
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
      } else if (pk === "apple_tree") {
        drawAppleTreeCharacter(ctx, cx, cy + 2, 0.62 * ps);
      } else if (pk === "coral") {
        const cr = typeof p.coralR === "number" ? p.coralR : 200;
        const cg = typeof p.coralG === "number" ? p.coralG : 120;
        const cb = typeof p.coralB === "number" ? p.coralB : 160;
        drawCoralCharacter(
          ctx,
          cx,
          cy + 2,
          0.98 * ps,
          cr,
          cg,
          cb,
          !!p.coralStressed,
          typeof p.coralRecoverLeft === "number" ? p.coralRecoverLeft : 0,
          isOceanMap()
        );
      } else {
        drawStrawberryCharacter(ctx, cx, cy - 2, 1 * ps);
      }
    }
  }

  function drawSeaGrass() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const g = seaGrassGrid[r][c];
        if (!g) continue;
        const cx = GRID_X + c * CELL + CELL / 2;
        const cy = GRID_Y + r * CELL + CELL / 2;
        const mat = g.mature ? 1 : Math.min(1, g.growAcc / SEA_GRASS_GROW_TIME);
        let alpha = 1;
        if (g.dying && typeof g.dieLeft === "number") {
          alpha = Math.max(0, g.dieLeft / SEA_GRASS_DIE_OFF_TIME);
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        drawSeaGrassCharacter(ctx, cx, cy + 2, 0.78, mat);
        ctx.restore();
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
    ctx.fillText("Shop", shopRect.x + shopRect.w / 2, shopRect.y + 24);
    ctx.font = "9px sans-serif";
    ctx.fillText("Sb $" + STRAWBERRY_COST + " · 5s", shopRect.x + shopRect.w / 2, shopRect.y + 40);
    ctx.fillText("Fn $" + FERN_COST + " · 10s melee 2/s", shopRect.x + shopRect.w / 2, shopRect.y + 52);
    ctx.fillText("Gp $" + GRAPE_COST + " · 15s shoot", shopRect.x + shopRect.w / 2, shopRect.y + 64);
    ctx.fillText("Pn $" + PINEAPPLE_COST + " · " + GROW_TIME_PINEAPPLE + "s melee 15/s", shopRect.x + shopRect.w / 2, shopRect.y + 76);
    ctx.fillText("Ap $" + APPLE_TREE_COST + " · " + GROW_TIME_APPLE_TREE + "s 15/hit", shopRect.x + shopRect.w / 2, shopRect.y + 90);
    ctx.fillText("Cr $" + CORAL_COST + " · " + GROW_TIME_CORAL + "s melee 30/s", shopRect.x + shopRect.w / 2, shopRect.y + 104);
    ctx.fillStyle = isOceanMap() ? "#fff" : "#9e9e9e";
    ctx.fillText("(ocean)", shopRect.x + shopRect.w / 2, shopRect.y + 116);
    ctx.fillStyle = "#fff";
    ctx.fillText("Stand here for menu", shopRect.x + shopRect.w / 2, shopRect.y + 130);
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
    ctx.fillText("Gear", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 20);
    ctx.font = "9px sans-serif";
    ctx.fillText("Shovel $" + SHOVEL_COST + " dig", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 38);
    ctx.fillText("Recl $" + RECLAIMER_COST + " seed", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 52);
    ctx.fillStyle = "#b0bec5";
    ctx.font = "8px sans-serif";
    ctx.fillText("Stand here for menu", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 68);
    ctx.fillText("Below: stash", gearShopRect.x + gearShopRect.w / 2, gearShopRect.y + 82);
  }

  function drawFavoriteBox() {
    ctx.fillStyle = "#4e342e";
    ctx.fillRect(favoriteBoxRect.x, favoriteBoxRect.y, favoriteBoxRect.w, favoriteBoxRect.h);
    ctx.strokeStyle = "#ffcc80";
    ctx.lineWidth = 2;
    ctx.strokeRect(favoriteBoxRect.x, favoriteBoxRect.y, favoriteBoxRect.w, favoriteBoxRect.h);
    ctx.fillStyle = "#ffe0b2";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Stash", favoriteBoxRect.x + favoriteBoxRect.w / 2, favoriteBoxRect.y + 20);
    ctx.font = "8px sans-serif";
    ctx.fillStyle = "#bcaaa4";
    ctx.fillText("50 slots · E deposit", favoriteBoxRect.x + favoriteBoxRect.w / 2, favoriteBoxRect.y + 38);
    ctx.fillText("Space open", favoriteBoxRect.x + favoriteBoxRect.w / 2, favoriteBoxRect.y + 52);
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
    ctx.fillText("Sell", sellShopRect.x + sellShopRect.w / 2, sellShopRect.y + 30);
    ctx.font = "11px sans-serif";
    ctx.fillText("Bee / butterfly / beetle / dragonfly / raven", sellShopRect.x + sellShopRect.w / 2, sellShopRect.y + 50);
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
    ctx.fillText("Rebirth", rcx, rebirthShopRect.y + 22);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#b0bec5";
    ctx.fillText("Pool upgrades", rcx, rebirthShopRect.y + 40);
    ctx.fillText("Switch table", rcx, rebirthShopRect.y + 54);
    ctx.fillText("Stand here for menu", rcx, rebirthShopRect.y + 72);
  }

  function drawSpawner() {
    ctx.fillStyle = isOceanMap() ? "#1565c0" : "#0d0d0d";
    ctx.fillRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.strokeStyle = isOceanMap() ? "#42a5f5" : "#333";
    ctx.strokeRect(spawnerRect.x, spawnerRect.y, spawnerRect.w, spawnerRect.h);
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const cx = spawnerRect.x + spawnerRect.w / 2;
    ctx.fillText("Spawn", cx, spawnerRect.y + 12);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#8bc34a";
    ctx.fillText("~" + getSpawnIntervalSec().toFixed(1).replace(/\.0$/, "") + "s each", cx, spawnerRect.y + 24);
    syncSpawnTableState();
    ctx.font = "7px sans-serif";
    ctx.fillStyle = "#ffcc80";
    if (activeSpawnTable === 2 && beachRebirthOwned) {
      const hm = beachTotalKills % KILLS_PER_HAMMERHEAD_BOSS;
      const uh = hm === 0 ? KILLS_PER_HAMMERHEAD_BOSS : KILLS_PER_HAMMERHEAD_BOSS - hm;
      const gm = beachTotalKills % KILLS_PER_GREAT_WHITE_BOSS;
      const ugw = gm === 0 ? KILLS_PER_GREAT_WHITE_BOSS : KILLS_PER_GREAT_WHITE_BOSS - gm;
      ctx.fillText("To hammerhead: " + uh + " kills", cx, spawnerRect.y + 38);
      ctx.fillStyle = "#ffe082";
      ctx.fillText("To great white: " + ugw + " kills", cx, spawnerRect.y + 50);
      ctx.fillStyle = "#b3e5fc";
      ctx.fillText("Pool: Beach ocean", cx, spawnerRect.y + 62);
    } else {
      const untilBoss = Math.max(0, KILLS_PER_DRAGONFLY_BOSS - defeatCount);
      const bossLine =
        activeSpawnTable === 1 && spawnerUpgradeOwned
          ? "To hawk: " + untilBoss + " kills left"
          : "To dragonfly boss: " + untilBoss + " kills left";
      ctx.fillText(bossLine, cx, spawnerRect.y + 38);
      const poolLabel =
        activeSpawnTable === 1 && spawnerUpgradeOwned ? "Pool: Upgrade" : "Pool: Default";
      ctx.fillStyle = "#90a4ae";
      ctx.fillText(poolLabel, cx, spawnerRect.y + 50);
    }
  }

  function drawGraySlots() {
    graySlots.forEach((s, i) => {
      ctx.fillStyle = isOceanMap() ? "#c4b59a" : "#6a6a6a";
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = isOceanMap() ? "#6d4c41" : "#444";
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
        const ms = s.workerMega ? 2 : 1;
        if (s.worker === "bee") {
          drawBeeWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "bee" }, false, 1 * ms);
        } else if (s.worker === "butterfly") {
          drawButterflyWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "butterfly" }, false, 1 * ms);
        } else if (s.worker === "beetle") {
          drawBeetleWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "beetle" }, false, 0.62 * ms);
        } else if (s.worker === "raven") {
          drawRavenWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "raven" }, false, 0.5 * ms);
        } else if (s.worker === "dragonfly") {
          drawDragonflyWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "dragonfly" }, false, 0.38 * ms);
        } else if (s.worker === "lizard") {
          drawLizardWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "lizard" }, false, 0.42 * ms);
        } else if (s.worker === "snake") {
          drawSnakeWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "snake" }, false, 0.4 * ms);
        } else if (s.worker === "jay") {
          drawJayWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "jay" }, false, 0.4 * ms);
        } else if (s.worker === "robin") {
          drawRobinWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "robin" }, false, 0.38 * ms);
        } else if (s.worker === "hawk") {
          drawHawkWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "hawk" }, false, 0.32 * ms);
        } else if (s.worker === "mackerel") {
          drawMackerelWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "mackerel" }, false, 0.36 * ms);
        } else if (s.worker === "clownfish") {
          drawClownfishWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "clownfish" }, false, 0.35 * ms);
        } else if (s.worker === "lionfish") {
          drawLionfishWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "lionfish" }, false, 0.34 * ms);
        } else if (s.worker === "lemon_shark") {
          drawLemonSharkWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "lemon_shark" }, false, 0.3 * ms);
        } else if (s.worker === "eel") {
          drawEelWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "eel" }, false, 0.32 * ms);
        } else if (s.worker === "hammerhead") {
          drawHammerheadWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "hammerhead" }, false, 0.26 * ms);
        } else if (s.worker === "great_white") {
          drawGreatWhiteWorld({ x: cx, y: cy, hp: 1, speed: 0, type: "great_white" }, false, 0.22 * ms);
        }
        ctx.fillStyle = "#000";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        const r = dollarPerSecForGrayWorker(s.worker) * (s.workerMega ? 2 : 1);
        const rateLabel = "$" + r + "/s";
        ctx.fillText(rateLabel, s.x + s.w / 2, s.y + s.h - 2);
      }
    });
    ctx.fillStyle = "#aaa";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Gray slots · E pick up worker · locked: R to buy", GRID_X + (COLS * CELL) / 2, grayRowY - 8);
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
      "Center lane starts unlocked · strawberry/grape shoot · fern/pineapple melee · 5% mega plants · 5% mega mobs (2× gray $) · gear shop shovel/reclaimer · stash E / Space · each lane −1s spawn · 100 kills boss · rebirth bottom-right · ocean: sea grass on empty tiles",
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

    if (isOceanMap()) {
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#87ceeb");
      bg.addColorStop(0.42, "#b3e5fc");
      bg.addColorStop(0.72, "#d7ccc8");
      bg.addColorStop(1, "#efebe9");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#252b20";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawLabels();
    drawGraySlots();
    drawGrid();
    drawPlants();
    drawSeaGrass();
    for (const pr of projectiles) drawProjectile(pr);
    drawSpawner();
    drawShop();
    drawGearShop();
    drawFavoriteBox();
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
  if (sellRobinPriceEl) sellRobinPriceEl.textContent = String(SELL_ROBIN_PRICE);
  if (sellHawkPriceEl) sellHawkPriceEl.textContent = String(SELL_HAWK_PRICE);
  if (shovelPriceEl) shovelPriceEl.textContent = String(SHOVEL_COST);
  if (reclaimerPriceEl) reclaimerPriceEl.textContent = String(RECLAIMER_COST);
  if (pineapplePriceEl) pineapplePriceEl.textContent = String(PINEAPPLE_COST);
  if (appleTreePriceEl) appleTreePriceEl.textContent = String(APPLE_TREE_COST);
  if (coralPriceEl) coralPriceEl.textContent = String(CORAL_COST);

  buildInvSlots();
  if (favoriteGridEl) {
    favoriteGridEl.addEventListener("click", (e) => {
      const b = e.target.closest(".favorite-slot-btn");
      if (!b || b.dataset.favIdx === undefined) return;
      tryRetrieveFavoriteSlot(Number(b.dataset.favIdx));
    });
  }
  loadGame();
  lastWasOceanMap = isOceanMap();
  refreshInvUi();
  syncShopCoralButton();
  updateRebirthModal();
  requestAnimationFrame(loop);
})();
