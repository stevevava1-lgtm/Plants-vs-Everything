/**
 * Fishing World — islands, ambience pool, fish, bestiary, local save
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let dpr = 1;

const moneyEl = document.getElementById("money");
const afTokensRowEl = document.getElementById("af-tokens-row");
const afTokensEl = document.getElementById("af-tokens");
const shopPanelTitleEl = document.getElementById("shop-panel-title");
const shopAprilFoolsBannerEl = document.getElementById("shop-april-fools-banner");
const shopMainListEl = document.getElementById("shop-main-list");
const shopAprilFoolsListEl = document.getElementById("shop-april-fools-list");
const shopMainNoteEl = document.getElementById("shop-main-note");
const shopAprilFoolsNoteEl = document.getElementById("shop-april-fools-note");
const islandLabelEl = document.getElementById("island-label");
const drownWarningEl = document.getElementById("drown-warning");
const backpackCountEl = document.getElementById("backpack-count");
const inventoryBar = document.getElementById("inventory-bar");
const backpackPanel = document.getElementById("backpack-panel");
const backpackGrid = document.getElementById("backpack-grid");
const favoritesGrid = document.getElementById("favorites-grid");
const backpackUsedEl = document.getElementById("backpack-used");
const favoritesUsedEl = document.getElementById("favorites-used");
const gameOverEl = document.getElementById("game-over");
const fishingPanel = document.getElementById("fishing-panel");
const hookPhase = document.getElementById("hook-phase");
const minigamePhase = document.getElementById("minigame-phase");
const minigameTitleEl = document.getElementById("minigame-title");
const hookFill = document.getElementById("hook-fill");
const catchMeterFill = document.getElementById("catch-meter-fill");
const fishTrack = document.getElementById("fish-track");
const fishZone = document.getElementById("fish-zone");
const minnowMinigameCanvas = document.getElementById("minnow-minigame");
const sellPanel = document.getElementById("sell-panel");
const shopPanel = document.getElementById("shop-panel");
const harborPanel = document.getElementById("harbor-panel");
const sellBreakdownEl = document.getElementById("sell-breakdown");
const destroyPanel = document.getElementById("destroy-panel");
const destroyCountEl = document.getElementById("destroy-count");
const destroyAllBtn = document.getElementById("destroy-all-btn");
const destroyCloseBtn = document.getElementById("destroy-close-btn");
const bestiaryPanel = document.getElementById("bestiary-panel");
const bestiaryContentEl = document.getElementById("bestiary-content");
const rodsPanel = document.getElementById("rods-panel");
const rodsContentEl = document.getElementById("rods-content");
const rodSlotEl = document.getElementById("rod-slot");
const timeHudEl = document.getElementById("time-hud");
const craftingPanel = document.getElementById("crafting-panel");
const craftingContentEl = document.getElementById("crafting-content");
const craftingCloseBtn = document.getElementById("crafting-close-btn");
const craftingPanelTitleEl = document.getElementById("crafting-panel-title");
const craftingPanelDescEl = document.getElementById("crafting-panel-desc");
const illusionEnchantPanel = document.getElementById("illusion-enchant-panel");
const illusionEnchantActionsEl = document.getElementById("illusion-enchant-actions");
const illusionEnchantDescEl = document.getElementById("illusion-enchant-desc");
const illusionEnchantCloseBtn = document.getElementById("illusion-enchant-close-btn");
const ghostCrafterPanel = document.getElementById("ghost-crafter-panel");
const ghostCrafterRecipesEl = document.getElementById("ghost-crafter-recipes");
const ghostCrafterCloseBtn = document.getElementById("ghost-crafter-close-btn");
const relicSellerPanel = document.getElementById("relic-seller-panel");
const relicSellerOwnedEl = document.getElementById("relic-seller-owned");
const relicSellStormQtyEl = document.getElementById("relic-sell-storm-qty");
const relicSellTitanQtyEl = document.getElementById("relic-sell-titan-qty");
const relicSellTotalEl = document.getElementById("relic-sell-total");
const relicSellBtn = document.getElementById("relic-sell-btn");
const relicSellerCloseBtn = document.getElementById("relic-seller-close-btn");

const btnBackpack = document.getElementById("btn-backpack");
const btnBestiary = document.getElementById("btn-bestiary");
const btnRods = document.getElementById("btn-rods");
const settingsPanel = document.getElementById("settings-panel");
const btnSettings = document.getElementById("btn-settings");
const settingsCloseBtn = document.getElementById("settings-close-btn");
const codeInputEl = document.getElementById("code-input");
const redeemCodeBtn = document.getElementById("redeem-code-btn");
const codeMessageEl = document.getElementById("code-message");
const tabButtons = Array.from(document.querySelectorAll("#settings-panel .tab-btn"));
const tabSettingsEl = document.getElementById("tab-settings");
const tabCodesEl = document.getElementById("tab-codes");

const boatStatusEl = document.getElementById("boat-status");
const buyBoatBtn = document.getElementById("buy-boat-btn");
const harborCloseBtn = document.getElementById("harbor-close-btn");

btnBackpack.addEventListener("click", () => {
  if (gameState !== "playing") return;
  closeAllUiPanels();
  backpackOpen = !backpackOpen;
  backpackPanel.classList.toggle("hidden", !backpackOpen);
  syncBackpackOpenBodyClass();
  if (backpackOpen) renderBackpackGrid();
});

btnBestiary.addEventListener("click", () => {
  if (gameState !== "playing") return;
  if (!bestiaryPanel.classList.contains("hidden")) closeAllUiPanels();
  else openBestiary();
});

btnRods.addEventListener("click", () => {
  if (gameState !== "playing") return;
  if (!rodsPanel.classList.contains("hidden")) closeAllUiPanels();
  else openRodsPanel();
});

rodSlotEl.addEventListener("click", () => {
  if (gameState !== "playing") return;
  holdRod(); // clicking rod slot always makes you hold the equipped rod
});

btnSettings.addEventListener("click", () => {
  if (gameState !== "playing") return;
  openSettingsPanel("settings");
});

settingsCloseBtn.addEventListener("click", closeAllUiPanels);

let codeTypingLock = false;
codeInputEl.addEventListener("focus", () => {
  codeTypingLock = true;
});
codeInputEl.addEventListener("blur", () => {
  codeTypingLock = false;
});

for (const b of tabButtons) {
  b.addEventListener("click", () => {
    if (codeTypingLock) return;
    setSettingsTab(b.getAttribute("data-tab"));
  });
}

function redeemCodeExact(code) {
  if (code === "Restore_save") {
    sanitizeStorage();
    restoreSaveUndoSnapshot = captureRestoreSnapshot();
    for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = null;
    for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = null;
    for (let i = 0; i < FAVORITES_SIZE; i++) favorites[i] = null;
    money = 25568;
    ownedBoat = true;
    ownedRods.clear();
    for (const rid of ROD_IDS) {
      if (rid !== "sharkRod") ownedRods.add(rid);
    }
    rodEnchants = { rod67: "speed" };
    held = { kind: "rod", uid: null };
    equippedRodId = ownedRods.has("rod67") ? "rod67" : "beginnerRod";
    for (let i = 0; i < 5; i++) {
      inventory[i] = {
        ...ITEMS.minnow,
        uid: newUid(),
        weightG: rollFishWeightG("minnow"),
        gold: false,
        forestMut: false,
        lightningMut: true,
        foolsMut: false,
        hackedMut: false,
      };
    }
    updateMoneyHud();
    renderInventory();
    renderBackpackGrid();
    renderRodSlot();
    renderRods();
    saveGame();
    return { ok: true, msg: "Restore applied. Use Undo_restore to revert." };
  }
  if (code === "Undo_restore") {
    if (!restoreSaveUndoSnapshot) return { ok: false, msg: "Nothing to undo." };
    applyRestoreSnapshot(restoreSaveUndoSnapshot);
    restoreSaveUndoSnapshot = null;
    updateMoneyHud();
    renderInventory();
    renderBackpackGrid();
    renderRodSlot();
    renderRods();
    saveGame();
    return { ok: true, msg: "Previous account restored." };
  }
  if (code === "undo-op") {
    if (!redeemedCodes.has("tyautoclicker")) return { ok: false, msg: "tyautoclicker was not redeemed." };
    const isTyautoclickerBarracuda = (it) =>
      it &&
      it.id === "barracuda" &&
      it.weightG === 300 &&
      it.gold &&
      it.forestMut &&
      it.lightningMut &&
      it.foolsMut &&
      it.hackedMut;
    let need = 10;
    const tryRemove = (arr) => {
      for (let i = 0; i < arr.length && need > 0; i++) {
        if (isTyautoclickerBarracuda(arr[i])) {
          if (held.kind === "item" && held.uid === arr[i].uid) held = { kind: "rod", uid: null };
          arr[i] = null;
          need--;
        }
      }
    };
    tryRemove(inventory);
    tryRemove(backpack);
    tryRemove(favorites);
    if (need > 0) {
      return {
        ok: false,
        msg: "Could not find all 10 tyautoclicker barracuda (sold, destroyed, or changed).",
      };
    }
    redeemedCodes.delete("tyautoclicker");
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Removed 10 tyautoclicker barracuda; you can redeem tyautoclicker again." };
  }

  if (redeemedCodes.has(code)) return { ok: false, msg: "Code already redeemed." };

  // Case-sensitive codes. No in-game hints for these.
  if (code === "Testing") {
    redeemedCodes.add(code);
    ownedRods.add("testingRod");
    equippedRodId = "testingRod";
    holdRod();
    renderRodSlot();
    renderRods();
    saveGame();
    return { ok: true, msg: "Redeemed." };
  }
  if (code === "prerelease") {
    redeemedCodes.add(code);
    money += 30;
    updateMoneyHud();
    saveGame();
    return { ok: true, msg: "Redeemed." };
  }
  if (code === "sorry Leo") {
    redeemedCodes.add(code);
    money = 536;
    updateMoneyHud();
    saveGame();
    return { ok: true, msg: "Restored." };
  }
  if (code === "Overpowered_Barracuda") {
    const fish = {
      ...ITEMS.barracuda,
      uid: newUid(),
      weightG: 300,
      gold: true,
      forestMut: true,
      lightningMut: true,
      foolsMut: true,
      hackedMut: true,
    };
    if (!hasAnyInventorySpace() || !addItem(fish)) return { ok: false, msg: "Inventory full." };
    redeemedCodes.add(code);
    markCaught("barracuda");
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed." };
  }
  if (code === "tyautoclicker") {
    let free = 0;
    for (let i = 0; i < SLOT_COUNT; i++) if (!inventory[i]) free++;
    for (let i = 0; i < BACKPACK_SIZE; i++) if (!backpack[i]) free++;
    if (free < 10) return { ok: false, msg: "Need 10 empty slots (hotbar or backpack)." };
    for (let n = 0; n < 10; n++) {
      const fish = {
        ...ITEMS.barracuda,
        uid: newUid(),
        weightG: 300,
        gold: true,
        forestMut: true,
        lightningMut: true,
        foolsMut: true,
        hackedMut: true,
      };
      if (!addItem(fish)) return { ok: false, msg: "Inventory full." };
    }
    redeemedCodes.add(code);
    markCaught("barracuda");
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed: 10× max-mutation barracuda (300g each)." };
  }
  if (code === "checkifluscaisinthegame") {
    const lusca = {
      ...ITEMS.lusca,
      uid: newUid(),
      weightG: rollFishWeightG("lusca"),
      gold: false,
      forestMut: false,
      lightningMut: false,
      foolsMut: false,
    };
    if (!hasAnyInventorySpace() || !addItem(lusca)) return { ok: false, msg: "Inventory full." };
    redeemedCodes.add(code);
    markCaught("lusca");
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed." };
  }
  if (code === "R3llics") {
    let free = 0;
    for (let i = 0; i < SLOT_COUNT; i++) if (!inventory[i]) free++;
    for (let i = 0; i < BACKPACK_SIZE; i++) if (!backpack[i]) free++;
    if (free < 4) return { ok: false, msg: "Need 4 empty slots (hotbar or backpack)." };
    for (let n = 0; n < 2; n++) {
      if (!addItem({ ...ITEMS.stormRelic, uid: newUid() })) return { ok: false, msg: "Inventory full." };
      if (!addItem({ ...ITEMS.titanRelic, uid: newUid() })) return { ok: false, msg: "Inventory full." };
    }
    redeemedCodes.add(code);
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed: 2× Storm relic, 2× Titan relic." };
  }
  if (code === "TiTan") {
    if (!hasAnyInventorySpace() || !addItem({ ...ITEMS.titanRelic, uid: newUid() })) {
      return { ok: false, msg: "Inventory full." };
    }
    redeemedCodes.add(code);
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed: 1× Titan relic." };
  }
  if (code === "Ilovegardengame!") {
    if (!hasAnyInventorySpace() || !addItem({ ...ITEMS.secretPaper, uid: newUid() })) {
      return { ok: false, msg: "Inventory full." };
    }
    redeemedCodes.add(code);
    renderInventory();
    renderBackpackGrid();
    saveGame();
    return { ok: true, msg: "Redeemed: 1× Paper. Hold it in-game to read." };
  }
  return { ok: false, msg: "Invalid code." };
}

redeemCodeBtn.addEventListener("click", () => {
  const code = (codeInputEl.value || "").trim();
  const res = redeemCodeExact(code);
  codeMessageEl.textContent = res.msg;
});

buyBoatBtn.addEventListener("click", () => {
  if (ownedBoat) return;
  if (money < 50) return;
  money -= 50;
  ownedBoat = true;
  updateMoneyHud();
  openHarborPanel();
  saveGame();
});

codeInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    redeemCodeBtn.click();
  }
});

const SLOT_COUNT = 5;
const BACKPACK_SIZE = 50;
const FAVORITES_SIZE = 10;
const CAST_TILES = 2;
const DROWN_SECONDS = 10;

const TILE_SIZE = 32;
/** 17×17 = 289 tiles (within ~200–300) */
const ISLAND_TILES = 17;
const ISLAND_HALF_PX = (ISLAND_TILES / 2) * TILE_SIZE;

const GRAND_REEF_FISH_MAX_DIST = 5200;

const ITEMS = {
  beginnerRod: { id: "beginnerRod", name: "Beginner rod" },
  advancedRod: { id: "advancedRod", name: "Advanced rod" },
  metalRod: { id: "metalRod", name: "Metal rod" },
  testingRod: { id: "testingRod", name: "Testing rod" },
  liarRod: { id: "liarRod", name: "Liar rod" },
  forestRod: { id: "forestRod", name: "Forest rod" },
  speedRod: { id: "speedRod", name: "Speed rod" },
  sharkRod: { id: "sharkRod", name: "Shark rod" },
  rod67: { id: "rod67", name: "67 rod" },
  garbageRod: { id: "garbageRod", name: "Garbage rod" },
  gunRod: { id: "gunRod", name: "Gun rod" },
  gunBullets: { id: "gunBullets", name: "Bullets" },
  minnow: { id: "minnow", name: "Minnow" },
  cod: { id: "cod", name: "Cod" },
  rapFish: { id: "rapFish", name: "Rap fish" },
  pufferfish: { id: "pufferfish", name: "Pufferfish" },
  tropicalRed: { id: "tropicalRed", name: "Tropical fish (red)" },
  tropicalYellow: { id: "tropicalYellow", name: "Tropical fish (yellow)" },
  tropicalOrange: { id: "tropicalOrange", name: "Tropical fish (orange)" },
  tropicalPurple: { id: "tropicalPurple", name: "Tropical fish (purple)" },
  forestFish: { id: "forestFish", name: "Forest fish" },
  forestTurtle: { id: "forestTurtle", name: "Forest turtle" },
  blueTang: { id: "blueTang", name: "Blue tang" },
  barracuda: { id: "barracuda", name: "Barracuda" },
  poolShark: { id: "poolShark", name: "Pool shark" },
  electricalEel: { id: "electricalEel", name: "Electrical eel" },
  lusca: { id: "lusca", name: "Lusca" },
  flyingFish: { id: "flyingFish", name: "Flying fish" },
  herring: { id: "herring", name: "Herring" },
  metalSheet: { id: "metalSheet", name: "Metal sheet" },
  garbageFish: { id: "garbageFish", name: "Garbage fish" },
  plasticBottle: { id: "plasticBottle", name: "Plastic bottle" },
  clownfish: { id: "clownfish", name: "Clownfish" },
  sunTang: { id: "sunTang", name: "Sun tang" },
  parrotFish: { id: "parrotFish", name: "ParrotFish" },
  reefShark: { id: "reefShark", name: "Reef shark" },
  foolFish: { id: "foolFish", name: "Fool fish" },
  gagFish: { id: "gagFish", name: "Gag fish" },
  shark67: { id: "shark67", name: "67 Shark" },
  ghostFish: { id: "ghostFish", name: "Ghost fish" },
  ghostBarracuda: { id: "ghostBarracuda", name: "Ghost barracuda" },
  anglerfish: { id: "anglerfish", name: "Anglerfish" },
  redCrab: { id: "redCrab", name: "Red crab" },
  titanPrawn: { id: "titanPrawn", name: "Titan prawn" },
  giantCatShark: { id: "giantCatShark", name: "Giant cat shark" },
  hyperliosisPoolShark: { id: "hyperliosisPoolShark", name: "Hyperliosis pool shark" },
  anglerShark: { id: "anglerShark", name: "Angler shark" },
  stormRelic: { id: "stormRelic", name: "Storm relic" },
  titanRelic: { id: "titanRelic", name: "Titan relic" },
  secretPaper: { id: "secretPaper", name: "Paper" },
};

/** Non-fish items that use per-instance uid (inventory/backpack). Sold only at Illusion Relic Seller. */
const RELIC_ITEM_IDS = new Set(["stormRelic", "titanRelic"]);
/** Relics + other unique misc (e.g. code reward paper); not sold at relic NPC. */
const UID_MISC_ITEM_IDS = new Set([...RELIC_ITEM_IDS, "secretPaper"]);
const SECRET_PAPER_REVEAL_TEXT = "HD4OCEAN";
const RELIC_SELL_PRICE = { stormRelic: 400, titanRelic: 550 };

const ROD_IDS = new Set([
  "beginnerRod",
  "advancedRod",
  "metalRod",
  "testingRod",
  "liarRod",
  "forestRod",
  "speedRod",
  "sharkRod",
  "rod67",
  "garbageRod",
  "gunRod",
]);
const FISH_ITEM_IDS = new Set([
  "minnow",
  "cod",
  "rapFish",
  "pufferfish",
  "tropicalRed",
  "tropicalYellow",
  "tropicalOrange",
  "tropicalPurple",
  "forestFish",
  "forestTurtle",
  "blueTang",
  "barracuda",
  "poolShark",
  "electricalEel",
  "lusca",
  "flyingFish",
  "herring",
  "metalSheet",
  "garbageFish",
  "plasticBottle",
  "clownfish",
  "sunTang",
  "parrotFish",
  "reefShark",
  "foolFish",
  "gagFish",
  "shark67",
  "ghostFish",
  "ghostBarracuda",
  "anglerfish",
  "redCrab",
  "titanPrawn",
  "giantCatShark",
  "hyperliosisPoolShark",
  "anglerShark",
]);

const FISH_WEIGHT_RANGES_G = {
  minnow: [10, 40],
  cod: [20, 50],
  rapFish: [70, 90],
  tropical: [30, 40],
  pufferfish: [70, 140],
  poolShark: [120, 200],
  electricalEel: [60, 120],
  forestTurtle: [120, 160],
  blueTang: [40, 80],
  barracuda: [70, 110],
  lusca: [1200, 3000],
  flyingFish: [10, 20],
  herring: [10, 40],
  metalSheet: [50, 1000],
  garbageFish: [10, 40],
  plasticBottle: [8, 35],
  clownfish: [20, 40],
  sunTang: [70, 90],
  parrotFish: [30, 80],
  reefShark: [70, 140],
  foolFish: [30, 100],
  gagFish: [50, 100],
  shark67: [80, 170],
  ghostFish: [4, 4],
  ghostBarracuda: [70, 110],
  anglerfish: [30, 40],
  redCrab: [90, 240],
  titanPrawn: [120, 240],
  giantCatShark: [200, 400],
  hyperliosisPoolShark: [400, 500],
  anglerShark: [500, 900],
};

function randIntInclusive(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function isGoldMutation() {
  return Math.random() < 1 / 20;
}

function fishKeyFromItemId(itemId) {
  if (itemId === "tropicalPurple") return "tropicalPurple";
  if (itemId === "tropicalRed" || itemId === "tropicalYellow" || itemId === "tropicalOrange") return "tropical";
  if (itemId === "forestFish") return "tropical";
  return itemId;
}

function rollFishWeightG(itemId) {
  if (itemId === "ghostFish") return 4;
  const key = fishKeyFromItemId(itemId);
  if (key === "tropical" || key === "tropicalPurple") {
    const [a, b] = FISH_WEIGHT_RANGES_G.tropical;
    return randIntInclusive(a, b);
  }
  if (key in FISH_WEIGHT_RANGES_G) {
    const [a, b] = FISH_WEIGHT_RANGES_G[key];
    return randIntInclusive(a, b);
  }
  return 50;
}

function fishBaseSellPrice(itemId) {
  const key = fishKeyFromItemId(itemId);
  if (key === "tropicalPurple") return FISH.tropicalPurple.sellPrice;
  if (key === "tropical") return FISH.tropical.sellPrice;
  return (FISH[key] || FISH.minnow).sellPrice;
}

function fishTotalSellValue(item) {
  const base = fishBaseSellPrice(item.id);
  const w = typeof item.weightG === "number" ? item.weightG : rollFishWeightG(item.id);
  const extra = Math.round(w / 10);
  let total = base + extra;
  if (item.forestMut) total *= 1.5;
  if (item.foolsMut) total *= 1.5;
  if (item.gold) total *= 3;
  if (item.hackedMut) total *= 3;
  return Math.max(0, Math.round(total));
}

function fishScaleFromWeight(item) {
  const w = typeof item.weightG === "number" ? item.weightG : 50;
  // Most fish are clamped for readability, but Lusca must be enormous.
  if (item?.id === "lusca") return Math.max(12, w / 100);
  // Metal sheet can get huge.
  if (item?.id === "metalSheet") return Math.max(0.8, w / 100);
  if (item?.id === "plasticBottle") return Math.max(0.65, Math.min(1.15, w / 45));
  if (item?.id === "gunBullets") return 1;
  return Math.max(0.6, Math.min(1.8, w / 100));
}

const ROD_STATS = {
  beginnerRod: {
    progressSpeedModifier: -20,
    zoneWidthPercent: 20,
    catchBarFillSeconds: 5,
    price: 10,
  },
  advancedRod: {
    progressSpeedModifier: -10,
    zoneWidthPercent: 20,
    catchBarFillSeconds: 4.5,
    price: 20,
  },
  metalRod: {
    progressSpeedModifier: -10,
    zoneWidthPercent: 30,
    catchBarFillSeconds: 4.5,
    price: 50,
  },
  testingRod: {
    progressSpeedModifier: 50,
    zoneWidthPercent: 50,
    catchBarFillSeconds: 4.5,
    price: 0,
    luckBonus: 0.3,
  },
  liarRod: {
    progressSpeedModifier: 40,
    zoneWidthPercent: 20,
    catchBarFillSeconds: 4.2,
    price: 0,
    foolsMutationChance: 1,
  },
  forestRod: {
    progressSpeedModifier: 10,
    zoneWidthPercent: 35,
    catchBarFillSeconds: 4.5,
    price: 300,
    forestMutationChance: 0.4,
  },
  speedRod: {
    progressSpeedModifier: 50,
    zoneWidthPercent: 35,
    catchBarFillSeconds: 4.0,
    price: 300,
    lureSpeedBonus: 0.6,
  },
  sharkRod: {
    progressSpeedModifier: 20,
    zoneWidthPercent: 40,
    catchBarFillSeconds: 4.2,
    price: 0,
    sharkBonusChancePerSecond: 0.2,
    sharkBonusCatchPct: 15,
    lureSpeedBonus: 0.2,
  },
  rod67: {
    progressSpeedModifier: 67,
    zoneWidthPercent: 67,
    catchBarFillSeconds: 4.5,
    price: 0,
    lureSpeedBonus: 0.067,
  },
  garbageRod: {
    progressSpeedModifier: -10,
    zoneWidthPercent: 35,
    catchBarFillSeconds: 4.8,
    price: 0,
  },
  gunRod: {
    progressSpeedModifier: 0,
    zoneWidthPercent: 30,
    catchBarFillSeconds: 4.5,
    price: 0,
  },
};

const FISH = {
  minnow: {
    id: "minnow",
    progressSpeedBonus: 20,
    speedMult: 1,
    sellPrice: 5,
    rarity: "common",
    bestiarySection: "greatReef",
    minigameTitle: "Minnow — keep it in the box!",
  },
  cod: {
    id: "cod",
    progressSpeedBonus: 20,
    speedMult: 1.5,
    sellPrice: 7,
    rarity: "common",
    bestiarySection: "greatReef",
    minigameTitle: "Cod — faster! Keep it in the box!",
  },
  tropical: {
    id: "tropical",
    progressSpeedBonus: 0,
    barPctPerSec: 10,
    randomDir: true,
    sellPrice: 9,
    rarity: "uncommon",
    bestiarySection: "greatReef",
    minigameTitle: "Tropical fish — erratic! Keep it in the box!",
  },
  tropicalPurple: {
    id: "tropicalPurple",
    progressSpeedBonus: 0,
    barPctPerSec: 10,
    randomDir: true,
    sellPrice: 100,
    rarity: "uncommon",
    bestiarySection: "greatReef",
    minigameTitle: "Tropical fish (purple) — jackpot! Keep it in the box!",
  },
  pufferfish: {
    id: "pufferfish",
    progressSpeedBonus: -10,
    barPctPerSec: 25,
    dashPauseSeconds: 0.5,
    dashRandomStop: true,
    sellPrice: 15,
    rarity: "uncommon",
    bestiarySection: "greatReef",
    minigameTitle: "Pufferfish — dashes and stops! Keep it in the box!",
  },
  poolShark: {
    id: "poolShark",
    progressSpeedBonus: -50,
    barPctPerSec: 50,
    dashPauseSeconds: 0.5,
    dashRandomStop: true,
    sellPrice: 75,
    rarity: "epic",
    bestiarySection: "ambiencePool",
    minigameTitle: "Pool shark — extremely fast! Keep it in the box!",
  },
  electricalEel: {
    id: "electricalEel",
    progressSpeedBonus: -20,
    barPctPerSec: 14,
    randomDir: true,
    sellPrice: 13,
    rarity: "uncommon",
    bestiarySection: "tropico",
    shockChancePerSecond: 0.10,
    shockStunSeconds: 1,
    minigameTitle: "Electrical eel — may stun your catch! Keep it in the box!",
  },
  forestTurtle: {
    id: "forestTurtle",
    progressSpeedBonus: -30,
    speedMult: 0.85,
    sellPrice: 25,
    rarity: "rare",
    bestiarySection: "tropico",
    minigameTitle: "Forest turtle — heavy! Keep it in the box!",
  },
  blueTang: {
    // Reskinned pufferfish (same behavior, different look)
    id: "blueTang",
    progressSpeedBonus: -10,
    barPctPerSec: 25,
    dashPauseSeconds: 0.5,
    dashRandomStop: true,
    sellPrice: 15,
    rarity: "uncommon",
    bestiarySection: "tropico",
    minigameTitle: "Blue tang — quick bursts! Keep it in the box!",
  },
  barracuda: {
    id: "barracuda",
    progressSpeedBonus: 0,
    barPctPerSec: 60,
    randomDir: true,
    sellPrice: 75,
    rarity: "epic",
    bestiarySection: "tropico",
    minigameTitle: "Barracuda — lightning fast! Keep it in the box!",
  },
  flyingFish: {
    id: "flyingFish",
    progressSpeedBonus: 50,
    barPctPerSec: 80,
    randomDir: true,
    sellPrice: 12,
    rarity: "common",
    bestiarySection: "sunstrike",
    minigameTitle: "Flying fish — it darts across the sky! Keep it in the box!",
  },
  clownfish: {
    id: "clownfish",
    progressSpeedBonus: 10,
    barPctPerSec: 20,
    randomDir: true,
    sellPrice: 9,
    rarity: "common",
    bestiarySection: "sunstrike",
    minigameTitle: "Clownfish — easy catch! Keep it in the box!",
  },
  sunTang: {
    id: "sunTang",
    progressSpeedBonus: -10,
    barPctPerSec: 30,
    randomDir: true,
    sellPrice: 17,
    rarity: "uncommon",
    bestiarySection: "sunstrike",
    minigameTitle: "Sun tang — quick turns! Keep it in the box!",
  },
  parrotFish: {
    id: "parrotFish",
    progressSpeedBonus: 0,
    barPctPerSec: 50,
    randomDir: true,
    sellPrice: 24,
    rarity: "rare",
    bestiarySection: "sunstrike",
    minigameTitle: "ParrotFish — fast! Keep it in the box!",
  },
  reefShark: {
    id: "reefShark",
    progressSpeedBonus: -60,
    barPctPerSec: 60,
    randomDir: true,
    sellPrice: 90,
    rarity: "epic",
    bestiarySection: "sunstrike",
    minigameTitle: "Reef shark — dangerous speed! Keep it in the box!",
  },
  foolFish: {
    id: "foolFish",
    progressSpeedBonus: 0,
    barPctPerSec: 50,
    randomDir: true,
    sellPrice: 40,
    rarity: "uncommon",
    bestiarySection: "eventFish",
    minigameTitle: "Fool fish — April Fools! Keep it in the box!",
  },
  gagFish: {
    id: "gagFish",
    progressSpeedBonus: 10,
    barPctPerSec: 40,
    randomDir: true,
    sellPrice: 50,
    rarity: "uncommon",
    bestiarySection: "eventFish",
    minigameTitle: "Gag fish — April Fools! Keep it in the box!",
  },
  shark67: {
    id: "shark67",
    progressSpeedBonus: -50,
    barPctPerSec: 30,
    randomDir: true,
    sellPrice: 80,
    rarity: "rare",
    bestiarySection: "eventFish",
    minigameTitle: "67 Shark — slow progress, sneaky bar! Keep it in the box!",
  },
  ghostFish: {
    id: "ghostFish",
    progressSpeedBonus: 30,
    barPctPerSec: 40,
    randomDir: true,
    ghostInvisChancePerSecond: 0.1,
    ghostInvisDurationSec: 1,
    sellPrice: 20,
    rarity: "uncommon",
    bestiarySection: "illusion",
    minigameTitle: "Ghost fish — it may vanish! Keep it in the box!",
  },
  ghostBarracuda: {
    id: "ghostBarracuda",
    progressSpeedBonus: 0,
    barPctPerSec: 60,
    randomDir: true,
    sellPrice: 30,
    rarity: "uncommon",
    bestiarySection: "illusion",
    minigameTitle: "Ghost barracuda — fast and faint! Keep it in the box!",
  },
  anglerfish: {
    id: "anglerfish",
    progressSpeedBonus: 50,
    barPctPerSec: 10,
    randomDir: true,
    anglerDecoyChancePerSecond: 0.1,
    anglerDecoyDurationSec: 1,
    sellPrice: 42,
    rarity: "rare",
    bestiarySection: "illusion",
    minigameTitle: "Anglerfish — follow the real lure light! Keep it in the box!",
  },
  herring: {
    id: "herring",
    progressSpeedBonus: 0,
    barPctPerSec: 30,
    randomDir: true,
    sellPrice: 9,
    rarity: "common",
    bestiarySection: "wildOcean",
    minigameTitle: "Herring — steady swimmer. Keep it in the box!",
  },
  metalSheet: {
    id: "metalSheet",
    progressSpeedBonus: 0,
    barPctPerSec: 0,
    randomDir: false,
    sellPrice: 0,
    rarity: "common",
    bestiarySection: "garbage",
    minigameTitle: "Metal sheet — clunky junk. Keep it in the box!",
  },
  garbageFish: {
    id: "garbageFish",
    progressSpeedBonus: 20,
    speedMult: 1,
    sellPrice: 2,
    rarity: "common",
    bestiarySection: "garbage",
    minigameTitle: "Garbage fish — yuck. Keep it in the box!",
  },
  plasticBottle: {
    id: "plasticBottle",
    progressSpeedBonus: 25,
    speedMult: 1.05,
    sellPrice: 1,
    rarity: "common",
    bestiarySection: "garbage",
    minigameTitle: "Plastic bottle — drifts in the junk. Keep it in the box!",
  },
  lusca: {
    id: "lusca",
    progressSpeedBonus: -120,
    barPctPerSec: 75,
    randomDir: true,
    sellPrice: 45000,
    rarity: "forgotten",
    bestiarySection: "wildOcean",
    minigameTitle: "Lusca — legendary! Don't lose it!",
  },
  forestFish: {
    id: "forestFish",
    progressSpeedBonus: 0,
    barPctPerSec: 10,
    randomDir: true,
    sellPrice: 9,
    rarity: "common",
    bestiarySection: "tropico",
    minigameTitle: "Forest fish — keep it in the box!",
  },
  rapFish: {
    id: "rapFish",
    progressSpeedBonus: 0,
    barPctPerSec: 10,
    randomDir: true,
    sellPrice: 10,
    rarity: "uncommon",
    bestiarySection: "ambiencePool",
    minigameTitle: "Rap fish — erratic! Keep it in the box!",
  },
  redCrab: {
    id: "redCrab",
    progressSpeedBonus: -10,
    barPctPerSec: 30,
    randomDir: true,
    sellPrice: 30,
    rarity: "rare",
    bestiarySection: "titanInfection",
    minigameTitle: "Red crab — stubborn catch! Keep it in the box!",
  },
  titanPrawn: {
    id: "titanPrawn",
    progressSpeedBonus: 0,
    barPctPerSec: 50,
    randomDir: true,
    sellPrice: 40,
    rarity: "rare",
    bestiarySection: "titanInfection",
    minigameTitle: "Titan prawn — fast! Keep it in the box!",
  },
  giantCatShark: {
    id: "giantCatShark",
    progressSpeedBonus: -60,
    barPctPerSec: 60,
    randomDir: true,
    sellPrice: 55,
    rarity: "rare",
    bestiarySection: "titanInfection",
    minigameTitle: "Giant cat shark — wild! Keep it in the box!",
  },
  hyperliosisPoolShark: {
    id: "hyperliosisPoolShark",
    progressSpeedBonus: -80,
    barPctPerSec: 40,
    randomDir: true,
    sellPrice: 70,
    rarity: "epic",
    bestiarySection: "titanInfection",
    minigameTitle: "Hyperliosis pool shark — toxic purple! Keep it in the box!",
  },
  anglerShark: {
    id: "anglerShark",
    progressSpeedBonus: -120,
    barPctPerSec: 50,
    randomDir: true,
    anglerDecoyChancePerSecond: 0.1,
    anglerDecoyDurationSec: 1,
    sellPrice: 150,
    rarity: "legendary",
    bestiarySection: "titanInfection",
    minigameTitle: "Angler shark — decoy lights! Keep it in the box!",
  },
};

function hookDurationSeconds(netProgressSpeedPercent) {
  const p = Math.max(0, Math.min(100, netProgressSpeedPercent));
  return 5 - (p / 100) * 2;
}

/** Illusion Island enchants: one per rod id, saved. */
const ILLUSION_ENCHANT_TYPES = ["speed", "strength", "immortality", "luck"];
const ENCHANT_LABELS = {
  speed: "Speed (+20% lure speed, +20% progress speed)",
  strength: "Strength (+20% bar size)",
  immortality: "Immortality (fish in purple water & any water safely)",
  luck: "Luck (+20% luck boost)",
};

let rodEnchants = {};
let pendingIllusionEnchant = null;
let illusionEntryFeeMsgUntil = 0;

function getRodEnchant(rodId) {
  return rodEnchants[rodId] || null;
}

function getRodStats(equipped) {
  const id = equipped?.id;
  if (!id || !ROD_STATS[id]) {
    return applyIllusionEnchantToStats({ ...ROD_STATS.beginnerRod }, getRodEnchant("beginnerRod"));
  }
  const base = { ...ROD_STATS[id] };
  return applyIllusionEnchantToStats(base, getRodEnchant(id));
}

function applyIllusionEnchantToStats(base, en) {
  if (!en) return base;
  if (en === "speed") {
    let l = base.lureSpeedBonus || 0;
    l = l * 1.2;
    if (Math.abs(l) < 1e-8) l = 0.2;
    base.lureSpeedBonus = l;
    base.progressSpeedModifier = Math.round((base.progressSpeedModifier || 0) * 1.2);
  } else if (en === "strength") {
    base.zoneWidthPercent = Math.min(100, Math.round((base.zoneWidthPercent || 20) * 1.2));
  } else if (en === "luck") {
    let lk = base.luckBonus || 0;
    lk = lk * 1.2;
    if (Math.abs(lk) < 1e-8) lk = 0.2;
    base.luckBonus = lk;
  }
  return base;
}

function getFishDef(id) {
  return FISH[id] || FISH.minnow;
}

function fishDefForMinigameId(fid) {
  if (fid === "tropical") return FISH.tropical;
  if (fid === "tropicalPurple") return FISH.tropicalPurple;
  return getFishDef(fid);
}

const TILE = {
  DEEP_OCEAN: 1,
  SHALLOW_OCEAN: 2,
  SAND: 3,
  GRASS: 4,
  POND: 5,
  TREE: 6,
  DARK_POOL: 7,
  FOREST: 8,
  LAKE: 9,
  DESERT: 10,
  CACTUS: 11,
  MOUNTAIN: 12,
  CAVE: 13,
  APRIL_FOOLS_GRASS: 14,
  ILLUSION_LAND: 15,
  ILLUSION_WATER: 16,
  ILLUSION_CAVE_EXIT: 17,
  /** Sunstrike ↔ Illusion portal (single flat color, not cave art) */
  ILLUSION_PORTAL: 18,
};

/** Real calendar: April 1–7 (local). Island is removed outside this window. */
function isAprilFoolsWeekActive() {
  const d = new Date();
  return d.getMonth() === 3 && d.getDate() >= 1 && d.getDate() <= 7;
}

const APRIL_FOOLS_WIDTH_TILES = 10;
const APRIL_FOOLS_HEIGHT_TILES = 16;

function refreshAprilFoolsIsland() {
  const active = isAprilFoolsWeekActive();
  const idx = islands.findIndex((x) => x.kind === "aprilFools");
  if (active && idx === -1) {
    const gr = islands.find((x) => x.kind === "grandReef") || islands[0];
    islands.push({
      cx: gr.cx,
      cy: gr.cy - 100 * TILE_SIZE,
      name: "April Fools Island",
      kind: "aprilFools",
      widthTiles: APRIL_FOOLS_WIDTH_TILES,
      heightTiles: APRIL_FOOLS_HEIGHT_TILES,
      standBlocks: {
        sell: { tx: -3, ty: 5, w: 2, h: 2 },
        shop: { tx: 2, ty: 5, w: 2, h: 2 },
        harbor: { tx: -1, ty: -5, w: 2, h: 2 },
      },
    });
  } else if (!active && idx !== -1) {
    islands.splice(idx, 1);
    const on = islandAtPoint(player.x, player.y);
    if (on?.kind === "aprilFools") {
      player.x = 0;
      player.y = -ISLAND_HALF_PX * 0.75;
    }
  }
}

let islands = [
  { cx: 0, cy: 0, name: "Grand Reef Island", kind: "grandReef" },
  { cx: 2800, cy: -500, name: "Tropico Island", kind: "tropico" },
  { cx: -2600, cy: 800, name: "Sunstrike Island", kind: "sunstrike" },
];

// Garbage island (6x6) with destroy stand
const garbageIsland = { cx: -1200, cy: 2200, name: "Garbage Island", kind: "garbage", sizeTiles: 6 };
islands.push(garbageIsland);

/** Far above Grand Reef — no minimap arrow (see drawIslandArrowOverlay). Enter from Sunstrike cave. */
const ILLUSION_ISLAND_TILES = 56;
function illusionIslandPosition() {
  const gr = islands.find((x) => x.kind === "grandReef") || islands[0];
  return {
    cx: gr.cx,
    cy: gr.cy - 10000 * TILE_SIZE,
    name: "Illusion Island",
    kind: "illusion",
    widthTiles: ILLUSION_ISLAND_TILES,
    heightTiles: ILLUSION_ISLAND_TILES,
    noArrow: true,
  };
}
islands.push(illusionIslandPosition());

function ensureCraftIsland() {
  if (craftIsland && typeof craftIsland.cx === "number" && typeof craftIsland.cy === "number") {
    // ok
  } else {
    const trop = islands.find((x) => x.kind === "tropico") || islands[1];
    // Random-ish island beneath Tropico (saved so it doesn't move).
    craftIsland = {
      cx: trop.cx + Math.floor((Math.random() * 2 - 1) * 700),
      cy: trop.cy + 1600 + Math.floor(Math.random() * 500),
    };
  }
  const exists = islands.some((x) => x.kind === "craft");
  if (!exists) islands.push({ cx: craftIsland.cx, cy: craftIsland.cy, name: "", kind: "craft" });
}

const SAVE_KEY = "fishingWorldSaveV2";

/** 2×2 stall corners (tile coords); 4-tile gap between stalls */
const SELL_STAND_BLOCK = { tx: -7, ty: 5, w: 2, h: 2 };
const SHOP_STAND_BLOCK = { tx: -1, ty: 5, w: 2, h: 2 };
const HARBOR_BLOCK = { tx: 6, ty: 6, w: 2, h: 2 };
const DESTROY_BLOCK = { tx: 0, ty: 0, w: 2, h: 2 };

const grandReefTrees = [
  { tx: -6, ty: -6 },
  { tx: 6, ty: -6 },
  { tx: -5, ty: 6 },
  { tx: 6, ty: 5 },
  { tx: 0, ty: -7 },
  { tx: -7, ty: 0 },
];

let camera = { x: 0, y: 0 };
const player = {
  x: 0,
  y: -ISLAND_HALF_PX * 0.75,
  r: 14,
  half: 14,
  speed: 220,
  facing: { x: 0, y: 1 },
};

let keys = {};
let selectedSlot = 0;
const inventory = Array(SLOT_COUNT).fill(null);
const backpack = Array(BACKPACK_SIZE).fill(null);
const favorites = Array(FAVORITES_SIZE).fill(null);

let money = 0;
let aprilFoolsTokens = 0;
/** Full account backup before last Restore_save (for Undo_restore). Persisted in save. */
let restoreSaveUndoSnapshot = null;
let lastFishingIslandKind = null;
let hackedInventoryAnimAcc = 0;
let backpackOpen = false;

function syncBackpackOpenBodyClass() {
  document.body.classList.toggle("backpack-open", backpackOpen);
}
let bestiaryOpen = false;
let gameState = "playing";
let waterTimer = 0;
let ownedBoat = false;
let onBoat = false;
let bestiaryTab = "greatReef";
let craftIsland = null;

// Day/Night + storms
const DAY_NIGHT_PHASE_SECONDS = 10 * 60; // 10 minutes per phase
let phaseTimer = 0;
let isNight = false;
let stormActive = false;
let stormTimer = 0;
let nextStormIn = 7 * 60 + Math.random() * (5 * 60); // 7–12 minutes
let lightningFlashT = 0;

const caughtFish = {
  minnow: false,
  cod: false,
  rapFish: false,
  tropical: false,
  pufferfish: false,
  forestFish: false,
  poolShark: false,
  electricalEel: false,
  forestTurtle: false,
  blueTang: false,
  barracuda: false,
  lusca: false,
  flyingFish: false,
  herring: false,
  metalSheet: false,
  garbageFish: false,
  plasticBottle: false,
  clownfish: false,
  sunTang: false,
  parrotFish: false,
  reefShark: false,
  foolFish: false,
  gagFish: false,
  shark67: false,
  ghostFish: false,
  ghostBarracuda: false,
  anglerfish: false,
  redCrab: false,
  titanPrawn: false,
  giantCatShark: false,
  hyperliosisPoolShark: false,
  anglerShark: false,
};

const TITAN_INFECTION_DURATION_MS = 3 * 60 * 1000;
/** { key: "tx,ty", until: ms timestamp } — red water & loot table expire after 3 minutes. */
let titanInfectedTiles = [];

function pruneTitanInfections() {
  const now = Date.now();
  titanInfectedTiles = titanInfectedTiles.filter((e) => e.until > now);
}

function titanInfectedTilesFromSaveData(arr) {
  if (!Array.isArray(arr)) return [];
  const now = Date.now();
  const out = [];
  for (const x of arr) {
    if (typeof x === "string") {
      out.push({ key: x, until: now + TITAN_INFECTION_DURATION_MS });
    } else if (x && typeof x.key === "string" && typeof x.until === "number" && x.until > now) {
      out.push({ key: x.key, until: x.until });
    }
  }
  return out;
}

let craftingUiMode = "shark";

let fishingState = "idle";
let hookElapsed = 0;
let hookDuration = 5;
let minigame = null;
let castPoint = { x: 0, y: 0 };
let activeRodStats = ROD_STATS.beginnerRod;
let pendingFishId = "minnow";
let pendingRodDrop = null;
let garbageRodPity = 0; // eligible attempts since last garbage rod
let equippedRodId = "beginnerRod";
const ownedRods = new Set(["beginnerRod"]);
let pendingTropical = null;
let held = { kind: "rod", uid: null }; // 'rod' | 'item'
let uidCounter = 0;

function newUid() {
  uidCounter = (uidCounter + 1) % 1_000_000_000;
  return `f_${Date.now().toString(36)}_${uidCounter.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function hashStringToUnit(s) {
  // Simple deterministic hash -> [0,1)
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function drawGoldSparklesIcon(c, w, h, seedStr) {
  const seed = hashStringToUnit(seedStr || "x");
  c.save();
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const a = (seed * 6.283 + i * 0.9) % 6.283;
    const r = 0.36 + ((seed * 13.37 + i * 0.21) % 1) * 0.48;
    const x = w / 2 + Math.cos(a) * (w * r * 0.45);
    const y = h / 2 + Math.sin(a) * (h * r * 0.45);
    const rad = 1.2 + ((seed * 91.7 + i * 0.37) % 1) * 2.1;
    c.fillStyle = "rgba(255, 235, 59, 0.9)";
    c.beginPath();
    c.arc(x, y, rad, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawGoldSparklesWorld(c, x, y, radiusPx, tSec, seedStr) {
  const seed = hashStringToUnit(seedStr || "x");
  c.save();
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 10; i++) {
    const phase = seed * 10 + i * 1.7;
    const ang = phase + tSec * (1.2 + (i % 3) * 0.35);
    const rr = radiusPx * (0.55 + 0.35 * Math.sin(tSec * 2.3 + phase));
    const sx = x + Math.cos(ang) * rr;
    const sy = y + Math.sin(ang) * (rr * 0.72);
    const rad = 1.2 + 1.8 * (0.5 + 0.5 * Math.sin(tSec * 6.0 + phase));
    c.fillStyle = "rgba(255, 235, 59, 0.75)";
    c.beginPath();
    c.arc(sx, sy, rad, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawForestMutationOverlay(c, x, y, s) {
  // Tiny tree sitting above the fish
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // trunk
  c.fillStyle = "rgba(90, 55, 25, 0.95)";
  c.fillRect(-1.6, 2.2, 3.2, 5.4);
  // leaves
  c.fillStyle = "rgba(46, 125, 50, 0.95)";
  c.beginPath();
  c.arc(0, 1.5, 4.6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(120, 200, 120, 0.85)";
  c.beginPath();
  c.arc(1.5, 0.6, 2.2, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawFoolsMutationOverlay(c, x, y, s) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = "rgba(255, 112, 146, 0.92)";
  c.strokeStyle = "rgba(0,0,0,0.28)";
  c.lineWidth = 1;
  c.beginPath();
  c.arc(0, -2, 5.2, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.95)";
  c.font = "bold 7px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("?", 0, -2);
  c.restore();
}

function drawLightningMutationOverlay(c, x, y, s) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalCompositeOperation = "lighter";
  c.fillStyle = "rgba(255, 241, 118, 0.95)";
  c.strokeStyle = "rgba(0,0,0,0.25)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-1, -6);
  c.lineTo(3, -6);
  c.lineTo(0, 0);
  c.lineTo(4, 0);
  c.lineTo(-2, 8);
  c.lineTo(1, 2);
  c.lineTo(-3, 2);
  c.closePath();
  c.fill();
  c.stroke();
  c.restore();
}

/** Random colored blocks ~10% of rect; swaps position every ~0.55s (hacked mutation, 3× sell). */
function drawHackedGlitchOverlay(c, w, h, uid, nowMs) {
  const t = (nowMs / 1000) % 1.2;
  const phase = t < 0.45 ? 1 : t >= 0.55 && t < 1.05 ? 2 : 0;
  if (!phase) return;
  let seed = 2166136261;
  for (let i = 0; i < (uid || "x").length; i++) {
    seed ^= (uid || "x").charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  seed = (seed >>> 0) + phase * 977;
  const rnd = (k) => {
    seed = Math.imul(seed ^ k, 1597334677);
    return ((seed >>> 0) % 10000) / 10000;
  };
  const ox = (phase === 1 ? rnd(1) : rnd(2)) * 0.62 * w;
  const oy = (phase === 1 ? rnd(3) : rnd(4)) * 0.55 * h;
  const targetArea = w * h * 0.1;
  let acc = 0;
  let i = 0;
  const bs = 3;
  c.save();
  c.globalAlpha = 0.92;
  while (acc < targetArea && i < 220) {
    i++;
    const dx = ox + rnd(i + 10) * 0.32 * w;
    const dy = oy + rnd(i + 20) * 0.38 * h;
    c.fillStyle = `hsl(${Math.floor(rnd(i + 30) * 360)}, 88%, ${42 + rnd(i + 40) * 22}%)`;
    c.fillRect(dx, dy, bs, bs);
    acc += bs * bs;
  }
  c.restore();
}

function drawHackedGlitchWorld(c, cx, cy, scale, uid) {
  const w = 52 * scale;
  const h = 38 * scale;
  c.save();
  c.translate(cx - w / 2, cy - h / 2);
  drawHackedGlitchOverlay(c, w, h, uid, performance.now());
  c.restore();
}

const redeemedCodes = new Set();

function itemFromStored(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    const base = ITEMS[entry];
    if (!base) return null;
    if (FISH_ITEM_IDS.has(entry)) {
      // old saves: default to midpoint weight, non-gold
      const w = rollFishWeightG(entry);
      return { ...base, uid: newUid(), weightG: w, gold: false, hackedMut: false };
    }
    if (UID_MISC_ITEM_IDS.has(entry)) {
      return { ...base, uid: newUid() };
    }
    if (entry === "gunBullets") {
      return { ...ITEMS.gunBullets, uid: newUid(), qty: 1 };
    }
    return { ...base };
  }
  if (typeof entry === "object" && typeof entry.id === "string") {
    const base = ITEMS[entry.id];
    if (!base) return null;
    if (FISH_ITEM_IDS.has(entry.id)) {
      const w = typeof entry.weightG === "number" ? entry.weightG : rollFishWeightG(entry.id);
      const gold = !!entry.gold;
      const forestMut = !!entry.forestMut;
      const lightningMut = !!entry.lightningMut;
      const foolsMut = !!entry.foolsMut;
      const hackedMut = !!entry.hackedMut;
      const uid = typeof entry.uid === "string" ? entry.uid : newUid();
      return { ...base, uid, weightG: w, gold, forestMut, lightningMut, foolsMut, hackedMut };
    }
    if (UID_MISC_ITEM_IDS.has(entry.id)) {
      const uid = typeof entry.uid === "string" ? entry.uid : newUid();
      return { ...base, uid };
    }
    if (entry.id === "gunBullets") {
      const uid = typeof entry.uid === "string" ? entry.uid : newUid();
      const qty = Math.max(1, Math.floor(Number(entry.qty)) || 1);
      return { ...ITEMS.gunBullets, uid, qty };
    }
    return { ...base };
  }
  return null;
}

function serializeSlots(arr) {
  return arr.map((x) => {
    if (!x || !x.id) return null;
    if (FISH_ITEM_IDS.has(x.id)) {
      return {
        id: x.id,
        uid: x.uid,
        weightG: x.weightG,
        gold: !!x.gold,
        forestMut: !!x.forestMut,
        lightningMut: !!x.lightningMut,
        foolsMut: !!x.foolsMut,
        hackedMut: !!x.hackedMut,
      };
    }
    if (UID_MISC_ITEM_IDS.has(x.id)) {
      return { id: x.id, uid: x.uid };
    }
    if (x.id === "gunBullets") {
      return { id: "gunBullets", uid: x.uid, qty: Math.max(1, Math.floor(Number(x.qty)) || 1) };
    }
    return x.id;
  });
}

function sanitizeStorage() {
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i] && ROD_IDS.has(inventory[i].id)) inventory[i] = null;
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i] && ROD_IDS.has(backpack[i].id)) backpack[i] = null;
  }
  for (let i = 0; i < FAVORITES_SIZE; i++) {
    if (favorites[i] && ROD_IDS.has(favorites[i].id)) favorites[i] = null;
  }
}

function captureRestoreSnapshot() {
  sanitizeStorage();
  pruneTitanInfections();
  return {
    money,
    aprilFoolsTokens,
    inventory: serializeSlots(inventory),
    backpack: serializeSlots(backpack),
    favorites: serializeSlots(favorites),
    caughtFish: { ...caughtFish },
    player: { x: player.x, y: player.y, fx: player.facing.x, fy: player.facing.y },
    selectedSlot,
    equippedRodId,
    ownedRods: Array.from(ownedRods),
    held: { ...held },
    ownedBoat,
    craftIsland: craftIsland ? { ...craftIsland } : null,
    garbageRodPity,
    rodEnchants: { ...rodEnchants },
    redeemedCodes: Array.from(redeemedCodes),
    titanInfectedTiles: titanInfectedTiles.map((e) => ({ key: e.key, until: e.until })),
  };
}

function applyRestoreSnapshot(data) {
  if (!data || typeof data !== "object") return;
  money = Number(data.money) || 0;
  aprilFoolsTokens = Math.max(0, Number(data.aprilFoolsTokens) | 0);
  for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = itemFromStored(data.inventory?.[i]);
  for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = itemFromStored(data.backpack?.[i]);
  if (Array.isArray(data.favorites)) {
    for (let i = 0; i < FAVORITES_SIZE; i++) favorites[i] = itemFromStored(data.favorites[i]);
  } else {
    for (let i = 0; i < FAVORITES_SIZE; i++) favorites[i] = null;
  }
  sanitizeStorage();
  const cf = data.caughtFish || {};
  caughtFish.minnow = !!cf.minnow;
  caughtFish.cod = !!cf.cod;
  caughtFish.rapFish = !!cf.rapFish;
  caughtFish.tropical = !!cf.tropical;
  caughtFish.pufferfish = !!cf.pufferfish;
  caughtFish.forestFish = !!cf.forestFish;
  caughtFish.poolShark = !!cf.poolShark;
  caughtFish.electricalEel = !!cf.electricalEel;
  caughtFish.forestTurtle = !!cf.forestTurtle;
  caughtFish.blueTang = !!cf.blueTang;
  caughtFish.barracuda = !!cf.barracuda;
  caughtFish.lusca = !!cf.lusca;
  caughtFish.flyingFish = !!cf.flyingFish;
  caughtFish.herring = !!cf.herring;
  caughtFish.metalSheet = !!cf.metalSheet;
  caughtFish.garbageFish = !!cf.garbageFish;
  caughtFish.plasticBottle = !!cf.plasticBottle;
  caughtFish.clownfish = !!cf.clownfish;
  caughtFish.sunTang = !!cf.sunTang;
  caughtFish.parrotFish = !!cf.parrotFish;
  caughtFish.reefShark = !!cf.reefShark;
  caughtFish.foolFish = !!cf.foolFish;
  caughtFish.gagFish = !!cf.gagFish;
  caughtFish.shark67 = !!cf.shark67;
  caughtFish.ghostFish = !!cf.ghostFish;
  caughtFish.ghostBarracuda = !!cf.ghostBarracuda;
  caughtFish.anglerfish = !!cf.anglerfish;
  caughtFish.redCrab = !!cf.redCrab;
  caughtFish.titanPrawn = !!cf.titanPrawn;
  caughtFish.giantCatShark = !!cf.giantCatShark;
  caughtFish.hyperliosisPoolShark = !!cf.hyperliosisPoolShark;
  caughtFish.anglerShark = !!cf.anglerShark;
  titanInfectedTiles = titanInfectedTilesFromSaveData(data.titanInfectedTiles);
  if (data.player && typeof data.player.x === "number" && typeof data.player.y === "number") {
    player.x = data.player.x;
    player.y = data.player.y;
    player.facing.x = data.player.fx ?? 0;
    player.facing.y = data.player.fy ?? 1;
  }
  selectedSlot = Math.min(SLOT_COUNT - 1, Math.max(0, data.selectedSlot | 0));
  ownedRods.clear();
  if (Array.isArray(data.ownedRods)) {
    for (const rid of data.ownedRods) if (ROD_STATS[rid]) ownedRods.add(rid);
  }
  if (ownedRods.size === 0) ownedRods.add("beginnerRod");
  equippedRodId = ownedRods.has(data.equippedRodId) ? data.equippedRodId : "beginnerRod";
  held = { kind: data.held?.kind === "item" ? "item" : "rod", uid: typeof data.held?.uid === "string" ? data.held.uid : null };
  if (held.kind === "item" && held.uid) {
    const exists =
      inventory.some((x) => x && x.uid === held.uid) ||
      backpack.some((x) => x && x.uid === held.uid) ||
      favorites.some((x) => x && x.uid === held.uid);
    if (!exists) held = { kind: "rod", uid: null };
  }
  redeemedCodes.clear();
  if (Array.isArray(data.redeemedCodes)) {
    for (const c of data.redeemedCodes) if (typeof c === "string") redeemedCodes.add(c);
  }
  ownedBoat = !!data.ownedBoat;
  craftIsland =
    data.craftIsland && typeof data.craftIsland.cx === "number" && typeof data.craftIsland.cy === "number"
      ? { cx: data.craftIsland.cx, cy: data.craftIsland.cy }
      : null;
  garbageRodPity = Math.max(0, (data.garbageRodPity | 0) || 0);
  rodEnchants = {};
  if (data.rodEnchants && typeof data.rodEnchants === "object") {
    for (const k of Object.keys(data.rodEnchants)) {
      if (ROD_IDS.has(k) && ILLUSION_ENCHANT_TYPES.includes(data.rodEnchants[k])) rodEnchants[k] = data.rodEnchants[k];
    }
  }
  ensureCraftIsland();
  refreshAprilFoolsIsland();
}

function saveGame() {
  try {
    sanitizeStorage();
    pruneTitanInfections();
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        v: 3,
        money,
        inventory: serializeSlots(inventory),
        backpack: serializeSlots(backpack),
        favorites: serializeSlots(favorites),
        caughtFish: { ...caughtFish },
        player: {
          x: player.x,
          y: player.y,
          fx: player.facing.x,
          fy: player.facing.y,
        },
        selectedSlot,
        equippedRodId,
        ownedRods: Array.from(ownedRods),
        held,
        redeemedCodes: Array.from(redeemedCodes),
        ownedBoat,
        craftIsland,
        garbageRodPity,
        aprilFoolsTokens,
        rodEnchants: { ...rodEnchants },
        restoreSaveUndoSnapshot,
        titanInfectedTiles: titanInfectedTiles.map((e) => ({ key: e.key, until: e.until })),
      })
    );
  } catch (e) {
    /* ignore quota / private mode */
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if ((data.v !== 1 && data.v !== 2 && data.v !== 3) || !Array.isArray(data.inventory) || !Array.isArray(data.backpack)) {
      return false;
    }
    money = Number(data.money) || 0;
    aprilFoolsTokens = Math.max(0, Number(data.aprilFoolsTokens) | 0);
    for (let i = 0; i < SLOT_COUNT; i++) {
      inventory[i] = itemFromStored(data.inventory[i]);
    }
    for (let i = 0; i < BACKPACK_SIZE; i++) {
      backpack[i] = itemFromStored(data.backpack[i]);
    }
    if (Array.isArray(data.favorites)) {
      for (let i = 0; i < FAVORITES_SIZE; i++) {
        favorites[i] = itemFromStored(data.favorites[i]);
      }
    } else {
      for (let i = 0; i < FAVORITES_SIZE; i++) favorites[i] = null;
    }
    sanitizeStorage();
    caughtFish.minnow = !!data.caughtFish?.minnow;
    caughtFish.cod = !!data.caughtFish?.cod;
    caughtFish.rapFish = !!data.caughtFish?.rapFish;
    caughtFish.tropical = !!data.caughtFish?.tropical;
    caughtFish.pufferfish = !!data.caughtFish?.pufferfish;
    caughtFish.forestFish = !!data.caughtFish?.forestFish;
    caughtFish.poolShark = !!data.caughtFish?.poolShark;
    caughtFish.electricalEel = !!data.caughtFish?.electricalEel;
    caughtFish.forestTurtle = !!data.caughtFish?.forestTurtle;
    caughtFish.blueTang = !!data.caughtFish?.blueTang;
    caughtFish.barracuda = !!data.caughtFish?.barracuda;
    caughtFish.lusca = !!data.caughtFish?.lusca;
    caughtFish.flyingFish = !!data.caughtFish?.flyingFish;
    caughtFish.herring = !!data.caughtFish?.herring;
    caughtFish.metalSheet = !!data.caughtFish?.metalSheet;
    caughtFish.garbageFish = !!data.caughtFish?.garbageFish;
    caughtFish.plasticBottle = !!data.caughtFish?.plasticBottle;
    caughtFish.clownfish = !!data.caughtFish?.clownfish;
    caughtFish.sunTang = !!data.caughtFish?.sunTang;
    caughtFish.parrotFish = !!data.caughtFish?.parrotFish;
    caughtFish.reefShark = !!data.caughtFish?.reefShark;
    caughtFish.foolFish = !!data.caughtFish?.foolFish;
    caughtFish.gagFish = !!data.caughtFish?.gagFish;
    caughtFish.shark67 = !!data.caughtFish?.shark67;
    caughtFish.ghostFish = !!data.caughtFish?.ghostFish;
    caughtFish.ghostBarracuda = !!data.caughtFish?.ghostBarracuda;
    caughtFish.anglerfish = !!data.caughtFish?.anglerfish;
    caughtFish.redCrab = !!data.caughtFish?.redCrab;
    caughtFish.titanPrawn = !!data.caughtFish?.titanPrawn;
    caughtFish.giantCatShark = !!data.caughtFish?.giantCatShark;
    caughtFish.hyperliosisPoolShark = !!data.caughtFish?.hyperliosisPoolShark;
    caughtFish.anglerShark = !!data.caughtFish?.anglerShark;
    titanInfectedTiles = titanInfectedTilesFromSaveData(data.titanInfectedTiles);
    if (data.player && typeof data.player.x === "number" && typeof data.player.y === "number") {
      player.x = data.player.x;
      player.y = data.player.y;
      player.facing.x = data.player.fx ?? 0;
      player.facing.y = data.player.fy ?? 1;
    }
    selectedSlot = Math.min(SLOT_COUNT - 1, Math.max(0, data.selectedSlot | 0));
    ownedRods.clear();
    if (Array.isArray(data.ownedRods)) {
      for (const rid of data.ownedRods) if (ROD_STATS[rid]) ownedRods.add(rid);
    }
    if (ownedRods.size === 0) ownedRods.add("beginnerRod");
    equippedRodId = ownedRods.has(data.equippedRodId) ? data.equippedRodId : "beginnerRod";
    held = { kind: data.held?.kind === "item" ? "item" : "rod", uid: typeof data.held?.uid === "string" ? data.held.uid : null };
    if (held.kind === "item" && held.uid) {
      const exists =
        inventory.some((x) => x && x.uid === held.uid) ||
        backpack.some((x) => x && x.uid === held.uid) ||
        favorites.some((x) => x && x.uid === held.uid);
      if (!exists) held = { kind: "rod", uid: null };
    }
    redeemedCodes.clear();
    if (Array.isArray(data.redeemedCodes)) {
      for (const c of data.redeemedCodes) if (typeof c === "string") redeemedCodes.add(c);
    }
    ownedBoat = !!data.ownedBoat;
    craftIsland =
      data.craftIsland && typeof data.craftIsland.cx === "number" && typeof data.craftIsland.cy === "number"
        ? { cx: data.craftIsland.cx, cy: data.craftIsland.cy }
        : null;
    garbageRodPity = Math.max(0, (data.garbageRodPity | 0) || 0);
    ensureCraftIsland();
    refreshAprilFoolsIsland();
    rodEnchants = {};
    if (data.rodEnchants && typeof data.rodEnchants === "object") {
      for (const k of Object.keys(data.rodEnchants)) {
        if (ROD_IDS.has(k) && ILLUSION_ENCHANT_TYPES.includes(data.rodEnchants[k])) rodEnchants[k] = data.rodEnchants[k];
      }
    }
    restoreSaveUndoSnapshot =
      data.restoreSaveUndoSnapshot && typeof data.restoreSaveUndoSnapshot === "object"
        ? data.restoreSaveUndoSnapshot
        : null;
    return true;
  } catch (e) {
    return false;
  }
}

function applyDefaultNewGame() {
  money = 0;
  aprilFoolsTokens = 0;
  for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = null;
  for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = null;
  for (let i = 0; i < FAVORITES_SIZE; i++) favorites[i] = null;
  caughtFish.minnow = false;
  caughtFish.cod = false;
  caughtFish.rapFish = false;
  caughtFish.tropical = false;
  caughtFish.pufferfish = false;
  caughtFish.forestFish = false;
  caughtFish.poolShark = false;
  caughtFish.electricalEel = false;
  caughtFish.forestTurtle = false;
  caughtFish.blueTang = false;
  caughtFish.barracuda = false;
  caughtFish.lusca = false;
  caughtFish.flyingFish = false;
  caughtFish.herring = false;
  caughtFish.metalSheet = false;
  caughtFish.garbageFish = false;
  caughtFish.plasticBottle = false;
  caughtFish.clownfish = false;
  caughtFish.sunTang = false;
  caughtFish.parrotFish = false;
  caughtFish.reefShark = false;
  caughtFish.foolFish = false;
  caughtFish.gagFish = false;
  caughtFish.shark67 = false;
  caughtFish.ghostFish = false;
  caughtFish.ghostBarracuda = false;
  caughtFish.anglerfish = false;
  caughtFish.redCrab = false;
  caughtFish.titanPrawn = false;
  caughtFish.giantCatShark = false;
  caughtFish.hyperliosisPoolShark = false;
  caughtFish.anglerShark = false;
  titanInfectedTiles = [];
  player.x = 0;
  player.y = -ISLAND_HALF_PX * 0.75;
  player.facing.x = 0;
  player.facing.y = 1;
  selectedSlot = 0;
  ownedRods.clear();
  ownedRods.add("beginnerRod");
  equippedRodId = "beginnerRod";
  held = { kind: "rod", uid: null };
  redeemedCodes.clear();
  ownedBoat = false;
  onBoat = false;
  craftIsland = null;
  garbageRodPity = 0;
  rodEnchants = {};
  restoreSaveUndoSnapshot = null;
  pendingIllusionEnchant = null;
  islands = islands.filter((x) => x.kind !== "craft" && x.kind !== "aprilFools");
  ensureCraftIsland();
  refreshAprilFoolsIsland();
}

function resize() {
  // High-DPI displays can be extremely expensive to render on slower machines.
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function islandWorldPos(island, tx, ty) {
  return {
    x: island.cx + (tx + 0.5) * TILE_SIZE,
    y: island.cy + (ty + 0.5) * TILE_SIZE,
  };
}

function blockCenterWorld(island, block) {
  return {
    x: island.cx + (block.tx + block.w / 2) * TILE_SIZE,
    y: island.cy + (block.ty + block.h / 2) * TILE_SIZE,
  };
}

function islandHalfExtentPx(island) {
  const wT = island?.widthTiles ?? island?.sizeTiles ?? ISLAND_TILES;
  const hT = island?.heightTiles ?? island?.sizeTiles ?? ISLAND_TILES;
  return { halfWPx: (wT / 2) * TILE_SIZE, halfHPx: (hT / 2) * TILE_SIZE };
}

function inIslandLand(px, py, island) {
  const { halfWPx, halfHPx } = islandHalfExtentPx(island);
  return Math.abs(px - island.cx) < halfWPx && Math.abs(py - island.cy) < halfHPx;
}

function islandDistPx(px, py, island) {
  return Math.hypot(px - island.cx, py - island.cy);
}

function getNearestIsland(px, py) {
  let best = islands[0];
  let bestD = islandDistPx(px, py, best);
  for (let i = 1; i < islands.length; i++) {
    const d = islandDistPx(px, py, islands[i]);
    if (d < bestD) {
      bestD = d;
      best = islands[i];
    }
  }
  return best;
}

/** Central 5×5 dark blue ambience pool */
function inDarkPool(px, py, island) {
  if (!inIslandLand(px, py, island)) return false;
  const dx = (px - island.cx) / TILE_SIZE;
  const dy = (py - island.cy) / TILE_SIZE;
  return Math.abs(dx) <= 2.5 && Math.abs(dy) <= 2.5;
}

function onTreeAt(px, py) {
  const gr = islands[0];
  if (!inIslandLand(px, py, gr)) return false;
  if (inDarkPool(px, py, gr)) return false;
  const tr = TILE_SIZE * 0.48;
  for (const t of grandReefTrees) {
    const wx = gr.cx + (t.tx + 0.5) * TILE_SIZE;
    const wy = gr.cy + (t.ty + 0.5) * TILE_SIZE;
    if (Math.hypot(px - wx, py - wy) < tr) return true;
  }
  return false;
}

function inTropicoLake(px, py, island) {
  if (!inIslandLand(px, py, island)) return false;
  const lakes = [
    { x: island.cx + 3.5 * TILE_SIZE, y: island.cy - 2.5 * TILE_SIZE, r: 1.8 * TILE_SIZE },
    { x: island.cx - 3.2 * TILE_SIZE, y: island.cy + 3.0 * TILE_SIZE, r: 1.6 * TILE_SIZE },
    { x: island.cx + 0.5 * TILE_SIZE, y: island.cy + 0.5 * TILE_SIZE, r: 1.4 * TILE_SIZE },
  ];
  for (const l of lakes) {
    if (Math.hypot(px - l.x, py - l.y) < l.r) return true;
  }
  return false;
}

function getTileTypeAt(px, py) {
  for (const is of islands) {
    if (!inIslandLand(px, py, is)) continue;
    if (is.kind === "grandReef" && inDarkPool(px, py, is)) return TILE.DARK_POOL;
    if (is.kind === "tropico") {
      if (inTropicoLake(px, py, is)) return TILE.LAKE;
      return TILE.FOREST;
    }
    if (is.kind === "sunstrike") {
      // Desert with cactus + a small mountain with a cave in the middle
      const mx = is.cx;
      const my = is.cy;
      const d = Math.hypot(px - mx, py - my);
      if (d < TILE_SIZE * 2.7) {
        // cave mouth right at the center
        if (d < TILE_SIZE * 0.75) return TILE.ILLUSION_PORTAL;
        return TILE.MOUNTAIN;
      }
      // Cactus sprinkled across desert (tile-based deterministic)
      const tx = Math.floor(px / TILE_SIZE);
      const ty = Math.floor(py / TILE_SIZE);
      if (tileHash(tx, ty) > 0.92) return TILE.CACTUS;
      return TILE.DESERT;
    }
    if (is.kind === "garbage") {
      // Gray junk ground
      return TILE.MOUNTAIN;
    }
    if (is.kind === "aprilFools") {
      const tx = Math.floor(px / TILE_SIZE);
      const ty = Math.floor(py / TILE_SIZE);
      if (tileHash(tx + 11, ty + 3) > 0.965) return TILE.POND;
      return TILE.APRIL_FOOLS_GRASS;
    }
    if (is.kind === "illusion") {
      const dx = (px - is.cx) / TILE_SIZE;
      const dy = (py - is.cy) / TILE_SIZE;
      if (dx * dx + (dy - 21) * (dy - 21) < 2.8 * 2.8) return TILE.ILLUSION_PORTAL;
      const r = Math.hypot(dx, dy);
      if (r < 18) return TILE.ILLUSION_WATER;
      return TILE.ILLUSION_LAND;
    }
    if (onTreeAt(px, py)) return TILE.TREE;
    return TILE.GRASS;
  }

  const ni = getNearestIsland(px, py);
  const d = islandDistPx(px, py, ni);
  const { halfWPx, halfHPx } = islandHalfExtentPx(ni);
  const halfPx = Math.max(halfWPx, halfHPx);
  const nearShore = d < halfPx * 2.2;
  if (ni.kind === "tropico") {
    // darker Tropico water near shore
    return nearShore ? TILE.DEEP_OCEAN : TILE.SHALLOW_OCEAN;
  }
  return nearShore ? TILE.SHALLOW_OCEAN : TILE.DEEP_OCEAN;
}

function oceanOwnershipRadiusPx(island) {
  const wT = island?.widthTiles ?? island?.sizeTiles ?? ISLAND_TILES;
  const hT = island?.heightTiles ?? island?.sizeTiles ?? ISLAND_TILES;
  const maxHalfTiles = Math.max(wT, hT) / 2;
  return maxHalfTiles * TILE_SIZE * 3.2;
}

/** Cast must land in island ocean or special pools */
function getCastFishingZone(px, py) {
  const gr = islands[0];
  if (inDarkPool(px, py, gr)) return { zone: "pool", island: gr };
  const t = getTileTypeAt(px, py);
  if (t === TILE.ILLUSION_WATER) {
    const ill = islands.find((x) => x.kind === "illusion");
    if (!ill || !inIslandLand(px, py, ill)) return null;
    if (getRodEnchant(equippedRodId) !== "immortality") return null;
    return { zone: "ocean", island: ill, illusionPurplePond: true };
  }
  if (t === TILE.LAKE) return { zone: "lake", island: islands[1] };
  if (t === TILE.SHALLOW_OCEAN || t === TILE.DEEP_OCEAN) {
    const ni = getNearestIsland(px, py);
    const d = Math.hypot(px - ni.cx, py - ni.cy);
    const OCEAN_OWNERSHIP_RADIUS = oceanOwnershipRadiusPx(ni);
    if (d > OCEAN_OWNERSHIP_RADIUS) return { zone: "ocean", island: { kind: "wild", name: "Wild ocean" } };
    return { zone: "ocean", island: ni };
  }
  return null;
}

function canFishAtCast(px, py) {
  return getCastFishingZone(px, py) != null;
}

/** Ocean: 50% minnow / 50% cod */
function rollOceanFish() {
  const r = Math.random();
  if (r < 0.10) return "pufferfish"; // 1/10
  if (r < 0.35) return "tropical"; // 1/4
  return Math.random() < 0.5 ? "minnow" : "cod";
}

function getRodLuckBonus() {
  const stats = getRodStats({ id: equippedRodId });
  return stats?.luckBonus || 0;
}

function rollOceanFishWithLuck() {
  // Luck increases special fish odds (tropical + puffer) by (1 + luck), then renormalizes.
  const luck = getRodLuckBonus();
  const basePuffer = 0.10;
  const baseTropical = 0.25;
  const boostedPuffer = basePuffer * (1 + luck);
  const boostedTropical = baseTropical * (1 + luck);
  const boostedSpecial = Math.min(0.95, boostedPuffer + boostedTropical);
  const specialScale = boostedSpecial / (boostedPuffer + boostedTropical);
  const puffer = boostedPuffer * specialScale;
  const tropical = boostedTropical * specialScale;
  const x = Math.random();
  if (x < puffer) return "pufferfish";
  if (x < puffer + tropical) return "tropical";
  return Math.random() < 0.5 ? "minnow" : "cod";
}

/** Pool weights 1 : 0.5 : 0.2 (minnow : cod : rap) */
function rollPoolFish() {
  // 1/50 chance for pool shark
  const poolSharkP = (1 / 50) * (isNight ? 1.5 : 1);
  if (Math.random() < poolSharkP) return "poolShark";
  const wM = 1;
  const wC = 0.5;
  const wR = 0.2;
  const t = wM + wC + wR;
  let r = Math.random() * t;
  if (r < wM) return "minnow";
  r -= wM;
  if (r < wC) return "cod";
  return "rapFish";
}

function rollWildOceanFish() {
  // Wild ocean (no island ownership)
  const luscaP = (1 / 100000) * (isNight ? 1.5 : 1);
  if (Math.random() < luscaP) return "lusca";
  if (Math.random() < 1 / 4) return "herring";
  if (Math.random() < 1 / 15) return "rapFish";
  return Math.random() < 0.5 ? "minnow" : "cod";
}

function rollSunstrikeOceanFish() {
  // Order from rarest to common
  if (Math.random() < 1 / 50) return "reefShark";
  if (Math.random() < 1 / 12) return "parrotFish";
  if (Math.random() < 1 / 7) return "sunTang";
  if (Math.random() < 1 / 3) return "clownfish";
  return "flyingFish";
}

/** Illusion Island purple water — 1/5 Anglerfish, 1/3 Ghost barracuda, else Ghost fish. */
function rollIllusionOceanFish() {
  if (Math.random() < 1 / 5) return "anglerfish";
  if (Math.random() < 1 / 3) return "ghostBarracuda";
  return "ghostFish";
}

/** April Fools Island ocean — 1/5 Gag fish; else 50% Fool fish / 50% 67 Shark. */
function rollAprilFoolsEventFish() {
  if (Math.random() < 1 / 5) return "gagFish";
  return Math.random() < 0.5 ? "foolFish" : "shark67";
}

function rollTropicalVariant() {
  if (Math.random() < 1 / 45) return { fishId: "tropicalPurple", color: "purple", itemId: "tropicalPurple" };
  const r = Math.random();
  if (r < 1 / 3) return { fishId: "tropical", color: "red", itemId: "tropicalRed" };
  if (r < 2 / 3) return { fishId: "tropical", color: "yellow", itemId: "tropicalYellow" };
  return { fishId: "tropical", color: "orange", itemId: "tropicalOrange" };
}

function netProgressForFish(fishId) {
  const f = getFishDef(fishId);
  return f.progressSpeedBonus + getRodStats({ id: equippedRodId }).progressSpeedModifier;
}

function ownsGarbageRod() {
  return ownedRods.has("garbageRod");
}

function isWaterTile(px, py) {
  const t = getTileTypeAt(px, py);
  return (
    t === TILE.DEEP_OCEAN ||
    t === TILE.SHALLOW_OCEAN ||
    t === TILE.DARK_POOL ||
    t === TILE.LAKE ||
    t === TILE.ILLUSION_WATER ||
    t === TILE.POND
  );
}

function isWaterTileType(type) {
  return (
    type === TILE.DEEP_OCEAN ||
    type === TILE.SHALLOW_OCEAN ||
    type === TILE.DARK_POOL ||
    type === TILE.LAKE ||
    type === TILE.ILLUSION_WATER ||
    type === TILE.POND
  );
}

function titanInfectionTileKey(tx, ty) {
  return `${tx},${ty}`;
}

function isTitanInfectedWaterAt(px, py) {
  const now = Date.now();
  const key = titanInfectionTileKey(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE));
  return titanInfectedTiles.some((e) => e.key === key && e.until > now);
}

/** 5×5 centered on the clicked water tile; only water tiles are marked. */
function addTitanInfectionAtWorld(worldX, worldY) {
  const cx = Math.floor(worldX / TILE_SIZE);
  const cy = Math.floor(worldY / TILE_SIZE);
  const until = Date.now() + TITAN_INFECTION_DURATION_MS;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = cx + dx;
      const ty = cy + dy;
      const px = (tx + 0.5) * TILE_SIZE;
      const py = (ty + 0.5) * TILE_SIZE;
      if (!isWaterTile(px, py)) continue;
      const key = titanInfectionTileKey(tx, ty);
      const ex = titanInfectedTiles.find((e) => e.key === key);
      if (ex) ex.until = Math.max(ex.until, until);
      else titanInfectedTiles.push({ key, until });
    }
  }
}

/** Weights follow 1 : 1/3 : 1/9 : 1/15 : 1/50 (scaled ×450). */
function rollTitanInfectionFish() {
  const rows = [
    { id: "redCrab", w: 450 },
    { id: "titanPrawn", w: 150 },
    { id: "giantCatShark", w: 50 },
    { id: "hyperliosisPoolShark", w: 30 },
    { id: "anglerShark", w: 9 },
  ];
  const sum = rows.reduce((a, r) => a + r.w, 0);
  let r = Math.random() * sum;
  for (const row of rows) {
    r -= row.w;
    if (r <= 0) return row.id;
  }
  return "redCrab";
}

function screenToWorldOnGameCanvas(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const vw = canvas.width / dpr;
  const vh = canvas.height / dpr;
  const mx = ((clientX - rect.left) / Math.max(1e-6, rect.width)) * vw;
  const my = ((clientY - rect.top) / Math.max(1e-6, rect.height)) * vh;
  return { x: camera.x + (mx - vw / 2), y: camera.y + (my - vh / 2) };
}

function consumeItemByUidFromInvBackpack(uid) {
  if (!uid) return false;
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i]?.uid === uid) {
      inventory[i] = null;
      return true;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i]?.uid === uid) {
      backpack[i] = null;
      return true;
    }
  }
  return false;
}

function tryUseStormRelicAtClick() {
  if (gameState !== "playing" || fishingState !== "idle" || illusionTeleportAnim) return;
  if (held.kind !== "item" || !held.uid) return;
  const it =
    inventory.find((x) => x && x.uid === held.uid) || backpack.find((x) => x && x.uid === held.uid);
  if (!it || it.id !== "stormRelic") return;
  activateStormFromRelic();
  consumeItemByUidFromInvBackpack(held.uid);
  held = { kind: "rod", uid: null };
  renderInventory();
  renderBackpackGrid();
  saveGame();
}

function tryUseTitanRelicAtClick(clientX, clientY) {
  if (gameState !== "playing" || fishingState !== "idle" || illusionTeleportAnim) return;
  if (held.kind !== "item" || !held.uid) return;
  const it =
    inventory.find((x) => x && x.uid === held.uid) || backpack.find((x) => x && x.uid === held.uid);
  if (!it || it.id !== "titanRelic") return;
  const p = screenToWorldOnGameCanvas(clientX, clientY);
  if (!isWaterTile(p.x, p.y)) return;
  addTitanInfectionAtWorld(p.x, p.y);
  consumeItemByUidFromInvBackpack(held.uid);
  held = { kind: "rod", uid: null };
  renderInventory();
  renderBackpackGrid();
  saveGame();
}

function isDrowningWater(px, py) {
  if (!isWaterTile(px, py)) return false;
  if (getRodEnchant(equippedRodId) === "immortality") return false;
  return true;
}

function currentIslandName(px, py) {
  for (const is of islands) {
    if (!inIslandLand(px, py, is)) continue;
    if (getTileTypeAt(px, py) === TILE.DARK_POOL) return `${is.name} (ambience pool)`;
    if (is.kind === "illusion" && getTileTypeAt(px, py) === TILE.ILLUSION_WATER) return `${is.name} (purple water)`;
    return is.name || "";
  }
  return "Ocean";
}

function craftNpcPos() {
  const ci = islands.find((x) => x.kind === "craft") || craftIsland;
  if (!ci) return { x: 0, y: 0 };
  return { x: ci.cx, y: ci.cy };
}

function isNearCraftNpc(px, py) {
  const p = craftNpcPos();
  return Math.hypot(px - p.x, py - p.y) < 70;
}

function memeCrafterPos() {
  const af = islands.find((x) => x.kind === "aprilFools");
  if (!af || !isAprilFoolsWeekActive()) return null;
  return islandWorldPos(af, 3, -2);
}

function isNearMemeCrafter(px, py) {
  const p = memeCrafterPos();
  if (!p) return false;
  return Math.hypot(px - p.x, py - p.y) < 70;
}

function illusionIsland() {
  return islands.find((x) => x.kind === "illusion");
}

function posIllusionSpawnAfterSunstrikeCave() {
  const ill = illusionIsland();
  if (!ill) return { x: 0, y: 0 };
  return islandWorldPos(ill, 0, -19);
}

function posSunstrikeOutsideCave() {
  const ss = islands.find((x) => x.kind === "sunstrike");
  if (!ss) return { x: 0, y: 0 };
  return { x: ss.cx, y: ss.cy + TILE_SIZE * 2.4 };
}

function isInSunstrikeCave(px, py) {
  return getTileTypeAt(px, py) === TILE.ILLUSION_PORTAL && islandAtPoint(px, py)?.kind === "sunstrike";
}

function isInIllusionReturnCave(px, py) {
  return getTileTypeAt(px, py) === TILE.ILLUSION_PORTAL && islandAtPoint(px, py)?.kind === "illusion";
}

function isNearIllusionReturnCave(px, py) {
  const ill = illusionIsland();
  if (!ill) return false;
  const p = islandWorldPos(ill, 0, 21);
  return Math.hypot(px - p.x, py - p.y) < 72;
}

/** Land ring near spawn — enchanter + table */
function illusionEnchanterPos() {
  const ill = illusionIsland();
  if (!ill) return null;
  return islandWorldPos(ill, 5, -19);
}

function isNearIllusionEnchanter(px, py) {
  const p = illusionEnchanterPos();
  if (!p) return false;
  return Math.hypot(px - p.x, py - p.y) < 78;
}

function ghostCrafterPos() {
  const ill = illusionIsland();
  if (!ill) return null;
  return islandWorldPos(ill, -6, -19);
}

function isNearGhostCrafter(px, py) {
  const p = ghostCrafterPos();
  if (!p) return false;
  return Math.hypot(px - p.x, py - p.y) < 78;
}

function relicSellerPos() {
  const ill = illusionIsland();
  if (!ill) return null;
  return islandWorldPos(ill, 13, -19);
}

function isNearRelicSeller(px, py) {
  const p = relicSellerPos();
  if (!p) return false;
  return Math.hypot(px - p.x, py - p.y) < 78;
}

let illusionTeleportAnim = null;

function teleportToIllusionFromSunstrike() {
  const p = posIllusionSpawnAfterSunstrikeCave();
  player.x = p.x;
  player.y = p.y;
  player.facing.x = 0;
  player.facing.y = 1;
  saveGame();
}

function teleportToSunstrikeFromIllusion() {
  const p = posSunstrikeOutsideCave();
  player.x = p.x;
  player.y = p.y;
  player.facing.x = 0;
  player.facing.y = -1;
  saveGame();
}

function tickIllusionTeleportBlur() {
  const el = document.getElementById("game");
  if (!illusionTeleportAnim || !el) return;
  const a = illusionTeleportAnim;
  const t = performance.now() - a.start;
  if (a.phase === "in") {
    const blur = Math.min(14, t * 0.065);
    el.style.filter = `blur(${blur}px)`;
    if (t >= 240) {
      if (a.dest === "illusion") teleportToIllusionFromSunstrike();
      else teleportToSunstrikeFromIllusion();
      a.phase = "out";
      a.start = performance.now();
    }
  } else if (a.phase === "out") {
    const t2 = performance.now() - a.start;
    const blur = Math.max(0, 14 - t2 * 0.07);
    el.style.filter = blur > 0.3 ? `blur(${blur}px)` : "none";
    if (t2 >= 220) {
      el.style.filter = "none";
      illusionTeleportAnim = null;
    }
  }
}

function beginIllusionEnterFromSunstrike() {
  if (money < 50) {
    illusionEntryFeeMsgUntil = performance.now() + 3200;
    return;
  }
  money -= 50;
  updateMoneyHud();
  saveGame();
  const el = document.getElementById("game");
  if (el) el.style.filter = "none";
  illusionTeleportAnim = { phase: "in", start: performance.now(), dest: "illusion" };
}

function beginIllusionExitToSunstrike() {
  const el = document.getElementById("game");
  if (el) el.style.filter = "none";
  illusionTeleportAnim = { phase: "in", start: performance.now(), dest: "sunstrike" };
}

function getEquippedItem() {
  return inventory[selectedSlot];
}

function countBackpackItems() {
  return backpack.filter((x) => x != null).length;
}

function countFavoritesItems() {
  return favorites.filter((x) => x != null).length;
}

function hasAnyInventorySpace() {
  for (let i = 0; i < SLOT_COUNT; i++) if (!inventory[i]) return true;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (!backpack[i]) return true;
  return false;
}

function firstEmptyIndex(arr) {
  for (let i = 0; i < arr.length; i++) if (!arr[i]) return i;
  return -1;
}

function moveInventoryFishToFavorites(invIndex) {
  const it = inventory[invIndex];
  if (!it || !FISH_ITEM_IDS.has(it.id)) return;
  const fi = firstEmptyIndex(favorites);
  if (fi < 0) return;
  favorites[fi] = it;
  inventory[invIndex] = null;
  if (held.kind === "item" && held.uid === it.uid) held = { kind: "item", uid: it.uid };
  saveGame();
}

function moveBackpackFishToFavorites(bpIndex) {
  const it = backpack[bpIndex];
  if (!it || !FISH_ITEM_IDS.has(it.id)) return;
  const fi = firstEmptyIndex(favorites);
  if (fi < 0) return;
  favorites[fi] = it;
  backpack[bpIndex] = null;
  if (held.kind === "item" && held.uid === it.uid) held = { kind: "item", uid: it.uid };
  saveGame();
}

function moveFavoriteFishToBackpack(favIndex) {
  const it = favorites[favIndex];
  if (!it || !FISH_ITEM_IDS.has(it.id)) return;
  const bi = firstEmptyIndex(backpack);
  if (bi < 0) return;
  backpack[bi] = it;
  favorites[favIndex] = null;
  if (held.kind === "item" && held.uid === it.uid) held = { kind: "item", uid: it.uid };
  saveGame();
}

function countGunBulletsTotal() {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i]?.id === "gunBullets") n += Math.max(0, inventory[i].qty | 0);
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i]?.id === "gunBullets") n += Math.max(0, backpack[i].qty | 0);
  }
  return n;
}

function hasGunBulletsStackSlot() {
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === "gunBullets") return true;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === "gunBullets") return true;
  return false;
}

function canAddGunBulletsMerge() {
  return hasGunBulletsStackSlot() || hasAnyInventorySpace();
}

function consumeOneGunBullet() {
  for (let i = 0; i < SLOT_COUNT; i++) {
    const it = inventory[i];
    if (it?.id === "gunBullets" && (it.qty | 0) > 0) {
      it.qty = (it.qty | 0) - 1;
      if (it.qty <= 0) {
        if (held.kind === "item" && held.uid === it.uid) held = { kind: "rod", uid: null };
        inventory[i] = null;
      }
      return true;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    const it = backpack[i];
    if (it?.id === "gunBullets" && (it.qty | 0) > 0) {
      it.qty = (it.qty | 0) - 1;
      if (it.qty <= 0) {
        if (held.kind === "item" && held.uid === it.uid) held = { kind: "rod", uid: null };
        backpack[i] = null;
      }
      return true;
    }
  }
  return false;
}

/** Adds bullets to an existing stack or first empty slot. */
function addOrMergeGunBullets(amount) {
  const q0 = Math.max(1, amount | 0);
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i]?.id === "gunBullets") {
      inventory[i].qty = Math.min(999999, Math.max(0, inventory[i].qty | 0) + q0);
      return true;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i]?.id === "gunBullets") {
      backpack[i].qty = Math.min(999999, Math.max(0, backpack[i].qty | 0) + q0);
      return true;
    }
  }
  const stack = { ...ITEMS.gunBullets, uid: newUid(), qty: q0 };
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!inventory[i]) {
      inventory[i] = stack;
      return true;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (!backpack[i]) {
      backpack[i] = stack;
      return true;
    }
  }
  return false;
}

function addItem(item) {
  if (!item || !item.id) return false;
  if (ROD_IDS.has(item.id)) return false;
  const copy = { ...item };
  if (UID_MISC_ITEM_IDS.has(copy.id) && !copy.uid) copy.uid = newUid();
  if (copy.id === "gunBullets") {
    const q = Math.max(1, Math.floor(Number(copy.qty)) || 1);
    return addOrMergeGunBullets(q);
  }
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!inventory[i]) {
      inventory[i] = copy;
      return true;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (!backpack[i]) {
      backpack[i] = copy;
      return true;
    }
  }
  return false;
}

function holdRod() {
  held = { kind: "rod", uid: null };
  saveGame();
}

function holdItemUid(uid) {
  if (!uid) return;
  const exists =
    inventory.some((x) => x && x.uid === uid) || backpack.some((x) => x && x.uid === uid) || favorites.some((x) => x && x.uid === uid);
  if (!exists) return;
  held = { kind: "item", uid };
  saveGame();
}

function countFishById(fid) {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === fid) n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === fid) n++;
  return n;
}

function countGoldFishById(fid) {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === fid && inventory[i]?.gold) n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === fid && backpack[i]?.gold) n++;
  return n;
}

function projectedSellTotal() {
  let total = 0;
  for (const it of inventory) if (it && FISH_ITEM_IDS.has(it.id) && it.id !== "metalSheet") total += fishTotalSellValue(it);
  for (const it of backpack) if (it && FISH_ITEM_IDS.has(it.id) && it.id !== "metalSheet") total += fishTotalSellValue(it);
  return total;
}

function removeAllFishForSell() {
  const ids = [
    "minnow",
    "cod",
    "rapFish",
    "pufferfish",
    "tropicalRed",
    "tropicalYellow",
    "tropicalOrange",
    "tropicalPurple",
    "forestFish",
    "forestTurtle",
    "blueTang",
    "barracuda",
    "poolShark",
    "electricalEel",
    "lusca",
    "flyingFish",
    "clownfish",
    "sunTang",
    "parrotFish",
    "reefShark",
    "foolFish",
    "gagFish",
    "shark67",
    "ghostFish",
    "ghostBarracuda",
    "anglerfish",
    "redCrab",
    "titanPrawn",
    "giantCatShark",
    "hyperliosisPoolShark",
    "anglerShark",
    "herring",
    "garbageFish",
    "plasticBottle",
  ];
  const counts = {
    minnow: 0,
    cod: 0,
    rapFish: 0,
    pufferfish: 0,
    tropicalRed: 0,
    tropicalYellow: 0,
    tropicalOrange: 0,
    tropicalPurple: 0,
    forestFish: 0,
    forestTurtle: 0,
    blueTang: 0,
    barracuda: 0,
    poolShark: 0,
    electricalEel: 0,
    lusca: 0,
    flyingFish: 0,
    clownfish: 0,
    sunTang: 0,
    parrotFish: 0,
    reefShark: 0,
    foolFish: 0,
    gagFish: 0,
    shark67: 0,
    ghostFish: 0,
    ghostBarracuda: 0,
    anglerfish: 0,
    redCrab: 0,
    titanPrawn: 0,
    giantCatShark: 0,
    hyperliosisPoolShark: 0,
    anglerShark: 0,
    herring: 0,
    garbageFish: 0,
    plasticBottle: 0,
  };
  const removed = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const it = inventory[i];
    if (it && ids.includes(it.id)) {
      counts[it.id]++;
      removed.push(it);
      inventory[i] = null;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    const it = backpack[i];
    if (it && ids.includes(it.id)) {
      counts[it.id]++;
      removed.push(it);
      backpack[i] = null;
    }
  }
  let total = 0;
  for (const it of removed) total += fishTotalSellValue(it);
  return { counts, total };
}

function updateSellBreakdown() {
  sellBreakdownEl.innerHTML = `You will earn <strong>$${projectedSellTotal()}</strong>`;
}

function markCaught(id) {
  if (id === "minnow") caughtFish.minnow = true;
  if (id === "cod") caughtFish.cod = true;
  if (id === "rapFish") caughtFish.rapFish = true;
  if (id === "tropical") caughtFish.tropical = true;
  if (id === "tropicalPurple") caughtFish.tropical = true;
  if (id === "pufferfish") caughtFish.pufferfish = true;
  if (id === "forestFish") caughtFish.forestFish = true;
  if (id === "poolShark") caughtFish.poolShark = true;
  if (id === "electricalEel") caughtFish.electricalEel = true;
  if (id === "forestTurtle") caughtFish.forestTurtle = true;
  if (id === "blueTang") caughtFish.blueTang = true;
  if (id === "barracuda") caughtFish.barracuda = true;
  if (id === "lusca") caughtFish.lusca = true;
  if (id === "flyingFish") caughtFish.flyingFish = true;
  if (id === "herring") caughtFish.herring = true;
  if (id === "metalSheet") caughtFish.metalSheet = true;
  if (id === "garbageFish") caughtFish.garbageFish = true;
  if (id === "plasticBottle") caughtFish.plasticBottle = true;
  if (id === "clownfish") caughtFish.clownfish = true;
  if (id === "sunTang") caughtFish.sunTang = true;
  if (id === "parrotFish") caughtFish.parrotFish = true;
  if (id === "reefShark") caughtFish.reefShark = true;
  if (id === "foolFish") caughtFish.foolFish = true;
  if (id === "gagFish") caughtFish.gagFish = true;
  if (id === "shark67") caughtFish.shark67 = true;
  if (id === "ghostFish") caughtFish.ghostFish = true;
  if (id === "ghostBarracuda") caughtFish.ghostBarracuda = true;
  if (id === "anglerfish") caughtFish.anglerfish = true;
  if (id === "redCrab") caughtFish.redCrab = true;
  if (id === "titanPrawn") caughtFish.titanPrawn = true;
  if (id === "giantCatShark") caughtFish.giantCatShark = true;
  if (id === "hyperliosisPoolShark") caughtFish.hyperliosisPoolShark = true;
  if (id === "anglerShark") caughtFish.anglerShark = true;
}

function renderBestiary() {
  bestiaryContentEl.innerHTML = "";

  bestiaryTab = bestiaryTab || "greatReef";

  const shell = document.createElement("div");
  shell.className = "bestiary-shell";

  const side = document.createElement("div");
  side.className = "bestiary-side";

  const main = document.createElement("div");
  main.className = "bestiary-main";

  const tabs = [
    { key: "eventFish", label: "Event fish" },
    { key: "greatReef", label: "Great Reef" },
    { key: "tropico", label: "Tropico" },
    { key: "ambiencePool", label: "Ambience pool" },
    { key: "sunstrike", label: "Sunstrike" },
    { key: "illusion", label: "Illusion" },
    { key: "wildOcean", label: "Wild ocean" },
    { key: "titanInfection", label: "Titan infection" },
    { key: "garbage", label: "Garbage" },
  ];

  for (const t of tabs) {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "bestiary-tab" +
      (t.key === "eventFish" ? " bestiary-tab-event" : "") +
      (bestiaryTab === t.key ? " active" : "");
    b.textContent = t.label;
    b.addEventListener("click", () => {
      bestiaryTab = t.key;
      renderBestiary();
    });
    side.appendChild(b);
  }

  const title = document.createElement("h4");
  title.textContent = tabs.find((x) => x.key === bestiaryTab)?.label || "Bestiary";
  main.appendChild(title);

  const rarityRank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, forgotten: 5 };
  function appendSorted(entries) {
    const sorted = entries
      .map((e) => ({
        ...e,
        rarityRank: rarityRank[e.rarity] ?? 99,
        price: fishBaseSellPrice(e.fid),
      }))
      .sort((a, b) => a.rarityRank - b.rarityRank || a.price - b.price || a.label.localeCompare(b.label));
    for (const e of sorted) main.appendChild(makeBestiaryRow(e.fid, e.label, e.rarity));
  }

  if (bestiaryTab === "eventFish") {
    const intro = document.createElement("p");
    intro.className = "bestiary-event-intro";
    intro.textContent =
      "Limited-time islands and events. April Fools Island is live during the event week — Fool fish, Gag fish, and 67 Shark. Visit the Meme Crafter on the island to craft the 67 rod.";
    main.appendChild(intro);
    appendSorted([
      { fid: "foolFish", label: "Fool fish", rarity: "uncommon" },
      { fid: "gagFish", label: "Gag fish", rarity: "uncommon" },
      { fid: "shark67", label: "67 Shark", rarity: "rare" },
    ]);
  } else if (bestiaryTab === "greatReef") {
    appendSorted([
      { fid: "minnow", label: "Minnow", rarity: "common" },
      { fid: "cod", label: "Cod", rarity: "common" },
      { fid: "tropical", label: "Tropical fish", rarity: "uncommon" },
      { fid: "pufferfish", label: "Pufferfish", rarity: "uncommon" },
    ]);
  } else if (bestiaryTab === "tropico") {
    appendSorted([
      { fid: "forestFish", label: "Forest fish", rarity: "common" },
      { fid: "electricalEel", label: "Electrical eel", rarity: "uncommon" },
      { fid: "blueTang", label: "Blue tang", rarity: "uncommon" },
      { fid: "forestTurtle", label: "Forest turtle", rarity: "rare" },
      { fid: "barracuda", label: "Barracuda", rarity: "epic" },
    ]);
  } else if (bestiaryTab === "ambiencePool") {
    appendSorted([
      { fid: "rapFish", label: "Rap fish", rarity: "uncommon" },
      { fid: "poolShark", label: "Pool shark", rarity: "epic" },
    ]);
  } else if (bestiaryTab === "wildOcean") {
    appendSorted([
      { fid: "minnow", label: "Minnow", rarity: "common" },
      { fid: "cod", label: "Cod", rarity: "common" },
      { fid: "herring", label: "Herring", rarity: "common" },
      { fid: "rapFish", label: "Rap fish", rarity: "uncommon" },
      { fid: "lusca", label: "Lusca", rarity: "forgotten" },
    ]);
  } else if (bestiaryTab === "titanInfection") {
    const intro = document.createElement("p");
    intro.className = "bestiary-event-intro";
    intro.textContent =
      "Storm relic: hold it and left-click the game canvas to start a storm (consumes the relic). Titan relic: hold it and left-click water on the canvas — red 5×5 patches use a special loot table when you cast into them.";
    main.appendChild(intro);
    appendSorted([
      { fid: "redCrab", label: "Red crab", rarity: "rare" },
      { fid: "titanPrawn", label: "Titan prawn", rarity: "rare" },
      { fid: "giantCatShark", label: "Giant cat shark", rarity: "rare" },
      { fid: "hyperliosisPoolShark", label: "Hyperliosis pool shark", rarity: "epic" },
      { fid: "anglerShark", label: "Angler shark", rarity: "legendary" },
    ]);
  } else if (bestiaryTab === "sunstrike") {
    appendSorted([
      { fid: "flyingFish", label: "Flying fish", rarity: "common" },
      { fid: "clownfish", label: "Clownfish", rarity: "common" },
      { fid: "sunTang", label: "Sun tang", rarity: "uncommon" },
      { fid: "parrotFish", label: "ParrotFish", rarity: "rare" },
      { fid: "reefShark", label: "Reef shark", rarity: "epic" },
    ]);
  } else if (bestiaryTab === "illusion") {
    const intro = document.createElement("p");
    intro.className = "bestiary-event-intro";
    intro.textContent =
      "Illusion Island — fish the purple water. Ghost fish, ghost barracuda, and anglerfish use a special loot table.";
    main.appendChild(intro);
    appendSorted([
      { fid: "ghostFish", label: "Ghost fish", rarity: "uncommon" },
      { fid: "ghostBarracuda", label: "Ghost barracuda", rarity: "uncommon" },
      { fid: "anglerfish", label: "Anglerfish", rarity: "rare" },
    ]);
  } else if (bestiaryTab === "garbage") {
    appendSorted([
      { fid: "garbageFish", label: "Garbage fish", rarity: "common" },
      { fid: "plasticBottle", label: "Plastic bottle", rarity: "common" },
      { fid: "metalSheet", label: "Metal sheet", rarity: "common" },
    ]);
  }

  shell.appendChild(side);
  shell.appendChild(main);
  bestiaryContentEl.appendChild(shell);
}

function makeBestiaryRow(fid, label, rarityLabel) {
  const row = document.createElement("div");
  const unlocked = !!caughtFish[fid];
  row.className = "bestiary-fish" + (unlocked ? "" : " locked");
  const cv = document.createElement("canvas");
  cv.width = 48;
  cv.height = 48;
  const c = cv.getContext("2d");
  if (unlocked) {
    if (fid === "minnow") drawMinnowModel(c, 24, 24, 1.1, false);
    else if (fid === "cod") drawCodModel(c, 24, 24, 1.1, false);
    else if (fid === "rapFish") drawRapModel(c, 24, 24, 1.1, false);
    else if (fid === "pufferfish") drawPufferModel(c, 24, 24, 1.1, false);
    else if (fid === "tropical") drawTropicalModel(c, 24, 24, 1.1, false, "orange");
    else if (fid === "forestFish") drawForestFishModel(c, 24, 24, 1.1, false);
    else if (fid === "poolShark") drawPoolSharkModel(c, 24, 24, 1.1, false);
    else if (fid === "electricalEel") drawElectricalEelModel(c, 24, 24, 1.1, false);
    else if (fid === "forestTurtle") drawForestTurtleModel(c, 24, 24, 1.1, false);
    else if (fid === "blueTang") drawBlueTangModel(c, 24, 24, 1.1, false);
    else if (fid === "barracuda") drawBarracudaModel(c, 24, 24, 1.1, false);
    else if (fid === "lusca") drawLuscaModel(c, 24, 24, 1.1, false);
    else if (fid === "flyingFish") drawFlyingFishModel(c, 24, 24, 1.1, false);
    else if (fid === "clownfish") drawClownfishModel(c, 24, 24, 1.1, false);
    else if (fid === "sunTang") drawSunTangModel(c, 24, 24, 1.1, false);
    else if (fid === "parrotFish") drawParrotFishModel(c, 24, 24, 1.1, false);
    else if (fid === "reefShark") drawReefSharkModel(c, 24, 24, 1.1, false);
    else if (fid === "foolFish") drawFoolFishModel(c, 24, 24, 1.1, false);
    else if (fid === "gagFish") drawGagFishModel(c, 24, 24, 1.1, false);
    else if (fid === "shark67") drawShark67Model(c, 24, 24, 1.1, false);
    else if (fid === "ghostFish") drawGhostFishModel(c, 24, 24, 1.1, false);
    else if (fid === "ghostBarracuda") {
      c.save();
      c.globalAlpha = 0.55;
      drawBarracudaModel(c, 24, 24, 1.1, false);
      c.restore();
    } else if (fid === "anglerfish") drawAnglerfishModel(c, 24, 24, 1.1, false);
    else if (fid === "redCrab") drawRedCrabModel(c, 24, 24, 1.1, false);
    else if (fid === "titanPrawn") drawTitanPrawnModel(c, 24, 24, 1.1, false);
    else if (fid === "giantCatShark") drawGiantCatSharkModel(c, 24, 24, 1.1, false);
    else if (fid === "hyperliosisPoolShark") drawHyperliosisPoolSharkModel(c, 24, 24, 1.1, false);
    else if (fid === "anglerShark") drawAnglerSharkModel(c, 24, 24, 1.1, false);
    else if (fid === "herring") drawHerringModel(c, 24, 24, 1.1, false);
    else if (fid === "metalSheet") drawMetalSheetModel(c, 24, 24, 1.1, false);
    else if (fid === "garbageFish") drawGarbageFishModel(c, 24, 24, 1.1, false);
    else if (fid === "plasticBottle") drawPlasticBottleModel(c, 24, 24, 1.1, false);
  } else {
    c.fillStyle = "rgba(40,50,60,0.6)";
    c.fillRect(0, 0, 48, 48);
    c.fillStyle = "rgba(255,255,255,0.25)";
    c.font = "10px sans-serif";
    c.textAlign = "center";
    c.fillText("?", 24, 26);
  }
  const meta = document.createElement("div");
  meta.className = "fish-meta";
  const rarityEn =
    rarityLabel === "common"
      ? "Common"
      : rarityLabel === "uncommon"
        ? "Uncommon"
        : rarityLabel === "rare"
          ? "Rare"
          : rarityLabel === "epic"
            ? "Epic"
            : rarityLabel === "legendary"
            ? "Legendary"
            : rarityLabel === "forgotten"
              ? "Forgotten"
              : "Epic";
  const info = fishInfoLine(fid);
  meta.innerHTML = `<strong>${label}</strong><div class="rarity">${rarityEn}${info ? " · " + info : ""}</div>`;
  row.appendChild(cv);
  row.appendChild(meta);
  return row;
}

function fishInfoLine(fid) {
  // Show base price and weight range in the bestiary.
  if (fid === "minnow") return "Base $5 · 10–40g";
  if (fid === "cod") return "Base $7 · 20–50g";
  if (fid === "rapFish") return "Base $10 · 70–90g";
  if (fid === "tropical") return "Base $9 (purple $100) · 30–40g";
  if (fid === "pufferfish") return "Base $15 · 70–140g";
  if (fid === "forestFish") return "Base $9 · 30–40g";
  if (fid === "poolShark") return "Base $75 · 120–200g";
  if (fid === "electricalEel") return "Base $13 · 60–120g";
  if (fid === "forestTurtle") return "Base $25 · 120–160g";
  if (fid === "blueTang") return "Base $15 · 40–80g";
  if (fid === "barracuda") return "Base $75 · 70–110g";
  if (fid === "lusca") return "Base $45000 · 1200–3000g";
  if (fid === "flyingFish") return "Base $12 · 10–20g";
  if (fid === "clownfish") return "Base $9 · 20–40g";
  if (fid === "sunTang") return "Base $17 · 70–90g";
  if (fid === "parrotFish") return "Base $24 · 30–80g";
  if (fid === "reefShark") return "Base $90 · 70–140g";
  if (fid === "foolFish") return "Base $40 · 30–100g · April Fools Island";
  if (fid === "gagFish") return "Base $50 · 50–100g · April Fools Island";
  if (fid === "shark67") return "Base $80 · 80–170g · April Fools Island";
  if (fid === "ghostFish") return "Base $20 · 4g · Illusion Island";
  if (fid === "ghostBarracuda") return "Base $30 · 70–110g · Illusion Island";
  if (fid === "anglerfish") return "Base $42 · 30–40g · Illusion Island";
  if (fid === "redCrab") return "Base $30 · 90–240g · Titan infection";
  if (fid === "titanPrawn") return "Base $40 · 120–240g · Titan infection";
  if (fid === "giantCatShark") return "Base $55 · 200–400g · Titan infection";
  if (fid === "hyperliosisPoolShark") return "Base $70 · 400–500g · Titan infection";
  if (fid === "anglerShark") return "Base $150 · 500–900g · Titan infection · decoy lure";
  if (fid === "herring") return "Base $9 · 10–40g";
  if (fid === "metalSheet") return "Cannot sell · 50–1000g";
  if (fid === "garbageFish") return "Base $2 · 10–40g";
  if (fid === "plasticBottle") return "Base $1 · 8–35g · Garbage Island";
  return "";
}

function updateAfTokensHud() {
  if (afTokensEl) afTokensEl.textContent = String(aprilFoolsTokens);
  if (afTokensRowEl) afTokensRowEl.classList.toggle("hidden", !isAprilFoolsWeekActive());
}

function updateMoneyHud() {
  moneyEl.textContent = String(money);
  updateAfTokensHud();
}

function getCastPoint() {
  let fx = player.facing.x;
  let fy = player.facing.y;
  const len = Math.hypot(fx, fy);
  if (len < 0.01) {
    fx = 0;
    fy = 1;
  } else {
    fx /= len;
    fy /= len;
  }
  return {
    x: player.x + fx * CAST_TILES * TILE_SIZE,
    y: player.y + fy * CAST_TILES * TILE_SIZE,
  };
}

function islandAtPoint(px, py) {
  for (const is of islands) if (inIslandLand(px, py, is)) return is;
  return null;
}

function standPosSell(island) {
  const b = island?.standBlocks?.sell ?? SELL_STAND_BLOCK;
  return blockCenterWorld(island, b);
}

function standPosShop(island) {
  const b = island?.standBlocks?.shop ?? SHOP_STAND_BLOCK;
  return blockCenterWorld(island, b);
}

function standPosHarbor(island) {
  const b = island?.standBlocks?.harbor ?? HARBOR_BLOCK;
  return blockCenterWorld(island, b);
}

function standPosDestroy(island) {
  return blockCenterWorld(island, DESTROY_BLOCK);
}

/** Must overlap between adjacent stalls (sell/shop are ~6 tiles apart ≈ 192px center-to-center). */
const STAND_INTERACT_RADIUS_PX = 100;

function nearStand(px, py, stand) {
  return Math.hypot(px - stand.x, py - stand.y) < STAND_INTERACT_RADIUS_PX;
}

function drawRodModel(c, cx, cy, scale, angleRad, variant) {
  const adv = variant === "advanced";
  const metal = variant === "metal";
  const testing = variant === "testing";
  const forest = variant === "forest";
  const speed = variant === "speed";
  const shark = variant === "shark";
  const garbage = variant === "garbage";
  const liar = variant === "liar";
  const rod67 = variant === "rod67";
  const gun = variant === "gun";
  c.save();
  c.translate(cx, cy);
  c.rotate(angleRad);
  const s = scale;
  if (gun) {
    c.fillStyle = "#2d3238";
    c.strokeStyle = "#0d0f12";
    c.lineWidth = Math.max(1, 1.1 * s);
    c.beginPath();
    c.roundRect(-12 * s, -6 * s, 14 * s, 22 * s, 3 * s);
    c.fill();
    c.stroke();
    c.fillStyle = "#1a1d22";
    c.fillRect(2 * s, -4 * s, 22 * s, 10 * s);
    c.strokeRect(2 * s, -4 * s, 22 * s, 10 * s);
    c.fillStyle = "#4a4a52";
    c.fillRect(22 * s, -2 * s, 20 * s, 6 * s);
    c.strokeStyle = "#222";
    c.strokeRect(22 * s, -2 * s, 20 * s, 6 * s);
    c.fillStyle = "#c62828";
    c.beginPath();
    c.arc(8 * s, 1 * s, 3.2 * s, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffd54f";
    c.fillRect(40 * s, -0.5 * s, 5 * s, 3 * s);
    c.fillStyle = "#5d4037";
    c.beginPath();
    c.moveTo(-12 * s, 8 * s);
    c.lineTo(-18 * s, 16 * s);
    c.lineTo(-8 * s, 14 * s);
    c.closePath();
    c.fill();
    c.stroke();
  } else if (garbage) {
    c.strokeStyle = "#6d4c41";
    c.lineWidth = Math.max(1, 3.2 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    // taped-on metal scrap
    c.save();
    c.translate(6 * s, -6 * s);
    c.rotate(0.6);
    c.fillStyle = "rgba(160,160,160,0.95)";
    c.strokeStyle = "rgba(0,0,0,0.35)";
    c.lineWidth = 1;
    c.beginPath();
    c.roundRect(-6 * s, -4 * s, 12 * s, 8 * s, 2 * s);
    c.fill();
    c.stroke();
    c.fillStyle = "rgba(255,235,59,0.55)";
    c.fillRect(-5 * s, -1.5 * s, 10 * s, 3 * s);
    c.restore();
  } else if (shark) {
    c.strokeStyle = "#0d47a1";
    c.lineWidth = Math.max(1, 3.8 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    // teeth pattern
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(-2 * s + i * 4.5 * s, 2.5 * s - i * 3.4 * s);
      c.lineTo(1 * s + i * 4.5 * s, 0.5 * s - i * 3.4 * s);
      c.stroke();
    }
    c.strokeStyle = "#0d47a1";
    c.lineWidth = Math.max(1, 3.8 * s);
  } else if (liar) {
    c.strokeStyle = "#ad1457";
    c.lineWidth = Math.max(1, 3.5 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    c.strokeStyle = "rgba(255, 235, 59, 0.85)";
    c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(-6 * s + i * 5.5 * s, 6 * s - i * 3.6 * s);
      c.lineTo(4 * s + i * 5.5 * s, -10 * s - i * 3.6 * s);
      c.stroke();
    }
    c.strokeStyle = "#ad1457";
    c.lineWidth = Math.max(1, 3.5 * s);
  } else if (rod67) {
    c.strokeStyle = "#00e676";
    c.lineWidth = Math.max(1, 3.6 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    c.strokeStyle = "rgba(103, 255, 181, 0.65)";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(-8 * s + i * 4.8 * s, 5 * s - i * 3.5 * s);
      c.lineTo(4 * s + i * 4.8 * s, -9 * s - i * 3.5 * s);
      c.stroke();
    }
    c.strokeStyle = "#00e676";
    c.lineWidth = Math.max(1, 3.6 * s);
  } else if (speed) {
    c.strokeStyle = "#ff1744";
    c.lineWidth = Math.max(1, 3.6 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    // speed streaks
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(-10 * s, 6 * s - i * 3.2 * s);
      c.lineTo(8 * s, -8 * s - i * 3.2 * s);
      c.stroke();
    }
    c.strokeStyle = "#ff1744";
    c.lineWidth = Math.max(1, 3.6 * s);
  } else if (forest) {
    c.strokeStyle = "#1b5e20";
    c.lineWidth = Math.max(1, 3.4 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    // vine wrap
    c.strokeStyle = "rgba(170, 255, 120, 0.45)";
    c.lineWidth = 1.2 * s;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.arc(-2 * s + i * 5.5 * s, 2 * s - i * 4.2 * s, 2.2 * s, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = "#1b5e20";
    c.lineWidth = Math.max(1, 3.4 * s);
  } else if (testing) {
    c.strokeStyle = "#00e5ff";
    c.lineWidth = Math.max(1, 3.8 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    for (let i = 0; i < 4; i++) {
      c.strokeStyle = `rgba(255,255,255,${0.25 - i * 0.04})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-7 * s + i * 5 * s, 5 * s - i * 3.2 * s);
      c.lineTo(6 * s + i * 5 * s, -10 * s - i * 3.2 * s);
      c.stroke();
    }
    c.strokeStyle = "#00e5ff";
    c.lineWidth = Math.max(1, 3.8 * s);
  } else if (metal) {
    c.strokeStyle = "#9e9e9e";
    c.lineWidth = Math.max(1, 3.4 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.35)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-6 * s, 3 * s);
    c.lineTo(20 * s, -17 * s);
    c.stroke();
  } else if (adv) {
    c.strokeStyle = "#2a2a2e";
    c.lineWidth = Math.max(1, 3.2 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = `rgba(255,255,255,${0.06 + i * 0.02})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-6 * s + i * 5 * s, 5 * s - i * 4 * s);
      c.lineTo(4 * s + i * 5 * s, -8 * s - i * 4 * s);
      c.stroke();
    }
    c.strokeStyle = "#2a2a2e";
    c.lineWidth = Math.max(1, 3.2 * s);
  } else {
    c.strokeStyle = "#5d4037";
    c.lineWidth = Math.max(1, 3 * s);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * s, 4 * s);
    c.lineTo(22 * s, -18 * s);
    c.stroke();
  }
  c.fillStyle = rod67 ? "#00c853" : liar ? "#c2185b" : testing ? "#7c4dff" : metal ? "#607d8b" : adv ? "#b8860b" : "#37474f";
  c.beginPath();
  c.arc(-4 * s, 6 * s, 5 * s, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = rod67 ? "#76ff03" : liar ? "#ffeb3b" : testing ? "#b388ff" : metal ? "#cfd8dc" : adv ? "#ffe082" : "#90a4ae";
  c.beginPath();
  c.arc(-4 * s, 6 * s, 2.5 * s, 0, Math.PI * 2);
  c.fill();
  if (rod67) {
    c.fillStyle = "rgba(0,0,0,0.78)";
    c.font = `bold ${Math.max(5, 6 * s)}px sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("67", -4 * s, 6.2 * s);
  }
  c.strokeStyle = "rgba(255,255,255,0.35)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(20 * s, -17 * s);
  c.lineTo(26 * s, -22 * s);
  c.stroke();
  c.restore();
}

function drawMinnowModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.beginPath();
  c.moveTo(-14, 2);
  c.quadraticCurveTo(-6, -8, 8, -4);
  c.lineTo(18, 0);
  c.lineTo(8, 4);
  c.quadraticCurveTo(-6, 8, -14, 2);
  c.closePath();
  const g = c.createLinearGradient(-12, 0, 14, 0);
  g.addColorStop(0, "#5d8a9e");
  g.addColorStop(0.45, "#a8d4e6");
  g.addColorStop(1, "#4a7a8c");
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "rgba(0,40,60,0.35)";
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = "#1a1a1a";
  c.beginPath();
  c.arc(10, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(-14, 2);
  c.lineTo(-22, 6);
  c.lineTo(-18, -2);
  c.closePath();
  c.fillStyle = "#6a9eaa";
  c.fill();
  c.restore();
}

function drawCodModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.beginPath();
  c.moveTo(-18, 0);
  c.quadraticCurveTo(-8, -12, 10, -6);
  c.lineTo(22, 0);
  c.lineTo(10, 6);
  c.quadraticCurveTo(-8, 12, -18, 0);
  c.closePath();
  const g = c.createLinearGradient(-16, 0, 18, 0);
  g.addColorStop(0, "#8d6e4a");
  g.addColorStop(0.45, "#d4b896");
  g.addColorStop(0.75, "#c4a574");
  g.addColorStop(1, "#a0826d");
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "rgba(80,50,30,0.45)";
  c.stroke();
  c.fillStyle = "#2e1f14";
  c.beginPath();
  c.arc(12, -2, 2.5, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(-18, 0);
  c.lineTo(-28, 4);
  c.lineTo(-24, -6);
  c.closePath();
  c.fillStyle = "#b8956a";
  c.fill();
  c.restore();
}

function drawRapModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.beginPath();
  c.moveTo(-16, 4);
  c.lineTo(4, -10);
  c.lineTo(20, 2);
  c.lineTo(6, 10);
  c.lineTo(-8, 6);
  c.closePath();
  const g = c.createLinearGradient(-12, -4, 16, 6);
  g.addColorStop(0, "#6a1b9a");
  g.addColorStop(0.5, "#ec407a");
  g.addColorStop(1, "#4a148c");
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  c.stroke();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(8, -2, 2.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(9, -2, 1.2, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawForestFishModel(c, cx, cy, scale, flip) {
  // Tropical-like silhouette with leafy stripes
  drawTropicalModel(c, cx, cy, scale, flip, "yellow");
  c.save();
  c.translate(cx, cy);
  c.scale(scale * (flip ? -1 : 1), scale);
  c.strokeStyle = "rgba(20, 80, 40, 0.55)";
  c.lineWidth = 1.2;
  for (let i = -10; i <= 14; i += 6) {
    c.beginPath();
    c.moveTo(i, -8);
    c.lineTo(i - 4, 10);
    c.stroke();
  }
  c.restore();
}

function drawPoolSharkModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Pool shark: chunky, aggressive, readable at small sizes.
  c.fillStyle = "#6e7e90";
  c.beginPath();
  c.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
  c.fill();

  // Belly
  c.fillStyle = "#d7dee6";
  c.beginPath();
  c.ellipse(2, 3, 16, 7, 0, 0, Math.PI * 2);
  c.fill();

  // Tail
  c.fillStyle = "#4c5967";
  c.beginPath();
  c.moveTo(-20, 0);
  c.lineTo(-34, -10);
  c.lineTo(-32, 0);
  c.lineTo(-34, 10);
  c.closePath();
  c.fill();

  // Dorsal fin
  c.fillStyle = "#4c5967";
  c.beginPath();
  c.moveTo(-2, -10);
  c.lineTo(8, -26);
  c.lineTo(14, -10);
  c.closePath();
  c.fill();

  // Eye
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(16, -2, 2.2, 0, Math.PI * 2);
  c.fill();

  // Mouth hint
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(18, 4);
  c.lineTo(26, 6);
  c.stroke();

  c.restore();
}

function drawRedCrabModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#c62828";
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-14, -8, 20, 16, 4);
  c.fill();
  c.stroke();
  c.fillStyle = "#b71c1c";
  c.beginPath();
  c.arc(6, -2, 5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(9, -3, 1.2, 0, Math.PI * 2);
  c.fill();
  for (const [lx, ly, ang] of [
    [-12, 8, 0.3],
    [4, 8, -0.2],
  ]) {
    c.save();
    c.translate(lx, ly);
    c.rotate(ang);
    c.strokeStyle = "#8b0000";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-6, 4);
    c.stroke();
    c.restore();
  }
  c.restore();
}

function drawTitanPrawnModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const g = c.createLinearGradient(-16, -4, 14, 6);
  g.addColorStop(0, "#ff6f00");
  g.addColorStop(0.5, "#ff3d00");
  g.addColorStop(1, "#bf360c");
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.2)";
  c.fillRect(-10, -4, 14, 3);
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(10, -1, 1.4, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#5d4037";
  c.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(-14 - i * 2, 2 + i * 0.5);
    c.lineTo(-20 - i * 2, 0);
    c.stroke();
  }
  c.restore();
}

function drawGiantCatSharkModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const g = c.createLinearGradient(-20, -8, 18, 8);
  g.addColorStop(0, "#5d4037");
  g.addColorStop(0.45, "#78909c");
  g.addColorStop(1, "#37474f");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-20, 0);
  c.quadraticCurveTo(-8, -11, 10, -5);
  c.lineTo(18, 0);
  c.lineTo(10, 6);
  c.quadraticCurveTo(-8, 11, -20, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();
  c.fillStyle = "#eceff1";
  c.beginPath();
  c.ellipse(2, 3, 12, 5, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(12, -2, 2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#5d4037";
  c.beginPath();
  c.moveTo(-4, -8);
  c.lineTo(2, -18);
  c.lineTo(8, -7);
  c.closePath();
  c.fill();
  c.restore();
}

function drawHyperliosisPoolSharkModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#6a1b9a";
  c.beginPath();
  c.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ce93d8";
  c.beginPath();
  c.ellipse(2, 3, 16, 7, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#4a148c";
  c.beginPath();
  c.moveTo(-20, 0);
  c.lineTo(-34, -10);
  c.lineTo(-32, 0);
  c.lineTo(-34, 10);
  c.closePath();
  c.fill();
  c.fillStyle = "#7b1fa2";
  c.beginPath();
  c.moveTo(-2, -10);
  c.lineTo(8, -26);
  c.lineTo(14, -10);
  c.closePath();
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(16, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(18, 4);
  c.lineTo(26, 6);
  c.stroke();
  c.restore();
}

function drawAnglerSharkModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#455a64";
  c.beginPath();
  c.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#cfd8dc";
  c.beginPath();
  c.ellipse(2, 3, 15, 6, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#37474f";
  c.beginPath();
  c.moveTo(-20, 0);
  c.lineTo(-32, -9);
  c.lineTo(-30, 0);
  c.lineTo(-32, 9);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(255,255,200,0.95)";
  c.lineWidth = 2;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(18, -6);
  c.quadraticCurveTo(28, -22, 34, -18);
  c.stroke();
  c.fillStyle = "rgba(255,255,180,0.9)";
  c.beginPath();
  c.arc(34, -18, 3, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(14, -2, 2, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawElectricalEelModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Long eel body
  const g = c.createLinearGradient(-24, -6, 24, 6);
  g.addColorStop(0, "#1b5e20");
  g.addColorStop(0.45, "#43a047");
  g.addColorStop(1, "#0b3d14");
  c.strokeStyle = g;
  c.lineWidth = 10;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(-24, 4);
  c.quadraticCurveTo(-6, -10, 10, 0);
  c.quadraticCurveTo(18, 6, 26, 2);
  c.stroke();

  // Outline
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(-24, 4);
  c.quadraticCurveTo(-6, -10, 10, 0);
  c.quadraticCurveTo(18, 6, 26, 2);
  c.stroke();

  // Eye
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(20, -1, 2.1, 0, Math.PI * 2);
  c.fill();

  // Electric stripes
  c.strokeStyle = "rgba(255, 235, 59, 0.85)";
  c.lineWidth = 2.2;
  for (let i = -18; i <= 14; i += 8) {
    c.beginPath();
    c.moveTo(i, 2);
    c.lineTo(i + 4, -4);
    c.lineTo(i + 8, 2);
    c.stroke();
  }

  c.restore();
}

function drawForestTurtleModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Shell
  c.fillStyle = "#2e7d32";
  c.beginPath();
  c.ellipse(0, 1, 18, 12, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  c.stroke();

  // Shell pattern
  c.strokeStyle = "rgba(190, 255, 190, 0.35)";
  c.lineWidth = 1;
  for (let i = -10; i <= 10; i += 5) {
    c.beginPath();
    c.moveTo(i, -6);
    c.lineTo(i * 0.6, 10);
    c.stroke();
  }

  // Head
  c.fillStyle = "#6d4c41";
  c.beginPath();
  c.ellipse(18, 2, 6, 4, 0, 0, Math.PI * 2);
  c.fill();

  // Eye
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(20, 1, 1.3, 0, Math.PI * 2);
  c.fill();

  // Legs
  c.fillStyle = "#5d4037";
  const legs = [
    [-10, 10],
    [0, 12],
    [10, 10],
    [-10, -6],
    [10, -6],
  ];
  for (const [lx, ly] of legs) {
    c.beginPath();
    c.ellipse(lx, ly, 3.5, 2.2, 0, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}

function drawBarracudaModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Long, sleek body
  const g = c.createLinearGradient(-22, -6, 22, 6);
  g.addColorStop(0, "#90a4ae");
  g.addColorStop(0.55, "#546e7a");
  g.addColorStop(1, "#263238");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-22, 0);
  c.quadraticCurveTo(-10, -10, 10, -4);
  c.lineTo(22, 0);
  c.lineTo(10, 4);
  c.quadraticCurveTo(-10, 10, -22, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Tail
  c.fillStyle = "#37474f";
  c.beginPath();
  c.moveTo(-22, 0);
  c.lineTo(-32, -8);
  c.lineTo(-30, 0);
  c.lineTo(-32, 8);
  c.closePath();
  c.fill();

  // Eye + teeth
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(12, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(12.6, -2, 1.0, 0, Math.PI * 2);
  c.fill();

  c.strokeStyle = "rgba(255,255,255,0.75)";
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(18 - i * 2.5, 1);
    c.lineTo(17 - i * 2.5, 3.5);
    c.stroke();
  }

  c.restore();
}

function drawFlyingFishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Body
  const g = c.createLinearGradient(-16, -6, 16, 6);
  g.addColorStop(0, "#b0bec5");
  g.addColorStop(0.55, "#78909c");
  g.addColorStop(1, "#37474f");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-16, 0);
  c.quadraticCurveTo(-6, -8, 8, -4);
  c.lineTo(16, 0);
  c.lineTo(8, 4);
  c.quadraticCurveTo(-6, 8, -16, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Wings
  c.fillStyle = "rgba(160, 210, 255, 0.65)";
  c.beginPath();
  c.moveTo(-2, -2);
  c.lineTo(-12, -14);
  c.lineTo(6, -8);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(-2, 2);
  c.lineTo(-12, 14);
  c.lineTo(6, 8);
  c.closePath();
  c.fill();

  // Tail
  c.fillStyle = "#607d8b";
  c.beginPath();
  c.moveTo(-16, 0);
  c.lineTo(-24, -7);
  c.lineTo(-22, 0);
  c.lineTo(-24, 7);
  c.closePath();
  c.fill();

  // Eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(10, -1.5, 2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(10.6, -1.5, 0.9, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawClownfishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Body (orange with white stripes)
  c.fillStyle = "#ff7a18";
  c.beginPath();
  c.moveTo(-16, 0);
  c.quadraticCurveTo(-6, -9, 10, -4);
  c.lineTo(16, 0);
  c.lineTo(10, 4);
  c.quadraticCurveTo(-6, 9, -16, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Stripes
  c.strokeStyle = "rgba(255,255,255,0.92)";
  c.lineWidth = 3.6;
  for (const x of [-6, 1, 9]) {
    c.beginPath();
    c.moveTo(x, -7);
    c.lineTo(x, 7);
    c.stroke();
  }
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  for (const x of [-6, 1, 9]) {
    c.beginPath();
    c.moveTo(x, -8);
    c.lineTo(x, 8);
    c.stroke();
  }

  // Tail
  c.fillStyle = "#ff7a18";
  c.beginPath();
  c.moveTo(-16, 0);
  c.lineTo(-26, -8);
  c.lineTo(-23, 0);
  c.lineTo(-26, 8);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.3)";
  c.stroke();

  // Eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(10.5, -2, 2.1, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(11.2, -2, 1.0, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawSunTangModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Disc body (yellow tang vibes)
  const g = c.createRadialGradient(-4, -4, 2, 0, 0, 16);
  g.addColorStop(0, "#fff59d");
  g.addColorStop(0.55, "#ffd54f");
  g.addColorStop(1, "#f9a825");
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, 13.5, 11.5, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Tail fin
  c.fillStyle = "#f57f17";
  c.beginPath();
  c.moveTo(13, 0);
  c.lineTo(22, -7);
  c.lineTo(19, 0);
  c.lineTo(22, 7);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.3)";
  c.stroke();

  // Eye
  c.fillStyle = "#263238";
  c.beginPath();
  c.arc(-2, -2.5, 2.3, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.75)";
  c.beginPath();
  c.arc(-1.3, -3.2, 0.8, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawParrotFishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Chunky body with rainbow gradient
  const g = c.createLinearGradient(-18, -8, 18, 8);
  g.addColorStop(0, "#00c853");
  g.addColorStop(0.5, "#00b0ff");
  g.addColorStop(1, "#ff5252");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-18, 0);
  c.quadraticCurveTo(-8, -10, 10, -5);
  c.lineTo(18, 0);
  c.lineTo(10, 5);
  c.quadraticCurveTo(-8, 10, -18, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Beak-like mouth
  c.fillStyle = "rgba(255,255,255,0.85)";
  c.beginPath();
  c.moveTo(16, 0);
  c.lineTo(20, -2.5);
  c.lineTo(19, 0);
  c.lineTo(20, 2.5);
  c.closePath();
  c.fill();

  // Tail
  c.fillStyle = "rgba(0,0,0,0.18)";
  c.beginPath();
  c.moveTo(-18, 0);
  c.lineTo(-28, -9);
  c.lineTo(-25, 0);
  c.lineTo(-28, 9);
  c.closePath();
  c.fill();

  // Eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(8.5, -2, 2.1, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(9.2, -2, 1.0, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawReefSharkModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Sleek shark body
  const g = c.createLinearGradient(-26, -8, 26, 8);
  g.addColorStop(0, "#90a4ae");
  g.addColorStop(0.55, "#607d8b");
  g.addColorStop(1, "#37474f");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-26, 0);
  c.quadraticCurveTo(-12, -10, 12, -4);
  c.lineTo(26, 0);
  c.lineTo(12, 4);
  c.quadraticCurveTo(-12, 10, -26, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();

  // Dorsal fin
  c.fillStyle = "rgba(30,40,50,0.35)";
  c.beginPath();
  c.moveTo(-2, -6);
  c.lineTo(3, -18);
  c.lineTo(8, -6);
  c.closePath();
  c.fill();

  // Tail
  c.fillStyle = "#455a64";
  c.beginPath();
  c.moveTo(-26, 0);
  c.lineTo(-40, -10);
  c.lineTo(-36, 0);
  c.lineTo(-40, 10);
  c.closePath();
  c.fill();

  // Eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(14, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(14.7, -2, 1.0, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawFoolFishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const g = c.createLinearGradient(-14, -8, 16, 8);
  g.addColorStop(0, "#ff7043");
  g.addColorStop(0.45, "#ffeb3b");
  g.addColorStop(1, "#ab47bc");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-16, 0);
  c.quadraticCurveTo(-6, -10, 10, -5);
  c.lineTo(16, 0);
  c.lineTo(10, 5);
  c.quadraticCurveTo(-6, 10, -16, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(7, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(7.5, -2, 1.0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#6a1b9a";
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(5, 2, 4, 0.2, Math.PI - 0.2);
  c.stroke();
  c.fillStyle = "#37474f";
  c.beginPath();
  c.moveTo(-16, 0);
  c.lineTo(-24, -7);
  c.lineTo(-22, 0);
  c.lineTo(-24, 7);
  c.closePath();
  c.fill();
  c.restore();
}

function drawGagFishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#ff7043";
  c.beginPath();
  c.arc(0, 0, 12, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.1;
  c.stroke();
  c.fillStyle = "#ffeb3b";
  c.beginPath();
  c.arc(-4, -3, 2.2, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(4, -3, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(-3.5, -3, 0.9, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(4.5, -3, 0.9, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#111";
  c.lineWidth = 1.4;
  c.beginPath();
  c.arc(0, 2, 5, 0.15, Math.PI - 0.15);
  c.stroke();
  c.restore();
}

function drawShark67Model(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const g = c.createLinearGradient(-18, -6, 18, 6);
  g.addColorStop(0, "#37474f");
  g.addColorStop(0.5, "#263238");
  g.addColorStop(1, "#102027");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-18, 0);
  c.quadraticCurveTo(-8, -9, 10, -4);
  c.lineTo(18, 0);
  c.lineTo(10, 5);
  c.quadraticCurveTo(-8, 9, -18, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.4)";
  c.lineWidth = 1.1;
  c.stroke();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(8, -2, 2.1, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(8.6, -2, 0.95, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(0, 230, 118, 0.9)";
  c.font = "bold 9px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("67", -2, 2);
  c.restore();
}

function drawGhostFishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.globalAlpha = 0.75;
  const g = c.createRadialGradient(0, 0, 2, 0, 0, 14);
  g.addColorStop(0, "rgba(240,250,255,0.95)");
  g.addColorStop(0.5, "rgba(180,210,255,0.5)");
  g.addColorStop(1, "rgba(140,170,220,0.15)");
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(200,220,255,0.5)";
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.85)";
  c.beginPath();
  c.arc(5, -2, 2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(30,40,60,0.7)";
  c.beginPath();
  c.arc(5.5, -2, 0.9, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawAnglerfishModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#37474f";
  c.beginPath();
  c.ellipse(0, 2, 12, 10, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.stroke();
  c.strokeStyle = "#546e7a";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-8, 0);
  c.quadraticCurveTo(-14, -12, -10, -18);
  c.stroke();
  c.fillStyle = "#fff59d";
  c.beginPath();
  c.arc(-10, -18, 4, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,255,200,0.95)";
  c.beginPath();
  c.arc(-10, -18, 2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(6, 0, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(6.6, 0, 1, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawAnglerDecoyLures(c, w, h, pcts) {
  for (const p of pcts) {
    const x = (p / 100) * w;
    const cy = h * 0.42;
    const g = c.createRadialGradient(x, cy, 0, x, cy, 12);
    g.addColorStop(0, "rgba(255,255,220,0.98)");
    g.addColorStop(0.45, "rgba(255,220,120,0.55)");
    g.addColorStop(1, "rgba(255,180,40,0)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, cy, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,200,0.95)";
    c.beginPath();
    c.arc(x, cy, 4, 0, Math.PI * 2);
    c.fill();
  }
}

function drawLuscaModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  // Pixel-art style Lusca (matches reference). Draw in "pixel units" then scale.
  const px = 1.4; // size of one pixel block in this local coordinate system
  c.imageSmoothingEnabled = false;

  // Palette (approx)
  const C0 = "#8fb3ff"; // light blue
  const C1 = "#6f8fe0"; // mid blue
  const C2 = "#4f6fbf"; // dark blue
  const C3 = "#2f4f8f"; // deepest
  const Y = "#ffd54f"; // eye
  const R = "#c62828"; // mouth/tongue
  const W = "#ffffff";

  // Minimal hand-crafted pixel map: each entry [x,y,color], centered around (0,0)
  // Coordinates are in pixel units relative to a 32x32-ish sprite.
  const pixels = [
    // Head + top fin (left facing)
    [-12, -3, C0], [-11, -3, C0], [-10, -3, C0], [-9, -3, C0],
    [-8, -3, C0], [-7, -3, C0], [-6, -3, C1], [-5, -3, C1],
    [-4, -3, C1], [-3, -3, C2], [-2, -3, C2],
    [-10, -4, C0], [-9, -4, C0], [-8, -4, C0], [-7, -4, C1], [-6, -4, C1],
    [-8, -5, C0], [-7, -5, C1], [-6, -5, C2],
    [-6, -6, C2], [-5, -6, C2], [-4, -6, C2],

    // Body core
    [-4, -2, C1], [-3, -2, C2], [-2, -2, C2], [-1, -2, C2], [0, -2, C3],
    [-5, -1, C1], [-4, -1, C2], [-3, -1, C2], [-2, -1, C3], [-1, -1, C3], [0, -1, C3], [1, -1, C3],
    [-5, 0, C1], [-4, 0, C2], [-3, 0, C3], [-2, 0, C3], [-1, 0, C3], [0, 0, C3], [1, 0, C2], [2, 0, C2],
    [-5, 1, C1], [-4, 1, C2], [-3, 1, C2], [-2, 1, C3], [-1, 1, C3], [0, 1, C2], [1, 1, C2], [2, 1, C1],
    [-4, 2, C1], [-3, 2, C2], [-2, 2, C2], [-1, 2, C2], [0, 2, C1], [1, 2, C1],

    // Head filler (prevents "floating eyes") — leave space for the cap pixels
    [-12, -2, C0], [-11, -2, C0],
    [-12, -1, C0], [-11, -1, C1], [-9, -1, C1],
    [-12, 0, C0], [-11, 0, C1], [-9, 0, C1],
    [-12, 1, C0], [-11, 1, C1], [-10, 1, C1], [-9, 1, C1],

    // Eye cap (little "hat/eyebrow" above the eye) — dark pixels right above eye.
    [-11, -2, C3], [-10, -2, C3], [-9, -2, C3],
    [-11, -3, C3], [-10, -3, C3],

    // Eye
    [-10, -1, Y], [-10, 0, Y],
    [-11, 0, C0],

    // Mouth (red)
    [-11, 1, R], [-10, 1, R], [-9, 1, R],
    [-11, 2, R], [-10, 2, W], [-9, 2, R],

    // Tentacles (right side curls)
    [3, -1, C1], [4, -1, C0], [5, -1, C0], [6, -1, C0],
    [4, 0, C1], [5, 0, C0], [6, 0, C0], [7, 0, C0],
    [5, 1, C1], [6, 1, C0], [7, 1, C0],
    [6, 2, C1], [7, 2, C0], [8, 2, C0],
    [7, 3, C1], [8, 3, C0], [9, 3, C0],
    [8, 4, C1], [9, 4, C0], [10, 4, C0],
    [9, 5, C1], [10, 5, C0],
    [10, 6, C1], [11, 6, C0],
    [11, 7, C1], [12, 7, C0],
    [11, 8, C1], [11, 9, C1], [10, 9, C1],

    // Lower curl
    [5, 4, C1], [6, 5, C1], [7, 6, C1], [8, 7, C1], [9, 8, C1],
    [8, 9, C1], [7, 10, C1], [6, 11, C1], [5, 12, C1], [4, 12, C1],
  ];

  for (const [x, y, col] of pixels) {
    c.fillStyle = col;
    c.fillRect(x * px, y * px, px, px);
  }

  c.restore();
}

function drawTropicalModel(c, cx, cy, scale, flip, color) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const palette = {
    red: ["#d32f2f", "#ff8a80", "#b71c1c"],
    yellow: ["#f9a825", "#fff59d", "#f57f17"],
    orange: ["#ef6c00", "#ffcc80", "#e65100"],
    purple: ["#6a1b9a", "#ce93d8", "#4a148c"],
  };
  const [a, b, c2] = palette[color] || palette.orange;
  c.beginPath();
  c.moveTo(-16, 2);
  c.quadraticCurveTo(-6, -10, 10, -6);
  c.lineTo(20, 0);
  c.lineTo(10, 6);
  c.quadraticCurveTo(-6, 10, -16, 2);
  c.closePath();
  const g = c.createLinearGradient(-14, 0, 18, 0);
  g.addColorStop(0, a);
  g.addColorStop(0.55, b);
  g.addColorStop(1, c2);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.75)";
  c.beginPath();
  c.arc(-2, 0, 4, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(12, -2, 2.3, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(-16, 2);
  c.lineTo(-26, 6);
  c.lineTo(-22, -6);
  c.closePath();
  c.fillStyle = b;
  c.fill();
  c.restore();
}

function drawPufferModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#ffd54f";
  c.beginPath();
  c.arc(0, 0, 12, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.stroke();
  c.fillStyle = "#ffb300";
  c.beginPath();
  c.arc(4, 2, 7, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#263238";
  c.beginPath();
  c.arc(6, -3, 2.4, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(50,30,10,0.5)";
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    c.beginPath();
    c.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
    c.lineTo(Math.cos(ang) * 15, Math.sin(ang) * 15);
    c.stroke();
  }
  c.restore();
}

function drawHerringModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);

  const g = c.createLinearGradient(-16, -6, 16, 6);
  g.addColorStop(0, "#cfd8dc");
  g.addColorStop(0.55, "#90a4ae");
  g.addColorStop(1, "#455a64");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-16, 0);
  c.quadraticCurveTo(-6, -7, 8, -3);
  c.lineTo(16, 0);
  c.lineTo(8, 3);
  c.quadraticCurveTo(-6, 7, -16, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.3)";
  c.lineWidth = 1.1;
  c.stroke();

  // stripe
  c.strokeStyle = "rgba(30,70,120,0.35)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-8, 0);
  c.lineTo(10, 0);
  c.stroke();

  // tail
  c.fillStyle = "#607d8b";
  c.beginPath();
  c.moveTo(-16, 0);
  c.lineTo(-24, -6);
  c.lineTo(-22, 0);
  c.lineTo(-24, 6);
  c.closePath();
  c.fill();

  // eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(10, -1.5, 2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(10.6, -1.5, 0.9, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawMetalSheetModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#9e9e9e";
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-14, -10, 28, 20, 3);
  c.fill();
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.25)";
  c.beginPath();
  c.moveTo(-10, -6);
  c.lineTo(10, -6);
  c.moveTo(-10, 0);
  c.lineTo(10, 0);
  c.moveTo(-10, 6);
  c.lineTo(10, 6);
  c.stroke();
  // rivets
  c.fillStyle = "rgba(0,0,0,0.18)";
  for (const [x, y] of [
    [-10, -7],
    [10, -7],
    [-10, 7],
    [10, 7],
  ]) {
    c.beginPath();
    c.arc(x, y, 1.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawGarbageFishModel(c, cx, cy, scale, flip) {
  // Minnow-like silhouette with dirty colors
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  const g = c.createLinearGradient(-14, 0, 18, 0);
  g.addColorStop(0, "#8d8f7a");
  g.addColorStop(0.55, "#6b6f5e");
  g.addColorStop(1, "#3e4237");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-14, 2);
  c.quadraticCurveTo(-6, -8, 8, -4);
  c.lineTo(18, 0);
  c.lineTo(8, 4);
  c.quadraticCurveTo(-6, 10, -14, 2);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.stroke();

  // grime spots
  c.fillStyle = "rgba(0,0,0,0.18)";
  for (const [x, y, r] of [
    [-2, 1, 2.2],
    [4, -1, 1.8],
    [-6, -1, 1.6],
  ]) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  // eye
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(10, -2, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(10.7, -2, 1.1, 0, Math.PI * 2);
  c.fill();

  // tail
  c.beginPath();
  c.moveTo(-14, 2);
  c.lineTo(-22, 6);
  c.lineTo(-20, -6);
  c.closePath();
  c.fillStyle = "#6b6f5e";
  c.fill();

  c.restore();
}

function drawPlasticBottleModel(c, cx, cy, scale, flip) {
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "rgba(180, 220, 255, 0.45)";
  c.strokeStyle = "rgba(30, 80, 120, 0.55)";
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(-5, -16);
  c.lineTo(5, -16);
  c.lineTo(6, -10);
  c.lineTo(10, 14);
  c.quadraticCurveTo(10, 18, 6, 18);
  c.lineTo(-6, 18);
  c.quadraticCurveTo(-10, 18, -10, 14);
  c.lineTo(-6, -10);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = "rgba(60, 130, 190, 0.35)";
  c.beginPath();
  c.ellipse(0, 4, 5.5, 9, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#5c4033";
  c.fillRect(-4, -18, 8, 4);
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.strokeRect(-4, -18, 8, 4);
  c.restore();
}

function drawBlueTangModel(c, cx, cy, scale, flip) {
  // Pufferfish silhouette, blue tang colors
  const s = scale * (flip ? -1 : 1);
  c.save();
  c.translate(cx, cy);
  c.scale(s, scale);
  c.fillStyle = "#42a5f5";
  c.beginPath();
  c.arc(0, 0, 12, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.stroke();

  c.fillStyle = "#1e88e5";
  c.beginPath();
  c.arc(-2, -1, 8, 0, Math.PI * 2);
  c.fill();

  // Yellow tail fin
  c.fillStyle = "#ffd54f";
  c.beginPath();
  c.moveTo(10, 0);
  c.lineTo(18, -6);
  c.lineTo(16, 0);
  c.lineTo(18, 6);
  c.closePath();
  c.fill();

  // Eye
  c.fillStyle = "#263238";
  c.beginPath();
  c.arc(4, -3, 2.4, 0, Math.PI * 2);
  c.fill();

  // Small spikes hint (still puffer-like)
  c.strokeStyle = "rgba(20,40,60,0.35)";
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    c.beginPath();
    c.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
    c.lineTo(Math.cos(ang) * 15, Math.sin(ang) * 15);
    c.stroke();
  }
  c.restore();
}

function drawRelicModel(c, cx, cy, sc, itemId) {
  const s = sc / 48;
  c.save();
  c.translate(cx, cy);
  c.scale(s, s);
  if (itemId === "stormRelic") {
    c.fillStyle = "#37474f";
    c.beginPath();
    c.ellipse(0, -2, 14, 9, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#546e7a";
    c.beginPath();
    c.ellipse(-5, 2, 8, 6, 0.2, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#ffeb3b";
    c.lineWidth = 2.5;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(6, -10);
    c.lineTo(2, -2);
    c.lineTo(6, -2);
    c.lineTo(0, 10);
    c.stroke();
  } else if (itemId === "titanRelic") {
    c.fillStyle = "#78909c";
    c.strokeStyle = "rgba(0,0,0,0.35)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.roundRect(-8, -14, 16, 22, 3);
    c.fill();
    c.stroke();
    c.fillStyle = "#ffc107";
    c.fillRect(-9, -6, 18, 4);
    c.fillStyle = "#eceff1";
    c.beginPath();
    c.arc(0, -14, 5, Math.PI, 0);
    c.lineTo(5, -10);
    c.lineTo(-5, -10);
    c.closePath();
    c.fill();
    c.stroke();
  }
  c.restore();
}

function drawItemIcon(c, itemId, w, h) {
  c.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const sc = Math.min(w, h);
  if (itemId === "beginnerRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "beginner");
  } else if (itemId === "advancedRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "advanced");
  } else if (itemId === "metalRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "metal");
  } else if (itemId === "testingRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "testing");
  } else if (itemId === "forestRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "forest");
  } else if (itemId === "speedRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "speed");
  } else if (itemId === "sharkRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "shark");
  } else if (itemId === "garbageRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "garbage");
  } else if (itemId === "liarRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "liar");
  } else if (itemId === "rod67") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "rod67");
  } else if (itemId === "gunRod") {
    drawRodModel(c, cx, cy - 2, sc / 42, -Math.PI / 5, "gun");
  } else if (itemId === "gunBullets") {
    c.fillStyle = "#b8860b";
    c.strokeStyle = "#5d4037";
    c.lineWidth = 1;
    c.beginPath();
    c.roundRect(cx - sc * 0.1, cy - sc * 0.28, sc * 0.2, sc * 0.5, sc * 0.05);
    c.fill();
    c.stroke();
    c.fillStyle = "#8d6e63";
    c.fillRect(cx - sc * 0.08, cy - sc * 0.34, sc * 0.16, sc * 0.1);
  } else if (itemId === "minnow") {
    drawMinnowModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "cod") {
    drawCodModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "rapFish") {
    drawRapModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "pufferfish") {
    drawPufferModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "blueTang") {
    drawBlueTangModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "tropicalRed") {
    drawTropicalModel(c, cx, cy, sc / 28, false, "red");
  } else if (itemId === "tropicalYellow") {
    drawTropicalModel(c, cx, cy, sc / 28, false, "yellow");
  } else if (itemId === "tropicalOrange") {
    drawTropicalModel(c, cx, cy, sc / 28, false, "orange");
  } else if (itemId === "tropicalPurple") {
    drawTropicalModel(c, cx, cy, sc / 28, false, "purple");
  } else if (itemId === "tropical") {
    drawTropicalModel(c, cx, cy, sc / 28, false, "orange");
  } else if (itemId === "forestFish") {
    drawForestFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "forestTurtle") {
    drawForestTurtleModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "barracuda") {
    drawBarracudaModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "poolShark") {
    drawPoolSharkModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "electricalEel") {
    drawElectricalEelModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "lusca") {
    drawLuscaModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "flyingFish") {
    drawFlyingFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "clownfish") {
    drawClownfishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "sunTang") {
    drawSunTangModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "parrotFish") {
    drawParrotFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "reefShark") {
    drawReefSharkModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "foolFish") {
    drawFoolFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "gagFish") {
    drawGagFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "shark67") {
    drawShark67Model(c, cx, cy, sc / 28, false);
  } else if (itemId === "ghostFish") {
    drawGhostFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "ghostBarracuda") {
    c.save();
    c.globalAlpha = 0.55;
    drawBarracudaModel(c, cx, cy, sc / 28, false);
    c.restore();
  } else if (itemId === "anglerfish") {
    drawAnglerfishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "herring") {
    drawHerringModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "metalSheet") {
    drawMetalSheetModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "garbageFish") {
    drawGarbageFishModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "plasticBottle") {
    drawPlasticBottleModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "redCrab") {
    drawRedCrabModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "titanPrawn") {
    drawTitanPrawnModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "giantCatShark") {
    drawGiantCatSharkModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "hyperliosisPoolShark") {
    drawHyperliosisPoolSharkModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "anglerShark") {
    drawAnglerSharkModel(c, cx, cy, sc / 28, false);
  } else if (itemId === "stormRelic" || itemId === "titanRelic") {
    drawRelicModel(c, cx, cy, sc, itemId);
  } else if (itemId === "secretPaper") {
    c.fillStyle = "#ede8dc";
    c.strokeStyle = "rgba(50, 40, 30, 0.42)";
    c.lineWidth = Math.max(1, sc * 0.04);
    const pw = sc * 0.52;
    const ph = sc * 0.68;
    const x0 = cx - pw / 2;
    const y0 = cy - ph / 2;
    const r = sc * 0.06;
    c.beginPath();
    c.moveTo(x0 + r, y0);
    c.lineTo(x0 + pw - r, y0);
    c.quadraticCurveTo(x0 + pw, y0, x0 + pw, y0 + r);
    c.lineTo(x0 + pw, y0 + ph - r);
    c.quadraticCurveTo(x0 + pw, y0 + ph, x0 + pw - r, y0 + ph);
    c.lineTo(x0 + r, y0 + ph);
    c.quadraticCurveTo(x0, y0 + ph, x0, y0 + ph - r);
    c.lineTo(x0, y0 + r);
    c.quadraticCurveTo(x0, y0, x0 + r, y0);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#2a2a44";
    c.font = `bold ${Math.max(4, sc * 0.11)}px ui-monospace, monospace`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(SECRET_PAPER_REVEAL_TEXT, cx, cy);
  }
}

function drawPlayerSquare(px, py, half, fx, fy) {
  const ang = Math.atan2(fy, fx);
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(ang);
  ctx.fillStyle = "#5dcef5";
  ctx.strokeStyle = "rgba(0,50,80,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(-half, -half, half * 2, half * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-5, -6, 4, 5);
  ctx.fillRect(2, -6, 4, 5);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-3.5, -4, 2, 2.5);
  ctx.fillRect(3.5, -4, 2, 2.5);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.quadraticCurveTo(0, 8, 4, 5);
  ctx.stroke();
  ctx.restore();
}

function drawStand2x2(x, y, kind) {
  const hw = TILE_SIZE * 1.1;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle =
    kind === "sell" ? "#8d1b1b" : kind === "harbor" ? "#2e7d32" : kind === "destroy" ? "#424242" : "#0d47a1";
  ctx.fillRect(-hw, -8, hw * 2, 8);
  ctx.fillStyle =
    kind === "sell" ? "#ffcdd2" : kind === "harbor" ? "#c8e6c9" : kind === "destroy" ? "#e0e0e0" : "#bbdefb";
  ctx.beginPath();
  ctx.moveTo(-hw - 4, -8);
  ctx.lineTo(0, -26);
  ctx.lineTo(hw + 4, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.strokeRect(-hw + 4, 0, hw * 2 - 8, 18);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(kind === "sell" ? "$" : kind === "harbor" ? "HARBOR" : kind === "destroy" ? "DESTROY" : "SHOP", 0, 13);
  ctx.restore();
}

function drawCastLineAndBobber() {
  const cx = castPoint.x;
  const cy = castPoint.y;
  const hx = player.x;
  const hy = player.y;
  ctx.strokeStyle = "rgba(30,50,70,0.55)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawEquippedRodToward(tx, ty, variant) {
  const ang = Math.atan2(ty - player.y, tx - player.x);
  drawRodModel(ctx, player.x, player.y, 1.1, ang + Math.PI * 0.12, variant);
}

function drawHeldItemInWorld() {
  if (held.kind !== "item" || !held.uid) return;
  const it =
    inventory.find((x) => x && x.uid === held.uid) || backpack.find((x) => x && x.uid === held.uid) || favorites.find((x) => x && x.uid === held.uid);
  if (!it) return;
  const fx = player.facing.x;
  const fy = player.facing.y;
  const len = Math.hypot(fx, fy) || 1;
  const hx = player.x + (fx / len) * 22;
  const hy = player.y + (fy / len) * 6;
  const c = ctx;
  c.save();
  const sc = 1.25 * fishScaleFromWeight(it);
  if (it.id === "minnow") drawMinnowModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "cod") drawCodModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "rapFish") drawRapModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "pufferfish") drawPufferModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "blueTang") drawBlueTangModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "poolShark") drawPoolSharkModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "barracuda") drawBarracudaModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "electricalEel") drawElectricalEelModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "forestFish") drawForestFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "forestTurtle") drawForestTurtleModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "lusca") drawLuscaModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "flyingFish") drawFlyingFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "clownfish") drawClownfishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "sunTang") drawSunTangModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "parrotFish") drawParrotFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "reefShark") drawReefSharkModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "foolFish") drawFoolFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "gagFish") drawGagFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "shark67") drawShark67Model(c, hx, hy, sc, fx < 0);
  else if (it.id === "ghostFish") drawGhostFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "ghostBarracuda") {
    c.save();
    c.globalAlpha = 0.55;
    drawBarracudaModel(c, hx, hy, sc, fx < 0);
    c.restore();
  } else if (it.id === "anglerfish") drawAnglerfishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "herring") drawHerringModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "metalSheet") drawMetalSheetModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "garbageFish") drawGarbageFishModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "plasticBottle") drawPlasticBottleModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "tropicalRed") drawTropicalModel(c, hx, hy, sc, fx < 0, "red");
  else if (it.id === "tropicalYellow") drawTropicalModel(c, hx, hy, sc, fx < 0, "yellow");
  else if (it.id === "tropicalOrange") drawTropicalModel(c, hx, hy, sc, fx < 0, "orange");
  else if (it.id === "tropicalPurple") drawTropicalModel(c, hx, hy, sc, fx < 0, "purple");
  else if (it.id === "stormRelic" || it.id === "titanRelic") {
    c.save();
    c.translate(hx, hy);
    drawRelicModel(c, 0, 0, 32, it.id);
    c.restore();
  } else if (it.id === "gunBullets") {
    c.save();
    c.translate(hx, hy);
    const ang = Math.atan2(fy, fx);
    c.rotate(ang + Math.PI * 0.5);
    for (let k = 0; k < 3; k++) {
      c.save();
      c.translate(k * 3 - 3, k * 2 - 2);
      c.fillStyle = "#c9a227";
      c.strokeStyle = "#5d4037";
      c.lineWidth = 0.8;
      c.beginPath();
      c.roundRect(-2.5, -8, 5, 14, 1.2);
      c.fill();
      c.stroke();
      c.fillStyle = "#8d6e63";
      c.fillRect(-2, -10, 4, 3);
      c.restore();
    }
    c.restore();
  } else if (it.id === "secretPaper") {
    c.save();
    c.translate(hx, hy);
    const ang = Math.atan2(fy, fx);
    c.rotate(ang + Math.PI * 0.5);
    const pw = 56;
    const ph = 38;
    c.fillStyle = "#f2ebe0";
    c.strokeStyle = "rgba(45, 35, 25, 0.4)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(3, -ph / 2);
    c.lineTo(pw / 2 - 4, -ph / 2);
    c.quadraticCurveTo(pw / 2, -ph / 2, pw / 2, -ph / 2 + 4);
    c.lineTo(pw / 2, ph / 2 - 4);
    c.quadraticCurveTo(pw / 2, ph / 2, pw / 2 - 4, ph / 2);
    c.lineTo(-pw / 2 + 4, ph / 2);
    c.quadraticCurveTo(-pw / 2, ph / 2, -pw / 2, ph / 2 - 4);
    c.lineTo(-pw / 2, -ph / 2 + 4);
    c.quadraticCurveTo(-pw / 2, -ph / 2, -pw / 2 + 4, -ph / 2);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#1c1c30";
    c.font = "bold 13px ui-monospace, monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(SECRET_PAPER_REVEAL_TEXT, 0, 0);
    c.restore();
  } else if (it.id === "redCrab") drawRedCrabModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "titanPrawn") drawTitanPrawnModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "giantCatShark") drawGiantCatSharkModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "hyperliosisPoolShark") drawHyperliosisPoolSharkModel(c, hx, hy, sc, fx < 0);
  else if (it.id === "anglerShark") drawAnglerSharkModel(c, hx, hy, sc, fx < 0);

  if (it.gold) {
    drawGoldSparklesWorld(c, hx, hy, 22 * fishScaleFromWeight(it), performance.now() / 1000, it.uid);
    c.fillStyle = "rgba(255, 213, 79, 0.95)";
    c.font = "bold 10px sans-serif";
    c.textAlign = "center";
    c.fillText("GOLD", hx, hy - 20 * fishScaleFromWeight(it));
  }
  if (it.forestMut) {
    drawForestMutationOverlay(c, hx + (fx < 0 ? -8 : 8), hy - 22 * fishScaleFromWeight(it), 1.2 * fishScaleFromWeight(it));
  }
  if (it.lightningMut) {
    drawLightningMutationOverlay(c, hx + (fx < 0 ? 14 : -14), hy - 8 * fishScaleFromWeight(it), 1.4 * fishScaleFromWeight(it));
  }
  if (it.foolsMut) {
    drawFoolsMutationOverlay(c, hx + (fx < 0 ? -18 : 18), hy - 18 * fishScaleFromWeight(it), 1.1 * fishScaleFromWeight(it));
  }
  if (it.hackedMut) {
    drawHackedGlitchWorld(c, hx, hy, fishScaleFromWeight(it), it.uid);
  }
  c.restore();
}

function anyInventoryHasHackedFish() {
  for (let i = 0; i < SLOT_COUNT; i++) {
    const it = inventory[i];
    if (it && FISH_ITEM_IDS.has(it.id) && it.hackedMut) return true;
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    const it = backpack[i];
    if (it && FISH_ITEM_IDS.has(it.id) && it.hackedMut) return true;
  }
  for (let i = 0; i < FAVORITES_SIZE; i++) {
    const it = favorites[i];
    if (it && FISH_ITEM_IDS.has(it.id) && it.hackedMut) return true;
  }
  return false;
}

function renderInventory() {
  inventoryBar.innerHTML = "";
  for (let i = 0; i < SLOT_COUNT; i++) {
    const slot = document.createElement("div");
    slot.className = "inv-slot";
    if (inventory[i]) slot.classList.add("has-item");
    if (i === selectedSlot) slot.classList.add("selected");
    const num = document.createElement("span");
    num.className = "slot-num";
    num.textContent = i + 1;
    slot.appendChild(num);
    if (inventory[i]) {
      const ic = document.createElement("canvas");
      ic.width = 40;
      ic.height = 40;
      ic.className = "inv-icon";
      const g = ic.getContext("2d");
      drawItemIcon(g, inventory[i].id, 40, 40);
      if (FISH_ITEM_IDS.has(inventory[i].id) && inventory[i].gold) {
        drawGoldSparklesIcon(g, 40, 40, inventory[i].uid);
      }
      if (FISH_ITEM_IDS.has(inventory[i].id)) {
        const goldTag = inventory[i].gold ? " [GOLD]" : "";
        const forestTag = inventory[i].forestMut ? " [FOREST]" : "";
        const lightningTag = inventory[i].lightningMut ? " [LIGHTNING]" : "";
        const foolsTag = inventory[i].foolsMut ? " [FOOL]" : "";
        const hackedTag = inventory[i].hackedMut ? " [HACKED×3]" : "";
        if (inventory[i].forestMut) drawForestMutationOverlay(g, 30, 10, 1.1);
        if (inventory[i].lightningMut) drawLightningMutationOverlay(g, 30, 26, 1.05);
        if (inventory[i].foolsMut) drawFoolsMutationOverlay(g, 8, 8, 0.95);
        if (inventory[i].hackedMut) drawHackedGlitchOverlay(g, 40, 40, inventory[i].uid, performance.now());
        ic.title = `${inventory[i].name}${goldTag}${forestTag}${lightningTag}${foolsTag}${hackedTag} — ${inventory[i].weightG}g — $${fishTotalSellValue(inventory[i])}`;
      } else if (inventory[i].id === "gunBullets") {
        ic.title = `Bullets (${inventory[i].qty | 0})`;
        g.save();
        g.fillStyle = "rgba(0,0,0,0.75)";
        g.font = "bold 10px sans-serif";
        g.textAlign = "right";
        g.textBaseline = "top";
        g.fillText(String(inventory[i].qty | 0), 38, 4);
        g.restore();
      } else {
        ic.title = inventory[i].name;
      }
      slot.appendChild(ic);
    }
    slot.addEventListener("click", () => {
      const it = inventory[i];
      if (it && (FISH_ITEM_IDS.has(it.id) || UID_MISC_ITEM_IDS.has(it.id) || it.id === "gunBullets")) holdItemUid(it.uid);
      else holdRod();
      selectedSlot = i;
      renderInventory();
      renderBackpackGrid();
    });
    slot.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (inventory[i] && FISH_ITEM_IDS.has(inventory[i].id)) {
        moveInventoryFishToFavorites(i);
        renderInventory();
        renderBackpackGrid();
      }
    });
    inventoryBar.appendChild(slot);
  }
  updateBackpackHud();
}

function renderRodSlot() {
  rodSlotEl.innerHTML = "";
  const cv = document.createElement("canvas");
  cv.width = 48;
  cv.height = 48;
  const c = cv.getContext("2d");
  drawItemIcon(c, equippedRodId || "beginnerRod", 48, 48);
  rodSlotEl.appendChild(cv);
}

function renderBackpackGrid() {
  favoritesGrid.innerHTML = "";
  backpackGrid.innerHTML = "";

  for (let i = 0; i < FAVORITES_SIZE; i++) {
    const slot = document.createElement("div");
    slot.className = "bp-slot";
    if (favorites[i]) {
      const ic = document.createElement("canvas");
      ic.width = 32;
      ic.height = 32;
      const g = ic.getContext("2d");
      drawItemIcon(g, favorites[i].id, 32, 32);
      if (FISH_ITEM_IDS.has(favorites[i].id) && favorites[i].gold) {
        drawGoldSparklesIcon(g, 32, 32, favorites[i].uid);
      }
      if (FISH_ITEM_IDS.has(favorites[i].id)) {
        const goldTag = favorites[i].gold ? " [GOLD]" : "";
        const forestTag = favorites[i].forestMut ? " [FOREST]" : "";
        const lightningTag = favorites[i].lightningMut ? " [LIGHTNING]" : "";
        const foolsTag = favorites[i].foolsMut ? " [FOOL]" : "";
        const hackedTag = favorites[i].hackedMut ? " [HACKED×3]" : "";
        if (favorites[i].forestMut) drawForestMutationOverlay(g, 22, 8, 1.0);
        if (favorites[i].lightningMut) drawLightningMutationOverlay(g, 22, 24, 1.0);
        if (favorites[i].foolsMut) drawFoolsMutationOverlay(g, 6, 6, 0.85);
        if (favorites[i].hackedMut) drawHackedGlitchOverlay(g, 32, 32, favorites[i].uid, performance.now());
        ic.title = `${favorites[i].name}${goldTag}${forestTag}${lightningTag}${foolsTag}${hackedTag} — ${favorites[i].weightG}g — $${fishTotalSellValue(favorites[i])}`;
      } else {
        ic.title = favorites[i].name;
      }
      slot.appendChild(ic);
    }
    slot.style.cursor = favorites[i] ? "pointer" : "default";
    slot.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const it = favorites[i];
      if (it && FISH_ITEM_IDS.has(it.id)) {
        e.preventDefault();
        holdItemUid(it.uid);
        renderInventory();
        renderBackpackGrid();
      }
    });
    slot.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (favorites[i] && FISH_ITEM_IDS.has(favorites[i].id)) {
        moveFavoriteFishToBackpack(i);
        renderBackpackGrid();
        renderInventory();
      }
    });
    favoritesGrid.appendChild(slot);
  }

  for (let i = 0; i < BACKPACK_SIZE; i++) {
    const slot = document.createElement("div");
    slot.className = "bp-slot";
    if (backpack[i]) {
      const ic = document.createElement("canvas");
      ic.width = 32;
      ic.height = 32;
      const g = ic.getContext("2d");
      drawItemIcon(g, backpack[i].id, 32, 32);
      if (FISH_ITEM_IDS.has(backpack[i].id) && backpack[i].gold) {
        drawGoldSparklesIcon(g, 32, 32, backpack[i].uid);
      }
      if (FISH_ITEM_IDS.has(backpack[i].id)) {
        const goldTag = backpack[i].gold ? " [GOLD]" : "";
        const forestTag = backpack[i].forestMut ? " [FOREST]" : "";
        const lightningTag = backpack[i].lightningMut ? " [LIGHTNING]" : "";
        const foolsTag = backpack[i].foolsMut ? " [FOOL]" : "";
        const hackedTag = backpack[i].hackedMut ? " [HACKED×3]" : "";
        if (backpack[i].forestMut) drawForestMutationOverlay(g, 22, 8, 1.0);
        if (backpack[i].lightningMut) drawLightningMutationOverlay(g, 22, 24, 1.0);
        if (backpack[i].foolsMut) drawFoolsMutationOverlay(g, 6, 6, 0.85);
        if (backpack[i].hackedMut) drawHackedGlitchOverlay(g, 32, 32, backpack[i].uid, performance.now());
        ic.title = `${backpack[i].name}${goldTag}${forestTag}${lightningTag}${foolsTag}${hackedTag} — ${backpack[i].weightG}g — $${fishTotalSellValue(backpack[i])}`;
      } else if (backpack[i].id === "gunBullets") {
        ic.title = `Bullets (${backpack[i].qty | 0})`;
        g.save();
        g.fillStyle = "rgba(0,0,0,0.75)";
        g.font = "bold 9px sans-serif";
        g.textAlign = "right";
        g.textBaseline = "top";
        g.fillText(String(backpack[i].qty | 0), 30, 2);
        g.restore();
      } else {
        ic.title = backpack[i].name;
      }
      slot.appendChild(ic);
    }
    slot.style.cursor = backpack[i] ? "pointer" : "default";
    slot.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const it = backpack[i];
      if (it && (FISH_ITEM_IDS.has(it.id) || UID_MISC_ITEM_IDS.has(it.id) || it.id === "gunBullets")) {
        e.preventDefault();
        holdItemUid(it.uid);
        renderInventory();
        renderBackpackGrid();
      }
    });
    slot.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (backpack[i] && FISH_ITEM_IDS.has(backpack[i].id)) {
        moveBackpackFishToFavorites(i);
        renderBackpackGrid();
        renderInventory();
      }
    });
    backpackGrid.appendChild(slot);
  }
  backpackUsedEl.textContent = String(countBackpackItems());
  if (favoritesUsedEl) favoritesUsedEl.textContent = String(countFavoritesItems());
}

function updateBackpackHud() {
  backpackCountEl.textContent = `Backpack: ${countBackpackItems()}/${BACKPACK_SIZE}`;
}

function movementVector() {
  let vx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  let vy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  const len = Math.hypot(vx, vy) || 1;
  return { x: vx / len, y: vy / len };
}

function closeAllUiPanels() {
  sellPanel.classList.add("hidden");
  shopPanel.classList.add("hidden");
  harborPanel.classList.add("hidden");
  bestiaryPanel.classList.add("hidden");
  rodsPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");
  craftingPanel.classList.add("hidden");
  destroyPanel.classList.add("hidden");
  illusionEnchantPanel?.classList.add("hidden");
  ghostCrafterPanel?.classList.add("hidden");
  relicSellerPanel?.classList.add("hidden");
  bestiaryOpen = false;
  backpackPanel.classList.add("hidden");
  backpackOpen = false;
  syncBackpackOpenBodyClass();
}

function renderIllusionEnchantPanel() {
  if (!illusionEnchantActionsEl) return;
  illusionEnchantActionsEl.innerHTML = "";
  if (illusionEnchantDescEl) {
    illusionEnchantDescEl.textContent = pendingIllusionEnchant
      ? "Choose a rod to bind this enchant to."
      : "Pay $500 for a random enchant, then choose a rod to bind it to.";
  }
  if (pendingIllusionEnchant) {
    const p = document.createElement("p");
    p.className = "modal-desc";
    p.style.marginBottom = "10px";
    p.textContent = `You rolled: ${ENCHANT_LABELS[pendingIllusionEnchant]}. Pick a rod:`;
    illusionEnchantActionsEl.appendChild(p);
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "8px";
    for (const rid of ownedRods) {
      if (!ROD_STATS[rid]) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = `Bind to ${ITEMS[rid].name}`;
      btn.addEventListener("click", () => {
        rodEnchants[rid] = pendingIllusionEnchant;
        pendingIllusionEnchant = null;
        saveGame();
        renderRods();
        renderRodSlot();
        renderIllusionEnchantPanel();
      });
      wrap.appendChild(btn);
    }
    illusionEnchantActionsEl.appendChild(wrap);
    return;
  }
  const buy = document.createElement("button");
  buy.type = "button";
  buy.textContent = "Buy random enchant ($500)";
  buy.disabled = money < 500;
  buy.addEventListener("click", () => {
    if (money < 500) return;
    money -= 500;
    updateMoneyHud();
    const i = Math.floor(Math.random() * ILLUSION_ENCHANT_TYPES.length);
    pendingIllusionEnchant = ILLUSION_ENCHANT_TYPES[i];
    saveGame();
    renderIllusionEnchantPanel();
  });
  illusionEnchantActionsEl.appendChild(buy);
}

function openIllusionEnchantPanel() {
  closeAllUiPanels();
  renderIllusionEnchantPanel();
  illusionEnchantPanel?.classList.remove("hidden");
}

function activateStormFromRelic() {
  stormActive = true;
  stormTimer = 0;
  lightningFlashT = 0.28;
}

function countRelicsInInventoryBackpack(rid) {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === rid) n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === rid) n++;
  return n;
}

function consumeRelicsFromInventoryBackpack(rid, count) {
  if (count <= 0) return true;
  let need = count;
  const removedUids = [];
  for (let i = 0; i < SLOT_COUNT && need > 0; i++) {
    const it = inventory[i];
    if (it?.id === rid) {
      removedUids.push(it.uid);
      inventory[i] = null;
      need--;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE && need > 0; i++) {
    const it = backpack[i];
    if (it?.id === rid) {
      removedUids.push(it.uid);
      backpack[i] = null;
      need--;
    }
  }
  if (held.kind === "item" && removedUids.includes(held.uid)) held = { kind: "rod", uid: null };
  return need === 0;
}

function renderGhostCrafterPanel() {
  if (!ghostCrafterRecipesEl) return;
  ghostCrafterRecipesEl.innerHTML = "";

  const makeRow = (title, desc, btnLabel, onCraft, disabledReason) => {
    const row = document.createElement("div");
    row.className = "recipe-row";
    const icon = document.createElement("canvas");
    icon.width = 48;
    icon.height = 48;
    const g = icon.getContext("2d");
    drawItemIcon(g, title === "Storm relic" ? "stormRelic" : "titanRelic", 48, 48);
    const meta = document.createElement("div");
    meta.className = "recipe-meta";
    meta.innerHTML = `<strong>${title}</strong><div class="recipe-req">${desc}</div>`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = btnLabel;
    if (disabledReason) {
      btn.disabled = true;
      btn.title = disabledReason;
    }
    btn.addEventListener("click", onCraft);
    row.appendChild(icon);
    row.appendChild(meta);
    row.appendChild(btn);
    ghostCrafterRecipesEl.appendChild(row);
  };

  const eel = countFishInInventoryBackpackOnly("electricalEel");
  const rap = countFishInInventoryBackpackOnly("rapFish");
  const stormBlock =
    money < 300 || eel < 3 || !hasAnyInventorySpace()
      ? !hasAnyInventorySpace()
        ? "No free inventory or backpack slot."
        : money < 300
          ? "Not enough cash."
          : "Need 3× electrical eel in hotbar or backpack (not favorites)."
      : null;
  makeRow(
    "Storm relic",
    `Cost: $300 + 3× electrical eel (you: ${eel}/3). Crafting starts a storm.`,
    "Craft Storm relic",
    () => {
      if (money < 300 || eel < 3 || !hasAnyInventorySpace()) return;
      const invS = inventory.slice();
      const bpS = backpack.slice();
      const moneyS = money;
      const heldS = { ...held };
      if (!consumeFishFromInventoryBackpackOnly("electricalEel", 3)) return;
      money -= 300;
      updateMoneyHud();
      if (!addItem({ ...ITEMS.stormRelic, uid: newUid() })) {
        for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = invS[i];
        for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = bpS[i];
        money = moneyS;
        held = heldS;
        updateMoneyHud();
        renderInventory();
        renderBackpackGrid();
        renderGhostCrafterPanel();
        return;
      }
      activateStormFromRelic();
      saveGame();
      renderGhostCrafterPanel();
      renderInventory();
      renderBackpackGrid();
    },
    stormBlock
  );

  const titanBlock =
    money < 400 || rap < 5 || !hasAnyInventorySpace()
      ? !hasAnyInventorySpace()
        ? "No free inventory or backpack slot."
        : money < 400
          ? "Not enough cash."
          : "Need 5× rap fish in hotbar or backpack (not favorites)."
      : null;
  makeRow(
    "Titan relic",
    `Cost: $400 + 5× rap fish (you: ${rap}/5). Its use will be revealed later.`,
    "Craft Titan relic",
    () => {
      if (money < 400 || rap < 5 || !hasAnyInventorySpace()) return;
      const invS = inventory.slice();
      const bpS = backpack.slice();
      const moneyS = money;
      const heldS = { ...held };
      if (!consumeFishFromInventoryBackpackOnly("rapFish", 5)) return;
      money -= 400;
      updateMoneyHud();
      if (!addItem({ ...ITEMS.titanRelic, uid: newUid() })) {
        for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = invS[i];
        for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = bpS[i];
        money = moneyS;
        held = heldS;
        updateMoneyHud();
        renderInventory();
        renderBackpackGrid();
        renderGhostCrafterPanel();
        return;
      }
      saveGame();
      renderGhostCrafterPanel();
      renderInventory();
      renderBackpackGrid();
    },
    titanBlock
  );
}

function openGhostCrafterPanel() {
  closeAllUiPanels();
  renderGhostCrafterPanel();
  ghostCrafterPanel?.classList.remove("hidden");
}

function updateRelicSellerTotal() {
  if (!relicSellStormQtyEl || !relicSellTitanQtyEl || !relicSellTotalEl) return;
  const maxS = countRelicsInInventoryBackpack("stormRelic");
  const maxT = countRelicsInInventoryBackpack("titanRelic");
  let qs = Math.max(0, Math.floor(Number(relicSellStormQtyEl.value) || 0));
  let qt = Math.max(0, Math.floor(Number(relicSellTitanQtyEl.value) || 0));
  qs = Math.min(qs, maxS);
  qt = Math.min(qt, maxT);
  relicSellStormQtyEl.value = String(qs);
  relicSellTitanQtyEl.value = String(qt);
  const total = qs * RELIC_SELL_PRICE.stormRelic + qt * RELIC_SELL_PRICE.titanRelic;
  relicSellTotalEl.textContent = String(total);
}

function openRelicSellerPanel() {
  closeAllUiPanels();
  if (relicSellerOwnedEl) {
    const ns = countRelicsInInventoryBackpack("stormRelic");
    const nt = countRelicsInInventoryBackpack("titanRelic");
    relicSellerOwnedEl.textContent = `You have: ${ns}× Storm relic, ${nt}× Titan relic ($${RELIC_SELL_PRICE.stormRelic} / $${RELIC_SELL_PRICE.titanRelic} each).`;
  }
  if (relicSellStormQtyEl) {
    relicSellStormQtyEl.max = String(countRelicsInInventoryBackpack("stormRelic"));
    relicSellStormQtyEl.value = "0";
  }
  if (relicSellTitanQtyEl) {
    relicSellTitanQtyEl.max = String(countRelicsInInventoryBackpack("titanRelic"));
    relicSellTitanQtyEl.value = "0";
  }
  updateRelicSellerTotal();
  relicSellerPanel?.classList.remove("hidden");
}

function tryRelicSell() {
  if (!relicSellStormQtyEl || !relicSellTitanQtyEl) return;
  const maxS = countRelicsInInventoryBackpack("stormRelic");
  const maxT = countRelicsInInventoryBackpack("titanRelic");
  let qs = Math.max(0, Math.floor(Number(relicSellStormQtyEl.value) || 0));
  let qt = Math.max(0, Math.floor(Number(relicSellTitanQtyEl.value) || 0));
  qs = Math.min(qs, maxS);
  qt = Math.min(qt, maxT);
  if (qs === 0 && qt === 0) return;
  if (countRelicsInInventoryBackpack("stormRelic") < qs || countRelicsInInventoryBackpack("titanRelic") < qt) return;
  const snapInv = inventory.slice();
  const snapBp = backpack.slice();
  const snapHeld = { ...held };
  if (!consumeRelicsFromInventoryBackpack("stormRelic", qs)) return;
  if (!consumeRelicsFromInventoryBackpack("titanRelic", qt)) {
    for (let i = 0; i < SLOT_COUNT; i++) inventory[i] = snapInv[i];
    for (let i = 0; i < BACKPACK_SIZE; i++) backpack[i] = snapBp[i];
    held = snapHeld;
    return;
  }
  const pay = qs * RELIC_SELL_PRICE.stormRelic + qt * RELIC_SELL_PRICE.titanRelic;
  money += pay;
  updateMoneyHud();
  saveGame();
  renderInventory();
  renderBackpackGrid();
  openRelicSellerPanel();
}

function openSellPanel() {
  closeAllUiPanels();
  updateSellBreakdown();
  sellPanel.classList.remove("hidden");
}

function countMetalSheets() {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === "metalSheet") n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === "metalSheet") n++;
  for (let i = 0; i < FAVORITES_SIZE; i++) if (favorites[i]?.id === "metalSheet") n++;
  return n;
}

function countSecretPapers() {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === "secretPaper") n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === "secretPaper") n++;
  for (let i = 0; i < FAVORITES_SIZE; i++) if (favorites[i]?.id === "secretPaper") n++;
  return n;
}

function countDestroyableJunk() {
  return countMetalSheets() + countSecretPapers();
}

function openDestroyPanel() {
  closeAllUiPanels();
  const ms = countMetalSheets();
  const sp = countSecretPapers();
  if (destroyCountEl) {
    destroyCountEl.innerHTML = `Metal sheets: <strong>${ms}</strong> · Paper: <strong>${sp}</strong>`;
  }
  if (destroyAllBtn) destroyAllBtn.disabled = countDestroyableJunk() <= 0;
  destroyPanel.classList.remove("hidden");
}

let currentShopIslandKind = "grandReef";
const forestRodRowEl = document.getElementById("forest-rod-row");

function updateAprilFoolsShopButtons() {
  const t = document.getElementById("shop-af-buy-testing");
  const l = document.getElementById("shop-af-buy-liar");
  if (t) {
    t.disabled = ownedRods.has("testingRod") || money < 1500;
    t.textContent = ownedRods.has("testingRod") ? "Owned" : "Buy";
  }
  if (l) {
    l.disabled = ownedRods.has("liarRod") || aprilFoolsTokens < 20;
    l.textContent = ownedRods.has("liarRod") ? "Owned" : "Buy";
  }
}

function openShopPanel(island) {
  closeAllUiPanels();
  const here = island || islandAtPoint(player.x, player.y);
  currentShopIslandKind = here?.kind || "grandReef";
  const showAf = here?.kind === "aprilFools" && isAprilFoolsWeekActive();
  // Only Tropico shop sells Forest rod
  const showForest = here?.kind === "tropico";
  if (forestRodRowEl) forestRodRowEl.classList.toggle("hidden", !showForest || showAf);
  if (shopMainListEl) shopMainListEl.classList.toggle("hidden", showAf);
  if (shopAprilFoolsListEl) shopAprilFoolsListEl.classList.toggle("hidden", !showAf);
  if (shopAprilFoolsBannerEl) shopAprilFoolsBannerEl.classList.toggle("hidden", !showAf);
  if (shopMainNoteEl) shopMainNoteEl.classList.toggle("hidden", showAf);
  if (shopAprilFoolsNoteEl) shopAprilFoolsNoteEl.classList.toggle("hidden", !showAf);
  if (shopPanelTitleEl) shopPanelTitleEl.textContent = showAf ? "April Fools shop" : "Tackle shop";
  if (showAf) updateAprilFoolsShopButtons();
  shopPanel.classList.remove("hidden");
}

function openHarborPanel() {
  closeAllUiPanels();
  harborPanel.classList.remove("hidden");
  boatStatusEl.textContent = ownedBoat ? "You already own a boat (permanent)." : "You do not own a boat yet.";
  buyBoatBtn.disabled = ownedBoat || money < 50;
}

function openBestiary() {
  closeAllUiPanels();
  renderBestiary();
  bestiaryPanel.classList.remove("hidden");
  bestiaryOpen = true;
}

function openCraftingPanel() {
  closeAllUiPanels();
  craftingUiMode = "shark";
  renderCrafting();
  craftingPanel.classList.remove("hidden");
}

function openMemeCraftingPanel() {
  closeAllUiPanels();
  craftingUiMode = "meme67";
  renderCrafting();
  craftingPanel.classList.remove("hidden");
}

function countFishInInventoryBackpackOnly(fid) {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) if (inventory[i]?.id === fid) n++;
  for (let i = 0; i < BACKPACK_SIZE; i++) if (backpack[i]?.id === fid) n++;
  return n;
}

function consumeFishFromInventoryBackpackOnly(fid, count) {
  let need = count;
  const removedUids = [];
  for (let i = 0; i < SLOT_COUNT && need > 0; i++) {
    const it = inventory[i];
    if (it?.id === fid) {
      removedUids.push(it.uid);
      inventory[i] = null;
      need--;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE && need > 0; i++) {
    const it = backpack[i];
    if (it?.id === fid) {
      removedUids.push(it.uid);
      backpack[i] = null;
      need--;
    }
  }
  if (held.kind === "item" && removedUids.includes(held.uid)) held = { kind: "rod", uid: null };
  return need === 0;
}

function renderCrafting() {
  if (!craftingContentEl) return;
  craftingContentEl.innerHTML = "";
  if (craftingPanelTitleEl) {
    craftingPanelTitleEl.textContent = craftingUiMode === "meme67" ? "Meme Crafter" : "Crafting";
  }
  if (craftingPanelDescEl) {
    craftingPanelDescEl.textContent =
      craftingUiMode === "meme67"
        ? "Event-only recipes from the April Fools island Meme Crafter."
        : "Want to craft some rods?";
  }

  if (craftingUiMode === "shark") {
    const row = document.createElement("div");
    row.className = "recipe-row";

    const icon = document.createElement("canvas");
    icon.width = 48;
    icon.height = 48;
    drawItemIcon(icon.getContext("2d"), "sharkRod", 48, 48);

    const meta = document.createElement("div");
    meta.className = "recipe-meta";
    const haveSharks = countFishInInventoryBackpackOnly("poolShark");
    const haveB = countFishInInventoryBackpackOnly("barracuda");
    meta.innerHTML = `<strong>Shark rod</strong><div class="recipe-req">Requires: 2× Pool shark (${haveSharks}/2), 1× Barracuda (${haveB}/1)</div>`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ownedRods.has("sharkRod") ? "Owned" : "Craft";
    btn.disabled = ownedRods.has("sharkRod");
    btn.addEventListener("click", () => {
      if (ownedRods.has("sharkRod")) return;
      if (countFishInInventoryBackpackOnly("poolShark") < 2) return;
      if (countFishInInventoryBackpackOnly("barracuda") < 1) return;
      const ok1 = consumeFishFromInventoryBackpackOnly("poolShark", 2);
      const ok2 = consumeFishFromInventoryBackpackOnly("barracuda", 1);
      if (!ok1 || !ok2) return;
      ownedRods.add("sharkRod");
      equippedRodId = "sharkRod";
      holdRod();
      renderRodSlot();
      renderRods();
      renderInventory();
      renderBackpackGrid();
      saveGame();
      renderCrafting();
    });

    row.appendChild(icon);
    row.appendChild(meta);
    row.appendChild(btn);
    craftingContentEl.appendChild(row);

    const gunRow = document.createElement("div");
    gunRow.className = "recipe-row";
    const gunIc = document.createElement("canvas");
    gunIc.width = 48;
    gunIc.height = 48;
    drawItemIcon(gunIc.getContext("2d"), "gunRod", 48, 48);
    const gunMeta = document.createElement("div");
    gunMeta.className = "recipe-meta";
    const gba = countFishInInventoryBackpackOnly("ghostBarracuda");
    const ffly = countFishInInventoryBackpackOnly("flyingFish");
    const herr = countFishInInventoryBackpackOnly("herring");
    gunMeta.innerHTML = `<strong>Gun rod</strong><div class="recipe-req">Requires: $1000 (you $${money}), 4× Ghost barracuda (${gba}/4), 3× Flying fish (${ffly}/3), 1× Herring (${herr}/1). Uses 1 bullet per cast — craft bullets below.</div>`;
    const gunBtn = document.createElement("button");
    gunBtn.type = "button";
    gunBtn.textContent = ownedRods.has("gunRod") ? "Owned" : "Craft";
    gunBtn.disabled = ownedRods.has("gunRod");
    gunBtn.addEventListener("click", () => {
      if (ownedRods.has("gunRod")) return;
      if (money < 1000) return;
      if (countFishInInventoryBackpackOnly("ghostBarracuda") < 4) return;
      if (countFishInInventoryBackpackOnly("flyingFish") < 3) return;
      if (countFishInInventoryBackpackOnly("herring") < 1) return;
      if (!consumeFishFromInventoryBackpackOnly("ghostBarracuda", 4)) return;
      if (!consumeFishFromInventoryBackpackOnly("flyingFish", 3)) return;
      if (!consumeFishFromInventoryBackpackOnly("herring", 1)) return;
      money -= 1000;
      updateMoneyHud();
      ownedRods.add("gunRod");
      equippedRodId = "gunRod";
      holdRod();
      renderRodSlot();
      renderRods();
      renderInventory();
      renderBackpackGrid();
      saveGame();
      renderCrafting();
    });
    gunRow.appendChild(gunIc);
    gunRow.appendChild(gunMeta);
    gunRow.appendChild(gunBtn);
    craftingContentEl.appendChild(gunRow);

    const bulRow = document.createElement("div");
    bulRow.className = "recipe-row";
    const bulIc = document.createElement("canvas");
    bulIc.width = 48;
    bulIc.height = 48;
    drawItemIcon(bulIc.getContext("2d"), "gunBullets", 48, 48);
    const bulMeta = document.createElement("div");
    bulMeta.className = "recipe-meta";
    const msOne = countFishInInventoryBackpackOnly("metalSheet") >= 1;
    bulMeta.innerHTML = `<strong>Gun bullets (×5)</strong><div class="recipe-req">Requires: 1× Metal sheet (${msOne ? "1/1" : "0/1"}), $100 (you $${money}). Stacks in inventory as <em>Bullets (count)</em>. Craft unlimited times.</div>`;
    const bulBtn = document.createElement("button");
    bulBtn.type = "button";
    bulBtn.textContent = "Craft 5";
    bulBtn.addEventListener("click", () => {
      if (money < 100) return;
      if (countFishInInventoryBackpackOnly("metalSheet") < 1) return;
      if (!canAddGunBulletsMerge()) return;
      if (!consumeFishFromInventoryBackpackOnly("metalSheet", 1)) return;
      money -= 100;
      updateMoneyHud();
      if (!addOrMergeGunBullets(5)) return;
      renderInventory();
      renderBackpackGrid();
      saveGame();
      renderCrafting();
    });
    bulRow.appendChild(bulIc);
    bulRow.appendChild(bulMeta);
    bulRow.appendChild(bulBtn);
    craftingContentEl.appendChild(bulRow);
    return;
  }

  const row = document.createElement("div");
  row.className = "recipe-row";

  const icon = document.createElement("canvas");
  icon.width = 48;
  icon.height = 48;
  drawItemIcon(icon.getContext("2d"), "rod67", 48, 48);

  const meta = document.createElement("div");
  meta.className = "recipe-meta";
  const haveS = countFishInInventoryBackpackOnly("shark67");
  const haveMs = countFishInInventoryBackpackOnly("metalSheet");
  meta.innerHTML = `<strong>67 rod</strong><div class="recipe-req">Requires: 5× 67 Shark (${haveS}/5), 5× Metal sheet (${haveMs}/5), $6767 (you have $${money})</div>`;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = ownedRods.has("rod67") ? "Owned" : "Craft";
  btn.disabled = ownedRods.has("rod67");
  btn.addEventListener("click", () => {
    if (ownedRods.has("rod67")) return;
    if (countFishInInventoryBackpackOnly("shark67") < 5) return;
    if (countFishInInventoryBackpackOnly("metalSheet") < 5) return;
    if (money < 6767) return;
    const ok1 = consumeFishFromInventoryBackpackOnly("shark67", 5);
    const ok2 = consumeFishFromInventoryBackpackOnly("metalSheet", 5);
    if (!ok1 || !ok2) return;
    money -= 6767;
    updateMoneyHud();
    ownedRods.add("rod67");
    equippedRodId = "rod67";
    holdRod();
    renderRodSlot();
    renderRods();
    renderInventory();
    renderBackpackGrid();
    saveGame();
    renderCrafting();
  });

  row.appendChild(icon);
  row.appendChild(meta);
  row.appendChild(btn);
  craftingContentEl.appendChild(row);
}

function openRodsPanel() {
  closeAllUiPanels();
  renderRods();
  rodsPanel.classList.remove("hidden");
}

function openSettingsPanel(tab) {
  closeAllUiPanels();
  settingsPanel.classList.remove("hidden");
  setSettingsTab(tab || "settings");
}

function setSettingsTab(tab) {
  for (const b of tabButtons) b.classList.toggle("active", b.getAttribute("data-tab") === tab);
  tabSettingsEl.classList.toggle("hidden", tab !== "settings");
  tabCodesEl.classList.toggle("hidden", tab !== "codes");
  if (tab === "codes") {
    codeMessageEl.textContent = "";
    codeInputEl.value = "";
    codeInputEl.focus();
  }
}

function renderRods() {
  rodsContentEl.innerHTML = "";
  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "10px";

  const rodIds = ["beginnerRod", "advancedRod", "metalRod", "forestRod", "speedRod", "sharkRod", "gunRod", "rod67", "testingRod", "liarRod"];
  for (const rid of rodIds) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "12px";
    row.style.padding = "8px 0";
    row.style.borderBottom = "1px solid rgba(255,255,255,0.06)";

    const cv = document.createElement("canvas");
    cv.width = 48;
    cv.height = 48;
    drawItemIcon(cv.getContext("2d"), rid, 48, 48);

    const meta = document.createElement("div");
    meta.style.flex = "1";
    const owned = ownedRods.has(rid);
    const eq = equippedRodId === rid;
    const en = getRodEnchant(rid);
    const enLine = en && owned ? `<div class="rarity">Enchant: ${ENCHANT_LABELS[en]}</div>` : "";
    meta.innerHTML = `<strong>${ITEMS[rid].name}</strong><div class=\"rarity\">${owned ? (eq ? "Equipped" : "Owned") : "Not owned"}</div>${enLine}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Equip";
    btn.disabled = !owned;
    btn.addEventListener("click", () => {
      if (!ownedRods.has(rid)) return;
      equippedRodId = rid;
      renderRodSlot();
      renderRods();
      saveGame();
    });

    row.appendChild(cv);
    row.appendChild(meta);
    row.appendChild(btn);
    list.appendChild(row);
  }
  rodsContentEl.appendChild(list);
}

document.getElementById("sell-all-btn").addEventListener("click", () => {
  const { total } = removeAllFishForSell();
  money += total;
  updateMoneyHud();
  updateSellBreakdown();
  renderInventory();
  renderBackpackGrid();
  saveGame();
});

function destroyAllMetalSheets() {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i]?.id === "metalSheet") {
      if (held.kind === "item" && held.uid === inventory[i].uid) held = { kind: "rod", uid: null };
      inventory[i] = null;
      n++;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i]?.id === "metalSheet") {
      if (held.kind === "item" && held.uid === backpack[i].uid) held = { kind: "rod", uid: null };
      backpack[i] = null;
      n++;
    }
  }
  for (let i = 0; i < FAVORITES_SIZE; i++) {
    if (favorites[i]?.id === "metalSheet") {
      if (held.kind === "item" && held.uid === favorites[i].uid) held = { kind: "rod", uid: null };
      favorites[i] = null;
      n++;
    }
  }
  return n;
}

function destroyAllSecretPapers() {
  let n = 0;
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (inventory[i]?.id === "secretPaper") {
      if (held.kind === "item" && held.uid === inventory[i].uid) held = { kind: "rod", uid: null };
      inventory[i] = null;
      n++;
    }
  }
  for (let i = 0; i < BACKPACK_SIZE; i++) {
    if (backpack[i]?.id === "secretPaper") {
      if (held.kind === "item" && held.uid === backpack[i].uid) held = { kind: "rod", uid: null };
      backpack[i] = null;
      n++;
    }
  }
  for (let i = 0; i < FAVORITES_SIZE; i++) {
    if (favorites[i]?.id === "secretPaper") {
      if (held.kind === "item" && held.uid === favorites[i].uid) held = { kind: "rod", uid: null };
      favorites[i] = null;
      n++;
    }
  }
  return n;
}

function destroyAllJunkAtStand() {
  destroyAllMetalSheets();
  destroyAllSecretPapers();
}

destroyAllBtn?.addEventListener("click", () => {
  destroyAllJunkAtStand();
  if (destroyCountEl) {
    destroyCountEl.innerHTML = `Metal sheets: <strong>${countMetalSheets()}</strong> · Paper: <strong>${countSecretPapers()}</strong>`;
  }
  if (destroyAllBtn) destroyAllBtn.disabled = countDestroyableJunk() <= 0;
  renderInventory();
  renderBackpackGrid();
  saveGame();
});

document.getElementById("sell-close-btn").addEventListener("click", closeAllUiPanels);
document.getElementById("shop-close-btn").addEventListener("click", closeAllUiPanels);
destroyCloseBtn?.addEventListener("click", closeAllUiPanels);
harborCloseBtn.addEventListener("click", closeAllUiPanels);
document.getElementById("bestiary-close-btn").addEventListener("click", closeAllUiPanels);
document.getElementById("rods-close-btn").addEventListener("click", closeAllUiPanels);
craftingCloseBtn?.addEventListener("click", closeAllUiPanels);
illusionEnchantCloseBtn?.addEventListener("click", closeAllUiPanels);
ghostCrafterCloseBtn?.addEventListener("click", closeAllUiPanels);
relicSellerCloseBtn?.addEventListener("click", closeAllUiPanels);
relicSellBtn?.addEventListener("click", tryRelicSell);
relicSellStormQtyEl?.addEventListener("input", updateRelicSellerTotal);
relicSellTitanQtyEl?.addEventListener("input", updateRelicSellerTotal);

document.querySelectorAll("[data-buy]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-buy");
    const stats = ROD_STATS[id];
    if (!stats) return;
    if (id === "forestRod" && currentShopIslandKind !== "tropico") return;
    if (id === "sharkRod" || id === "rod67") return;
    if (money < stats.price) return;
    money -= stats.price;
    updateMoneyHud();
    ownedRods.add(id);
    if (!equippedRodId) equippedRodId = id;
    renderInventory();
    renderBackpackGrid();
    renderRodSlot();
    holdRod();
    saveGame();
  });
});

document.querySelectorAll("[data-equip]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-equip");
    if (!id || !ownedRods.has(id)) return;
    equippedRodId = id;
    renderRodSlot();
    renderRods();
    saveGame();
  });
});

document.getElementById("shop-af-buy-testing")?.addEventListener("click", () => {
  if (currentShopIslandKind !== "aprilFools" || !isAprilFoolsWeekActive()) return;
  if (ownedRods.has("testingRod")) return;
  if (money < 1500) return;
  money -= 1500;
  ownedRods.add("testingRod");
  updateMoneyHud();
  renderRodSlot();
  holdRod();
  saveGame();
  updateAprilFoolsShopButtons();
});

document.getElementById("shop-af-buy-liar")?.addEventListener("click", () => {
  if (currentShopIslandKind !== "aprilFools" || !isAprilFoolsWeekActive()) return;
  if (ownedRods.has("liarRod")) return;
  if (aprilFoolsTokens < 20) return;
  aprilFoolsTokens -= 20;
  ownedRods.add("liarRod");
  updateAfTokensHud();
  renderRodSlot();
  holdRod();
  saveGame();
  updateAprilFoolsShopButtons();
});

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (gameState === "drowned") {
    if (e.code === "KeyR") respawnAfterDrown();
    return;
  }
  if (e.code === "Escape") {
    if (
      !sellPanel.classList.contains("hidden") ||
      !shopPanel.classList.contains("hidden") ||
      !bestiaryPanel.classList.contains("hidden")
    ) {
      e.preventDefault();
      closeAllUiPanels();
      return;
    }
  }
  if (e.code === "KeyE" && gameState === "playing" && fishingState === "idle") {
    if (!settingsPanel.classList.contains("hidden")) return;
    const is = islandAtPoint(player.x, player.y);
    if (!is) return;
    const ps = standPosSell(is);
    const ph = standPosShop(is);
    const hb = standPosHarbor(is);
    const dg = standPosDestroy(is);
    if (is.kind === "garbage") {
      if (nearStand(player.x, player.y, dg)) openDestroyPanel();
      return;
    }
    if (nearStand(player.x, player.y, ps)) openSellPanel();
    else if (nearStand(player.x, player.y, ph)) openShopPanel(is);
    else if (nearStand(player.x, player.y, hb)) openHarborPanel();
  }
  if (e.code === "KeyO" && gameState === "playing") {
    if (!settingsPanel.classList.contains("hidden")) return;
    if (bestiaryOpen) closeAllUiPanels();
    else openBestiary();
  }
  if (e.code === "KeyP" && gameState === "playing") {
    if (!settingsPanel.classList.contains("hidden")) return;
    openRodsPanel();
  }
  if (e.code === "KeyB" && gameState === "playing") {
    bestiaryPanel.classList.add("hidden");
    bestiaryOpen = false;
    backpackOpen = !backpackOpen;
    backpackPanel.classList.toggle("hidden", !backpackOpen);
    syncBackpackOpenBodyClass();
    if (backpackOpen) renderBackpackGrid();
  }
  if (e.code === "Digit1") selectedSlot = 0;
  if (e.code === "Digit2") selectedSlot = 1;
  if (e.code === "Digit3") selectedSlot = 2;
  if (e.code === "Digit4") selectedSlot = 3;
  if (e.code === "Digit5") selectedSlot = 4;
    if (["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"].includes(e.code)) {
    const hot = inventory[selectedSlot];
    if (hot && (FISH_ITEM_IDS.has(hot.id) || UID_MISC_ITEM_IDS.has(hot.id) || hot.id === "gunBullets")) holdItemUid(hot.uid);
    else holdRod();
    renderInventory();
  }
  if (e.code === "Space") {
    // Cast on short press (keyup). Long press (>1s) should NOT cast.
    e.preventDefault();
    if (codeTypingLock) return;
    if (!spacePress.active && !e.repeat) {
      spacePress.active = true;
      spacePress.downAt = performance.now();
    }
  }
  if (e.code === "Escape" && fishingState !== "idle") {
    e.preventDefault();
    resetFishing();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
  if (e.code === "Space") {
    if (!spacePress.active) return;
    spacePress.active = false;
    if (codeTypingLock) return;
    if (fishingState !== "idle") return;
    if (illusionTeleportAnim) return;
    const heldMs = performance.now() - spacePress.downAt;
    if (heldMs <= 1000) {
      if (isInSunstrikeCave(player.x, player.y)) {
        beginIllusionEnterFromSunstrike();
        return;
      }
      if (isInIllusionReturnCave(player.x, player.y)) {
        beginIllusionExitToSunstrike();
        return;
      }
      if (isNearIllusionEnchanter(player.x, player.y)) {
        openIllusionEnchantPanel();
        return;
      }
      if (isNearGhostCrafter(player.x, player.y)) {
        openGhostCrafterPanel();
        return;
      }
      if (isNearRelicSeller(player.x, player.y)) {
        openRelicSellerPanel();
        return;
      }
      // NPC interaction takes priority over casting (Meme Crafter on April Fools island first).
      if (isNearMemeCrafter(player.x, player.y)) {
        openMemeCraftingPanel();
      } else if (isNearCraftNpc(player.x, player.y)) {
        openCraftingPanel();
      } else {
        tryStartFishing();
      }
    }
  }
});

let mouseDown = false;
let spacePress = { active: false, downAt: 0 };
window.addEventListener("mousedown", (e) => {
  if (e.button === 0) mouseDown = true;
});
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (codeTypingLock) return;
  tryUseStormRelicAtClick();
  tryUseTitanRelicAtClick(e.clientX, e.clientY);
});
window.addEventListener("mouseup", (e) => {
  if (e.button === 0) mouseDown = false;
});
window.addEventListener("blur", () => {
  mouseDown = false;
  spacePress.active = false;
});

function isRodEquipped(item) {
  return item && ROD_IDS.has(item.id);
}

function tryStartFishing() {
  if (gameState !== "playing") return;
  if (!equippedRodId || !ROD_STATS[equippedRodId]) return;
  if (!hasAnyInventorySpace()) return;
  activeRodStats = getRodStats({ id: equippedRodId });
  const cp = getCastPoint();
  castPoint.x = cp.x;
  castPoint.y = cp.y;
  const cast = getCastFishingZone(castPoint.x, castPoint.y);
  if (!cast) return;
  if (equippedRodId === "gunRod" && countGunBulletsTotal() < 1) return;
  lastFishingIslandKind = cast.island?.kind ?? null;
  const homeIsland = islandAtPoint(player.x, player.y);
  const onGarbageIsland = homeIsland?.kind === "garbage";
  const onTitanInfected = isTitanInfectedWaterAt(castPoint.x, castPoint.y);

  // Garbage rod only fishes garbage at the Garbage island.
  if (equippedRodId === "garbageRod") {
    if (cast.zone !== "ocean" || !onGarbageIsland) return;
    pendingFishId = Math.random() < 1 / 8 ? "plasticBottle" : "metalSheet";
    pendingTropical = null;
    pendingRodDrop = null;
  } else if (onTitanInfected) {
    pendingFishId = rollTitanInfectionFish();
    pendingTropical = null;
    pendingRodDrop = null;
  } else if (cast.zone === "ocean" && cast.island.kind === "tropico") {
    // Tropico ocean loot table
    if (Math.random() < 1 / 50) pendingFishId = "barracuda";
    else if (Math.random() < 1 / 10) pendingFishId = "forestTurtle";
    else if (Math.random() < 1 / 5) pendingFishId = "blueTang";
    else pendingFishId = Math.random() < 1 / 3 ? "electricalEel" : "forestFish";
    pendingTropical = null;
  } else if (cast.zone === "ocean" && cast.island.kind === "wild") {
    pendingFishId = rollWildOceanFish();
    pendingTropical = null;
    pendingRodDrop = null;
  } else if (cast.zone === "ocean" && cast.island.kind === "grandReef") {
    const rolled = rollOceanFishWithLuck();
    if (rolled === "tropical") {
      const v = rollTropicalVariant();
      pendingFishId = v.fishId;
      pendingTropical = v;
    } else {
      pendingFishId = rolled;
      pendingTropical = null;
    }
    pendingRodDrop = null;
  } else {
    // Other islands do not use the Grand Reef loot table.
    if (cast.zone === "ocean" && cast.island.kind === "aprilFools") {
      pendingFishId = rollAprilFoolsEventFish();
      pendingTropical = null;
      pendingRodDrop = null;
    } else if (cast.zone === "ocean" && cast.island.kind === "sunstrike") {
      pendingFishId = rollSunstrikeOceanFish();
      pendingTropical = null;
      pendingRodDrop = null;
    } else if (cast.zone === "ocean" && cast.island.kind === "illusion") {
      pendingFishId = cast.illusionPurplePond ? rollIllusionOceanFish() : rollWildOceanFish();
      pendingTropical = null;
      pendingRodDrop = null;
    } else if (cast.zone === "ocean" && cast.island.kind === "craft") {
      // No special loot table.
      pendingFishId = rollPoolFish();
      pendingTropical = null;
      pendingRodDrop = null;
    } else if (cast.zone === "ocean" && (cast.island.kind === "garbage" || onGarbageIsland)) {
      pendingFishId =
        Math.random() < 1 / 8 ? "plasticBottle" : Math.random() < 1 / 5 ? "metalSheet" : "garbageFish";
      pendingTropical = null;
      if (!ownsGarbageRod()) {
        // 1/10 base chance with 20-attempt pity (guarantee on 20th eligible attempt)
        const guarantee = garbageRodPity >= 19;
        pendingRodDrop = guarantee || Math.random() < 1 / 10 ? "garbageRod" : null;
        garbageRodPity++;
      } else {
        pendingRodDrop = null;
        garbageRodPity = 0;
      }
    } else if (cast.zone === "ocean" && cast.island.kind === "barren") {
      return;
    } else {
      pendingFishId = rollPoolFish();
      pendingTropical = null;
      pendingRodDrop = null;
    }
  }

  if (equippedRodId === "gunRod") {
    if (!consumeOneGunBullet()) return;
    minigame = {
      fishId: pendingFishId,
      tropicalItemId: pendingTropical?.itemId ?? null,
      tropicalColor: pendingTropical?.color ?? null,
    };
    endFishingSuccess();
    return;
  }

  fishingState = "hooking";
  hookElapsed = 0;
  hookDuration = hookDurationSeconds(netProgressForFish(pendingFishId));
  const lureBonus = getRodStats({ id: equippedRodId })?.lureSpeedBonus || 0;
  hookDuration = hookDuration / (1 + Math.max(0, lureBonus));
  fishingPanel.classList.remove("hidden");
  hookPhase.classList.remove("hidden");
  minigamePhase.classList.add("hidden");
  hookFill.style.width = "0%";
}

function startMinigame() {
  fishingState = "minigame";
  hookPhase.classList.add("hidden");
  minigamePhase.classList.remove("hidden");

  const rs = activeRodStats;
  const fd = fishDefForMinigameId(pendingFishId);
  const zonePct = rs.zoneWidthPercent;
  fishZone.style.width = `${zonePct}%`;
  minigameTitleEl.textContent = fd.minigameTitle;

  minigame = {
    fishId: pendingFishId,
    zoneLeftPct: 50 - zonePct / 2,
    fishPosPct: 50,
    fishDir: Math.random() < 0.5 ? 1 : -1,
    catchPct: 20,
    trackWidthPx: 0,
    fillSeconds: rs.catchBarFillSeconds,
    zonePct,
    rapDirTimer: 0,
    tropicalColor: pendingTropical?.color,
    tropicalItemId: pendingTropical?.itemId,
    pufferState: {
      mode: "dash",
      pauseT: 0,
      targetPct: 50,
    },
    shockAccT: 0,
    stunT: 0,
    sharkAccT: 0,
    ghostInvisT: 0,
    ghostInvisAcc: 0,
    anglerDecoyT: 0,
    anglerDecoyAcc: 0,
    anglerDecoyPctA: 50,
    anglerDecoyPctB: 50,
  };
  catchMeterFill.style.width = "20%";
  catchMeterFill.style.background = "linear-gradient(90deg, #2ecc71, #58d68d)";
  requestAnimationFrame(() => {
    minigame.trackWidthPx = fishTrack.clientWidth || 400;
    redrawFishMinigame();
  });
}

function redrawFishMinigame() {
  if (!minnowMinigameCanvas || !minigame) return;
  const c = minnowMinigameCanvas.getContext("2d");
  const id = minigame.fishId;
  const anglerDecoy =
    (id === "anglerfish" || id === "anglerShark") && (minigame.anglerDecoyT || 0) > 0;
  const ghostHide = id === "ghostFish" && (minigame.ghostInvisT || 0) > 0;

  if (anglerDecoy) {
    const tw = Math.max(1, Math.floor(fishTrack.clientWidth || 400));
    if (minnowMinigameCanvas.width !== tw) {
      minnowMinigameCanvas.width = tw;
      minnowMinigameCanvas.height = 36;
    }
    minnowMinigameCanvas.style.left = "0";
    minnowMinigameCanvas.style.width = "100%";
    minnowMinigameCanvas.style.top = "50%";
    minnowMinigameCanvas.style.transform = "translateY(-50%)";
  } else {
    if (minnowMinigameCanvas.width !== 48) {
      minnowMinigameCanvas.width = 48;
      minnowMinigameCanvas.height = 36;
    }
    minnowMinigameCanvas.style.left = `${minigame.fishPosPct}%`;
    minnowMinigameCanvas.style.width = "";
    minnowMinigameCanvas.style.top = "50%";
    minnowMinigameCanvas.style.transform = "translate(-50%, -50%)";
  }

  const w = minnowMinigameCanvas.width;
  const h = minnowMinigameCanvas.height;
  c.clearRect(0, 0, w, h);
  const sc = Math.min(w, h) / 30;

  if (anglerDecoy) {
    drawAnglerDecoyLures(c, w, h, [minigame.anglerDecoyPctA, minigame.anglerDecoyPctB, minigame.fishPosPct]);
    return;
  }
  if (id === "cod") drawCodModel(c, w / 2, h / 2, sc, false);
  else if (id === "rapFish") drawRapModel(c, w / 2, h / 2, sc, false);
  else if (id === "pufferfish") drawPufferModel(c, w / 2, h / 2, sc, false);
  else if (id === "blueTang") drawBlueTangModel(c, w / 2, h / 2, sc, false);
  else if (id === "poolShark") drawPoolSharkModel(c, w / 2, h / 2, sc, false);
  else if (id === "barracuda") drawBarracudaModel(c, w / 2, h / 2, sc, false);
  else if (id === "electricalEel") drawElectricalEelModel(c, w / 2, h / 2, sc, false);
  else if (id === "forestTurtle") drawForestTurtleModel(c, w / 2, h / 2, sc, false);
  else if (id === "lusca") drawLuscaModel(c, w / 2, h / 2, sc, false);
  else if (id === "flyingFish") drawFlyingFishModel(c, w / 2, h / 2, sc, false);
  else if (id === "clownfish") drawClownfishModel(c, w / 2, h / 2, sc, false);
  else if (id === "sunTang") drawSunTangModel(c, w / 2, h / 2, sc, false);
  else if (id === "parrotFish") drawParrotFishModel(c, w / 2, h / 2, sc, false);
  else if (id === "reefShark") drawReefSharkModel(c, w / 2, h / 2, sc, false);
  else if (id === "foolFish") drawFoolFishModel(c, w / 2, h / 2, sc, false);
  else if (id === "gagFish") drawGagFishModel(c, w / 2, h / 2, sc, false);
  else if (id === "shark67") drawShark67Model(c, w / 2, h / 2, sc, false);
  else if (id === "ghostFish") {
    if (ghostHide) {
      c.fillStyle = "rgba(200,220,255,0.55)";
      c.font = "bold 14px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("?", w / 2, h / 2);
    } else {
      drawGhostFishModel(c, w / 2, h / 2, sc, false);
    }
  } else if (id === "ghostBarracuda") {
    c.save();
    c.globalAlpha = 0.52;
    drawBarracudaModel(c, w / 2, h / 2, sc, false);
    c.restore();
  } else if (id === "anglerfish") drawAnglerfishModel(c, w / 2, h / 2, sc, false);
  else if (id === "redCrab") drawRedCrabModel(c, w / 2, h / 2, sc, false);
  else if (id === "titanPrawn") drawTitanPrawnModel(c, w / 2, h / 2, sc, false);
  else if (id === "giantCatShark") drawGiantCatSharkModel(c, w / 2, h / 2, sc, false);
  else if (id === "hyperliosisPoolShark") drawHyperliosisPoolSharkModel(c, w / 2, h / 2, sc, false);
  else if (id === "anglerShark") drawAnglerSharkModel(c, w / 2, h / 2, sc, false);
  else if (id === "herring") drawHerringModel(c, w / 2, h / 2, sc, false);
  else if (id === "metalSheet") drawMetalSheetModel(c, w / 2, h / 2, sc, false);
  else if (id === "garbageFish") drawGarbageFishModel(c, w / 2, h / 2, sc, false);
  else if (id === "plasticBottle") drawPlasticBottleModel(c, w / 2, h / 2, sc, false);
  else if (id === "tropical" || id === "tropicalPurple") drawTropicalModel(c, w / 2, h / 2, sc, false, minigame?.tropicalColor || "orange");
  else if (id === "forestFish") drawForestFishModel(c, w / 2, h / 2, sc, false);
  else drawMinnowModel(c, w / 2, h / 2, sc, false);
}

function endFishingSuccess() {
  if (pendingRodDrop === "garbageRod" && !ownsGarbageRod()) {
    ownedRods.add("garbageRod");
    equippedRodId = "garbageRod";
    garbageRodPity = 0;
    holdRod();
    renderRodSlot();
    renderRods();
    saveGame();
    resetFishing();
    pendingRodDrop = null;
    return;
  }
  const fid = minigame?.fishId || pendingFishId;
  const item =
    fid === "cod"
      ? ITEMS.cod
      : fid === "rapFish"
        ? ITEMS.rapFish
        : fid === "pufferfish"
          ? ITEMS.pufferfish
          : fid === "blueTang"
            ? ITEMS.blueTang
          : fid === "poolShark"
            ? ITEMS.poolShark
          : fid === "barracuda"
            ? ITEMS.barracuda
          : fid === "electricalEel"
            ? ITEMS.electricalEel
            : fid === "forestTurtle"
              ? ITEMS.forestTurtle
              : fid === "lusca"
                ? ITEMS.lusca
                : fid === "flyingFish"
                  ? ITEMS.flyingFish
                  : fid === "clownfish"
                    ? ITEMS.clownfish
                    : fid === "sunTang"
                      ? ITEMS.sunTang
                      : fid === "parrotFish"
                        ? ITEMS.parrotFish
                        : fid === "reefShark"
                          ? ITEMS.reefShark
                          : fid === "foolFish"
                            ? ITEMS.foolFish
                            : fid === "gagFish"
                              ? ITEMS.gagFish
                              : fid === "shark67"
                                ? ITEMS.shark67
                                : fid === "ghostFish"
                                  ? ITEMS.ghostFish
                                  : fid === "ghostBarracuda"
                                    ? ITEMS.ghostBarracuda
                                    : fid === "anglerfish"
                                      ? ITEMS.anglerfish
                                      : fid === "redCrab"
                                        ? ITEMS.redCrab
                                        : fid === "titanPrawn"
                                          ? ITEMS.titanPrawn
                                          : fid === "giantCatShark"
                                            ? ITEMS.giantCatShark
                                            : fid === "hyperliosisPoolShark"
                                              ? ITEMS.hyperliosisPoolShark
                                              : fid === "anglerShark"
                                                ? ITEMS.anglerShark
                                                : fid === "herring"
                                                  ? ITEMS.herring
                                                  : fid === "metalSheet"
                                                    ? ITEMS.metalSheet
                                                    : fid === "garbageFish"
                                                      ? ITEMS.garbageFish
                                                      : fid === "plasticBottle"
                                                        ? ITEMS.plasticBottle
                                                      : fid === "tropicalPurple"
                                                        ? ITEMS.tropicalPurple
                                                        : fid === "tropical"
                                                          ? ITEMS[minigame?.tropicalItemId || "tropicalOrange"]
                                                          : fid === "forestFish"
                                                            ? ITEMS.forestFish
                                                            : ITEMS.minnow;
  const fishId = item.id;
  const newFish = {
    ...item,
    uid: newUid(),
    weightG: rollFishWeightG(fishId),
    gold: isGoldMutation(),
    forestMut: false,
    lightningMut: false,
    foolsMut: false,
  };
  const rs = getRodStats({ id: equippedRodId });
  if (equippedRodId === "forestRod" && Math.random() < (rs.forestMutationChance || 0.4)) {
    newFish.forestMut = true;
  }
  if (equippedRodId === "liarRod" && FISH_ITEM_IDS.has(fishId)) {
    newFish.foolsMut = true;
  }
  if (stormActive && Math.random() < 0.1) {
    newFish.lightningMut = true;
  }
  // Garbage rod bonus: 1/4 chance to find $20 (instant cash)
  if (equippedRodId === "garbageRod" && fishId === "metalSheet") {
    if (Math.random() < 1 / 4) {
      money += 20;
      updateMoneyHud();
    }
  }
  if (!addItem(newFish)) {
    /* */
  }
  if (isAprilFoolsWeekActive() && lastFishingIslandKind === "aprilFools") {
    aprilFoolsTokens += 1;
    updateAfTokensHud();
  }
  markCaught(fid);
  renderInventory();
  renderBackpackGrid();
  saveGame();
  resetFishing();
  pendingRodDrop = null;
}

function endFishingFail() {
  resetFishing();
}

function resetFishing() {
  fishingState = "idle";
  fishingPanel.classList.add("hidden");
  hookPhase.classList.add("hidden");
  minigamePhase.classList.add("hidden");
  minigame = null;
}

function updateHooking(dt) {
  hookElapsed += dt;
  const t = Math.min(1, hookElapsed / hookDuration);
  hookFill.style.width = `${t * 100}%`;
  if (hookElapsed >= hookDuration) {
    startMinigame();
  }
}

function updateMinigame(dt) {
  if (!minigame) return;
  minigame.trackWidthPx = minigame.trackWidthPx || fishTrack.clientWidth || 400;

  const rs = activeRodStats;
  const fd = fishDefForMinigameId(minigame.fishId);
  const baseSpeed = 0.1 * rs.zoneWidthPercent;

  if (minigame.fishId === "pufferfish" || minigame.fishId === "poolShark" || minigame.fishId === "blueTang") {
    const st = minigame.pufferState;
    if (st.mode === "pause") {
      st.pauseT += dt;
      if (st.pauseT >= (fd.dashPauseSeconds || 0.5)) {
        st.pauseT = 0;
        st.mode = "dash";
        st.targetPct = 8 + Math.random() * 84;
      }
    } else {
      const target = st.targetPct ?? (8 + Math.random() * 84);
      st.targetPct = target;
      const dir = target >= minigame.fishPosPct ? 1 : -1;
      minigame.fishPosPct += dir * fd.barPctPerSec * dt;
      if (Math.abs(minigame.fishPosPct - target) < 1.2) {
        minigame.fishPosPct = target;
        st.mode = "pause";
        st.pauseT = 0;
      }
    }
    if (minigame.fishPosPct <= 7) minigame.fishPosPct = 7;
    if (minigame.fishPosPct >= 93) minigame.fishPosPct = 93;
  } else if (fd.randomDir) {
    minigame.fishPosPct += minigame.fishDir * fd.barPctPerSec * dt;
    minigame.rapDirTimer += dt;
    if (minigame.rapDirTimer > 0.25 + Math.random() * 0.35) {
      minigame.rapDirTimer = 0;
      minigame.fishDir = Math.random() < 0.5 ? 1 : -1;
    }
    if (Math.random() < 0.08 * dt * 60) {
      minigame.fishDir *= -1;
    }
    if (minigame.fishPosPct <= 7) minigame.fishDir = 1;
    if (minigame.fishPosPct >= 93) minigame.fishDir = -1;
  } else {
    const spd = baseSpeed * (fd.speedMult || 1);
    minigame.fishPosPct += minigame.fishDir * spd * dt;
    if (minigame.fishPosPct <= 8) minigame.fishDir = 1;
    if (minigame.fishPosPct >= 92) minigame.fishDir = -1;
  }

  if (minigame.fishPosPct < 5) minigame.fishPosPct = 5;
  if (minigame.fishPosPct > 95) minigame.fishPosPct = 95;

  if (minigame.fishId === "ghostFish") {
    minigame.ghostInvisT = Math.max(0, (minigame.ghostInvisT || 0) - dt);
    minigame.ghostInvisAcc = (minigame.ghostInvisAcc || 0) + dt;
    while (minigame.ghostInvisAcc >= 1) {
      minigame.ghostInvisAcc -= 1;
      if (Math.random() < (fd.ghostInvisChancePerSecond ?? 0.1)) {
        minigame.ghostInvisT = fd.ghostInvisDurationSec ?? 1;
      }
    }
  }
  if (minigame.fishId === "anglerfish" || minigame.fishId === "anglerShark") {
    minigame.anglerDecoyT = Math.max(0, (minigame.anglerDecoyT || 0) - dt);
    minigame.anglerDecoyAcc = (minigame.anglerDecoyAcc || 0) + dt;
    while (minigame.anglerDecoyAcc >= 1) {
      minigame.anglerDecoyAcc -= 1;
      if (Math.random() < (fd.anglerDecoyChancePerSecond ?? 0.1)) {
        minigame.anglerDecoyT = fd.anglerDecoyDurationSec ?? 1;
        minigame.anglerDecoyPctA = 15 + Math.random() * 70;
        minigame.anglerDecoyPctB = 15 + Math.random() * 70;
      }
    }
    if ((minigame.anglerDecoyT || 0) > 0) {
      minigame.anglerDecoyPctA += (Math.random() - 0.5) * 42 * dt;
      minigame.anglerDecoyPctB += (Math.random() - 0.5) * 42 * dt;
      minigame.anglerDecoyPctA = Math.max(8, Math.min(92, minigame.anglerDecoyPctA));
      minigame.anglerDecoyPctB = Math.max(8, Math.min(92, minigame.anglerDecoyPctB));
    }
  }

  const zoneMovePctPerSec = 45;
  if (mouseDown) minigame.zoneLeftPct += zoneMovePctPerSec * dt;
  else minigame.zoneLeftPct -= zoneMovePctPerSec * dt;

  minigame.zoneLeftPct = Math.max(0, Math.min(100 - rs.zoneWidthPercent, minigame.zoneLeftPct));

  const zl = minigame.zoneLeftPct;
  const zr = zl + rs.zoneWidthPercent;
  const fishInZone = minigame.fishPosPct >= zl && minigame.fishPosPct <= zr;

  const netProg = netProgressForFish(minigame.fishId);
  const progressSpeedMult = Math.max(0.05, 1 + netProg / 100);
  const fillPerSec = (100 / minigame.fillSeconds) * progressSpeedMult;
  const drainPerSec = 18;

  // Electrical eel shock: 10% chance per second to stun filling for 1 second.
  if (minigame.fishId === "electricalEel") {
    minigame.shockAccT += dt;
    while (minigame.shockAccT >= 1) {
      minigame.shockAccT -= 1;
      if (Math.random() < (fd.shockChancePerSecond || 0.1)) {
        minigame.stunT = Math.max(minigame.stunT, fd.shockStunSeconds || 1);
      }
    }
  }
  if (minigame.stunT > 0) minigame.stunT = Math.max(0, minigame.stunT - dt);

  // Shark rod bonus: 20% chance per second to add +15% catch.
  if (equippedRodId === "sharkRod") {
    const rs2 = getRodStats({ id: equippedRodId });
    minigame.sharkAccT += dt;
    while (minigame.sharkAccT >= 1) {
      minigame.sharkAccT -= 1;
      if (Math.random() < (rs2.sharkBonusChancePerSecond || 0.2)) {
        minigame.catchPct += rs2.sharkBonusCatchPct || 15;
      }
    }
  }

  const rod67FillMult =
    equippedRodId === "rod67" ? 1 + (getRodStats({ id: equippedRodId }).lureSpeedBonus || 0) : 1;

  if (fishInZone) {
    if (minigame.stunT <= 0) minigame.catchPct += fillPerSec * rod67FillMult * dt;
  } else {
    minigame.catchPct -= drainPerSec * dt;
  }
  minigame.catchPct = Math.max(0, Math.min(100, minigame.catchPct));

  fishZone.style.left = `${minigame.zoneLeftPct}%`;
  catchMeterFill.style.width = `${minigame.catchPct}%`;
  if (minigame.stunT > 0) {
    catchMeterFill.style.background = "linear-gradient(90deg, #9e9e9e, #cfcfcf)";
  } else {
    catchMeterFill.style.background = "linear-gradient(90deg, #2ecc71, #58d68d)";
  }

  redrawFishMinigame();

  if (minigame.catchPct <= 0) {
    endFishingFail();
    return;
  }
  if (minigame.catchPct >= 100) {
    endFishingSuccess();
  }
}

function tileHash(tx, ty) {
  let h = tx * 374761393 + ty * 668265263;
  h = (h ^ (h >> 13)) >>> 0;
  h = Math.imul(h, 1274126177);
  return (h >>> 0) / 4294967296;
}

// Tile sprite cache: drastically reduces per-frame draw cost.
const tileSpriteCache = new Map();

function getTileVariant(tx, ty) {
  // Bucket noise into a small set of variants to improve cache hits.
  return (tileHash(tx, ty) * 8) | 0; // 0..7
}

function tileCacheKey(type, variant) {
  return `${type}:${variant}`;
}

function makeTileSprite(type, variant) {
  const c = document.createElement("canvas");
  c.width = TILE_SIZE;
  c.height = TILE_SIZE;
  const g = c.getContext("2d");

  const base = TILE_BASE[type] || { r: 60, g: 60, b: 60 };
  const pat = (variant + 1) / 9;
  const v = (pat - 0.5) * 18;
  const r = Math.max(0, Math.min(255, base.r + v));
  const gg = Math.max(0, Math.min(255, base.g + v * 0.7));
  const b = Math.max(0, Math.min(255, base.b + v * 0.6));

  g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
  g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  // Cheap textures (no save/clip per tile).
  if (type === TILE.LAKE) {
    g.strokeStyle = `rgba(140,200,255,${0.12 + pat * 0.08})`;
    g.beginPath();
    g.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.45, TILE_SIZE * (0.22 + pat * 0.06), 0, Math.PI * 2);
    g.stroke();
  } else if (type === TILE.DARK_POOL) {
    g.strokeStyle = `rgba(30,80,160,${0.15 + pat * 0.1})`;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.arc(
        TILE_SIZE * (0.2 + pat * 0.5) + i * 8,
        TILE_SIZE * (0.3 + i * 0.1),
        TILE_SIZE * (0.15 + pat * 0.05),
        0,
        Math.PI * 2
      );
      g.stroke();
    }
  } else if (type === TILE.DEEP_OCEAN || type === TILE.SHALLOW_OCEAN) {
    g.strokeStyle = `rgba(255,255,255,${0.04 + pat * 0.06})`;
    g.lineWidth = 1;
    for (let i = -1; i < 3; i++) {
      const off = (pat + i * 0.31) * TILE_SIZE;
      g.beginPath();
      g.moveTo(off, 0);
      g.lineTo(off - TILE_SIZE * 0.4, TILE_SIZE);
      g.stroke();
    }
  } else if (type === TILE.SAND) {
    for (let n = 0; n < 6; n++) {
      const lx = ((pat * 997 * (n + 1)) % 0.92) * TILE_SIZE;
      const ly = ((pat * 613 * (n + 2)) % 0.88) * TILE_SIZE;
      g.fillStyle = `rgba(160,130,90,${0.12 + (n % 3) * 0.06})`;
      g.fillRect(lx, ly, 2, 2);
    }
  } else if (type === TILE.DESERT || type === TILE.CACTUS) {
    for (let n = 0; n < 7; n++) {
      const lx = ((pat * 877 * (n + 2)) % 0.92) * TILE_SIZE;
      const ly = ((pat * 733 * (n + 3)) % 0.88) * TILE_SIZE;
      g.fillStyle = `rgba(160,140,90,${0.10 + (n % 3) * 0.06})`;
      g.fillRect(lx, ly, 2, 2);
    }
    g.strokeStyle = `rgba(255,255,255,${0.03 + pat * 0.03})`;
    g.beginPath();
    g.moveTo(TILE_SIZE * 0.15, TILE_SIZE * 0.75);
    g.lineTo(TILE_SIZE * 0.85, TILE_SIZE * 0.6);
    g.stroke();
  } else if (type === TILE.MOUNTAIN) {
    g.fillStyle = `rgba(255,255,255,${0.06 + pat * 0.06})`;
    g.beginPath();
    g.moveTo(TILE_SIZE * 0.15, TILE_SIZE * 0.78);
    g.lineTo(TILE_SIZE * 0.5, TILE_SIZE * 0.22);
    g.lineTo(TILE_SIZE * 0.85, TILE_SIZE * 0.78);
    g.closePath();
    g.fill();
    g.strokeStyle = `rgba(0,0,0,${0.18 + pat * 0.1})`;
    g.stroke();
  } else if (type === TILE.CAVE) {
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.beginPath();
    g.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.62, TILE_SIZE * 0.28, Math.PI, Math.PI * 2);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.10)";
    g.stroke();
  } else if (type === TILE.FOREST) {
    g.strokeStyle = `rgba(10,40,20,${0.12 + pat * 0.12})`;
    for (let gx = 0; gx < 6; gx++) {
      const x0 = gx * 6 + ((pat * 7) % 4);
      g.beginPath();
      g.moveTo(x0, TILE_SIZE);
      g.lineTo(x0 + 2 + ((pat * 3) % 2), pat * 4);
      g.stroke();
    }
  } else if (type === TILE.APRIL_FOOLS_GRASS) {
    const cols = ["#ffeb3b", "#42a5f5", "#ff7043", "#69f0ae", "#e040fb", "#fff176"];
    for (let n = 0; n < 8; n++) {
      const lx = ((pat * 197 * (n + 3)) % 0.92) * TILE_SIZE;
      const ly = ((pat * 313 * (n + 5)) % 0.88) * TILE_SIZE;
      g.fillStyle = cols[n % cols.length];
      g.fillRect(lx, ly, 2, 2);
    }
    g.strokeStyle = `rgba(255,255,255,${0.05 + pat * 0.05})`;
    g.beginPath();
    g.moveTo(TILE_SIZE * 0.1, TILE_SIZE * 0.85);
    g.lineTo(TILE_SIZE * 0.9, TILE_SIZE * 0.75);
    g.stroke();
  } else if (type === TILE.GRASS || type === TILE.TREE) {
    g.strokeStyle = `rgba(40,80,40,${0.08 + pat * 0.1})`;
    for (let gx = 0; gx < 4; gx++) {
      const x0 = gx * 9 + ((pat * 7) % 5);
      g.beginPath();
      g.moveTo(x0, TILE_SIZE);
      g.lineTo(x0 + 3 + ((pat * 4) % 3), pat * 6);
      g.stroke();
    }
  } else if (type === TILE.ILLUSION_WATER) {
    g.strokeStyle = `rgba(230,170,255,${0.1 + pat * 0.1})`;
    g.lineWidth = 1;
    for (let i = -1; i < 3; i++) {
      const off = (pat + i * 0.31) * TILE_SIZE;
      g.beginPath();
      g.moveTo(off, 0);
      g.lineTo(off - TILE_SIZE * 0.35, TILE_SIZE);
      g.stroke();
    }
  } else if (type === TILE.ILLUSION_LAND) {
    for (let n = 0; n < 9; n++) {
      const lx = ((pat * 197 * (n + 3)) % 0.92) * TILE_SIZE;
      const ly = ((pat * 313 * (n + 5)) % 0.88) * TILE_SIZE;
      g.fillStyle = `rgba(130,35,170,${0.1 + (n % 3) * 0.06})`;
      g.fillRect(lx, ly, 2, 2);
    }
  } else if (type === TILE.ILLUSION_CAVE_EXIT || type === TILE.ILLUSION_PORTAL) {
    const baseR = 110 + pat * 25;
    const baseG = 38 + pat * 12;
    const baseB = 155 + pat * 28;
    g.fillStyle = `rgb(${baseR | 0},${baseG | 0},${baseB | 0})`;
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.fillStyle = `rgba(255,255,255,${0.12 + pat * 0.06})`;
    g.fillRect(TILE_SIZE * 0.12, TILE_SIZE * 0.18, TILE_SIZE * 0.76, TILE_SIZE * 0.52);
  }

  // subtle border
  g.strokeStyle = "rgba(0,0,0,0.06)";
  g.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  return c;
}

function getTileSprite(type, tx, ty) {
  const variant = getTileVariant(tx, ty);
  const key = tileCacheKey(type, variant);
  let sprite = tileSpriteCache.get(key);
  if (!sprite) {
    sprite = makeTileSprite(type, variant);
    tileSpriteCache.set(key, sprite);
  }
  return sprite;
}

const TILE_BASE = {
  [TILE.DEEP_OCEAN]: { r: 32, g: 92, b: 118 },
  [TILE.SHALLOW_OCEAN]: { r: 126, g: 206, b: 232 },
  [TILE.SAND]: { r: 196, g: 176, b: 138 },
  [TILE.GRASS]: { r: 88, g: 142, b: 86 },
  [TILE.POND]: { r: 58, g: 118, b: 158 },
  [TILE.TREE]: { r: 88, g: 142, b: 86 },
  [TILE.DARK_POOL]: { r: 12, g: 40, b: 92 },
  [TILE.FOREST]: { r: 28, g: 92, b: 56 },
  [TILE.LAKE]: { r: 18, g: 55, b: 120 },
  [TILE.DESERT]: { r: 214, g: 194, b: 128 },
  [TILE.CACTUS]: { r: 214, g: 194, b: 128 },
  [TILE.MOUNTAIN]: { r: 128, g: 120, b: 118 },
  [TILE.CAVE]: { r: 70, g: 66, b: 64 },
  [TILE.APRIL_FOOLS_GRASS]: { r: 168, g: 62, b: 132 },
  [TILE.ILLUSION_LAND]: { r: 52, g: 16, b: 68 },
  [TILE.ILLUSION_WATER]: { r: 76, g: 20, b: 96 },
  [TILE.ILLUSION_CAVE_EXIT]: { r: 110, g: 44, b: 160 },
  [TILE.ILLUSION_PORTAL]: { r: 110, g: 44, b: 160 },
};

function drawTileTexture(wx, wy, type, tx, ty) {
  const sprite = getTileSprite(type, tx, ty);
  ctx.drawImage(sprite, wx, wy);
}

function drawTreeSprite(wx, wy, tx, ty) {
  const h = tileHash(tx, ty);
  const cx = wx + TILE_SIZE / 2;
  const cy = wy + TILE_SIZE / 2 + 4;
  ctx.fillStyle = `rgb(${46 + h * 15},${90 + h * 10},${44 + h * 8})`;
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 12 + h * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(cx - 3, cy + 2, 6, 8);
}

function drawCactusSprite(wx, wy, tx, ty) {
  const h = tileHash(tx, ty);
  const cx = wx + TILE_SIZE / 2;
  const cy = wy + TILE_SIZE / 2 + 6;
  const tall = 14 + h * 6;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = `rgb(${20 + h * 10},${120 + h * 40},${60 + h * 10})`;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1.2;
  // body
  ctx.beginPath();
  ctx.roundRect(-4, -tall, 8, tall + 2, 4);
  ctx.fill();
  ctx.stroke();
  // arms
  ctx.beginPath();
  ctx.roundRect(-10, -tall * 0.65, 6, 10, 3);
  ctx.roundRect(4, -tall * 0.5, 6, 9, 3);
  ctx.fill();
  ctx.stroke();
  // tiny spines
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-2 + (i % 2), -tall + 2 + i * 3);
    ctx.lineTo(2 + (i % 2), -tall + 2 + i * 3);
    ctx.stroke();
  }
  ctx.restore();
}

function respawnAfterDrown() {
  // Keep all progress; lose ~5% cash.
  money = Math.floor(money * 0.95);
  updateMoneyHud();

  gameState = "playing";
  waterTimer = 0;
  gameOverEl.classList.add("hidden");
  drownWarningEl.classList.add("hidden");
  fishingState = "idle";
  resetFishing();
  closeAllUiPanels();

  // Respawn on Grand Reef land.
  player.x = 0;
  player.y = -ISLAND_HALF_PX * 0.75;
  player.facing.x = 0;
  player.facing.y = 1;

  holdRod();
  renderInventory();
  renderBackpackGrid();
  renderRodSlot();
  saveGame();
}

let last = performance.now();
let saveAccum = 0;
function frame(now) {
  refreshAprilFoolsIsland();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (gameState === "playing") {
    pruneTitanInfections();
    // Day/Night cycle (toggles every 10 minutes)
    phaseTimer += dt;
    if (phaseTimer >= DAY_NIGHT_PHASE_SECONDS) {
      phaseTimer = phaseTimer % DAY_NIGHT_PHASE_SECONDS;
      isNight = !isNight;
    }

    // Storm scheduler: every 7–12 minutes, lasts 3 minutes.
    if (!stormActive) {
      nextStormIn -= dt;
      if (nextStormIn <= 0) {
        stormActive = true;
        stormTimer = 0;
        // next storm is scheduled after this one ends
      }
    } else {
      stormTimer += dt;
      // occasional lightning flash
      if (Math.random() < 0.03 * dt * 60) lightningFlashT = 0.18;
      lightningFlashT = Math.max(0, lightningFlashT - dt);
      if (stormTimer >= 180) {
        stormActive = false;
        stormTimer = 0;
        nextStormIn = 7 * 60 + Math.random() * (5 * 60);
        lightningFlashT = 0;
      }
    }

    saveAccum += dt;
    if (saveAccum >= 1.5) {
      saveAccum = 0;
      saveGame();
    }
    if (anyInventoryHasHackedFish()) {
      hackedInventoryAnimAcc += dt;
      if (hackedInventoryAnimAcc >= 0.07) {
        hackedInventoryAnimAcc = 0;
        renderInventory();
        renderBackpackGrid();
      }
    } else {
      hackedInventoryAnimAcc = 0;
    }
    if (fishingState === "hooking") updateHooking(dt);
    else if (fishingState === "minigame") updateMinigame(dt);

    tickIllusionTeleportBlur();

    const mv = movementVector();
    if (fishingState === "idle" && !illusionTeleportAnim) {
      const inWater = isWaterTile(player.x, player.y);
      onBoat = ownedBoat && inWater;
      const speedMult = onBoat ? 2.2 : 1;
      player.x += mv.x * player.speed * speedMult * dt;
      player.y += mv.y * player.speed * speedMult * dt;
      if (Math.hypot(mv.x, mv.y) > 0.01) {
        player.facing.x = mv.x;
        player.facing.y = mv.y;
      }
    }

    // Drowning: disabled while on a boat.
    if (onBoat) {
      waterTimer = 0;
      drownWarningEl.classList.add("hidden");
    } else if (isDrowningWater(player.x, player.y)) {
      waterTimer += dt;
      if (waterTimer >= DROWN_SECONDS) {
        gameState = "drowned";
        gameOverEl.classList.remove("hidden");
        drownWarningEl.classList.add("hidden");
        resetFishing();
      } else {
        drownWarningEl.classList.remove("hidden");
        drownWarningEl.textContent = `Drowning in ${(DROWN_SECONDS - waterTimer).toFixed(1)}s`;
      }
    } else {
      waterTimer = 0;
      drownWarningEl.classList.add("hidden");
    }
  }

  camera.x = player.x;
  camera.y = player.y;

  drawWorld();
  if (timeHudEl) {
    const phase = isNight ? "NIGHT" : "DAY";
    const mm = String(Math.floor(phaseTimer / 60)).padStart(2, "0");
    const ss = String(Math.floor(phaseTimer % 60)).padStart(2, "0");
    const stormTxt = stormActive ? ` · STORM ${String(Math.floor((180 - stormTimer) / 60)).padStart(2, "0")}:${String(Math.floor((180 - stormTimer) % 60)).padStart(2, "0")}` : "";
    timeHudEl.textContent = `${phase} ${mm}:${ss}${stormTxt}`;
  }
  islandLabelEl.textContent =
    gameState === "drowned"
      ? "…"
      : performance.now() < illusionEntryFeeMsgUntil
        ? "Need $50 to enter Illusion Island"
        : currentIslandName(player.x, player.y);
  requestAnimationFrame(frame);
}

function drawWorld() {
  const vw = canvas.width / dpr;
  const vh = canvas.height / dpr;
  ctx.fillStyle = "#061018";
  ctx.fillRect(0, 0, vw, vh);

  ctx.save();
  ctx.translate(vw / 2 - camera.x, vh / 2 - camera.y);

  const startTx = Math.floor((camera.x - vw / 2) / TILE_SIZE) - 2;
  const endTx = Math.ceil((camera.x + vw / 2) / TILE_SIZE) + 2;
  const startTy = Math.floor((camera.y - vh / 2) / TILE_SIZE) - 2;
  const endTy = Math.ceil((camera.y + vh / 2) / TILE_SIZE) + 2;

  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      const wx = tx * TILE_SIZE;
      const wy = ty * TILE_SIZE;
      const cx = wx + TILE_SIZE * 0.5;
      const cy = wy + TILE_SIZE * 0.5;
      const type = getTileTypeAt(cx, cy);
      drawTileTexture(wx, wy, type, tx, ty);
      if (isWaterTileType(type) && isTitanInfectedWaterAt(cx, cy)) {
        ctx.fillStyle = "rgba(200, 30, 45, 0.52)";
        ctx.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
      }
      if (type === TILE.TREE) {
        drawTreeSprite(wx, wy, tx, ty);
      }
      if (type === TILE.CACTUS) {
        drawCactusSprite(wx, wy, tx, ty);
      }
    }
  }

  for (const is of islands) {
    if (is.kind === "illusion") continue;
    const ss = standPosSell(is);
    const sh = standPosShop(is);
    const hb = standPosHarbor(is);
    if (is.kind === "garbage") {
      const dg = standPosDestroy(is);
      drawStand2x2(dg.x, dg.y, "destroy");
    } else {
      drawStand2x2(ss.x, ss.y, "sell");
      drawStand2x2(sh.x, sh.y, "shop");
      drawStand2x2(hb.x, hb.y, "harbor");
    }
  }

  // Craft island NPC
  const npc = craftNpcPos();
  if (npc.x || npc.y) {
    ctx.save();
    ctx.translate(npc.x, npc.y);
    ctx.fillStyle = "#37474f";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = "#111";
    ctx.fillRect(-4.5, -6, 2, 2.5);
    ctx.fillRect(3.5, -6, 2, 2.5);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    if (isNearCraftNpc(player.x, player.y)) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(230,245,255,0.95)";
      ctx.fillText("Space: craft", 0, -26);
    }
    ctx.restore();
  }

  const encWorld = illusionEnchanterPos();
  if (encWorld) {
    ctx.save();
    ctx.translate(encWorld.x, encWorld.y + 6);
    ctx.fillStyle = "#3e2723";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-44, -4, 88, 18, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(-34, 14, 9, 6);
    ctx.fillRect(25, 14, 9, 6);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(-40, -2, 80, 4);
    ctx.restore();
    ctx.save();
    ctx.translate(encWorld.x, encWorld.y - 16);
    ctx.fillStyle = "#4a148c";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = "#111";
    ctx.fillRect(-4.5, -6, 2, 2.5);
    ctx.fillRect(3.5, -6, 2, 2.5);
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦", 0, -22);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    if (isNearIllusionEnchanter(player.x, player.y)) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,230,255,0.98)";
      ctx.fillText("Space: Illusion Enchanter", 0, -34);
    }
    ctx.restore();
  }

  const ghostWorld = ghostCrafterPos();
  if (ghostWorld) {
    ctx.save();
    ctx.translate(ghostWorld.x, ghostWorld.y);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#4dd0e1";
    ctx.strokeStyle = "rgba(0,80,100,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#e0f7fa";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡", 0, -22);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = "#111";
    ctx.fillRect(-4.5, -6, 2, 2.5);
    ctx.fillRect(3.5, -6, 2, 2.5);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    if (isNearGhostCrafter(player.x, player.y)) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(220,248,255,0.98)";
      ctx.fillText("Space: Ghost Crafter", 0, -32);
    }
    ctx.restore();
  }

  const relicSellWorld = relicSellerPos();
  if (relicSellWorld) {
    ctx.save();
    ctx.translate(relicSellWorld.x, relicSellWorld.y);
    ctx.fillStyle = "#5d4037";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffc107";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("◆", 0, -22);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = "#111";
    ctx.fillRect(-4.5, -6, 2, 2.5);
    ctx.fillRect(3.5, -6, 2, 2.5);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    if (isNearRelicSeller(player.x, player.y)) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,236,200,0.98)";
      ctx.fillText("Space: Relic Seller", 0, -32);
    }
    ctx.restore();
  }

  const memeNpc = memeCrafterPos();
  if (memeNpc) {
    ctx.save();
    ctx.translate(memeNpc.x, memeNpc.y);
    ctx.fillStyle = "#6a1b9a";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("M", 0, -22);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = "#111";
    ctx.fillRect(-4.5, -6, 2, 2.5);
    ctx.fillRect(3.5, -6, 2, 2.5);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    if (isNearMemeCrafter(player.x, player.y)) {
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,240,255,0.98)";
      ctx.fillText("Space: Meme Crafter", 0, -30);
    }
    ctx.restore();
  }

  const ssForHint = islands.find((x) => x.kind === "sunstrike");
  if (ssForHint && isInSunstrikeCave(player.x, player.y)) {
    ctx.save();
    ctx.translate(ssForHint.cx, ssForHint.cy - TILE_SIZE * 1.4);
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,245,220,0.96)";
    ctx.fillText("Space: Illusion Island", 0, 0);
    ctx.restore();
  }
  if (illusionIsland() && isNearIllusionReturnCave(player.x, player.y)) {
    const ill = illusionIsland();
    const p = islandWorldPos(ill, 0, 21);
    ctx.save();
    ctx.translate(p.x, p.y - TILE_SIZE * 1.2);
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(230,200,255,0.96)";
    ctx.fillText("Space: return to Sunstrike", 0, 0);
    ctx.restore();
  }

  // (Garbage rod is obtained by fishing at Garbage Island.)

  if (onBoat) {
    // simple boat under the player
    ctx.save();
    ctx.translate(player.x, player.y + 10);
    ctx.rotate(Math.atan2(player.facing.y, player.facing.x));
    ctx.fillStyle = "rgba(120, 90, 60, 0.95)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(6, -2, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (fishingState !== "idle") {
    const v =
      equippedRodId === "testingRod"
        ? "testing"
        : equippedRodId === "liarRod"
          ? "liar"
          : equippedRodId === "garbageRod"
            ? "garbage"
            : equippedRodId === "gunRod"
              ? "gun"
              : equippedRodId === "rod67"
                ? "rod67"
                : equippedRodId === "sharkRod"
                  ? "shark"
                  : equippedRodId === "speedRod"
                    ? "speed"
                    : equippedRodId === "forestRod"
                      ? "forest"
                      : equippedRodId === "metalRod"
                        ? "metal"
                        : equippedRodId === "advancedRod"
                          ? "advanced"
                          : "beginner";
    drawCastLineAndBobber();
    drawPlayerSquare(player.x, player.y, player.half, player.facing.x, player.facing.y);
    if (held.kind === "rod") drawEquippedRodToward(castPoint.x, castPoint.y, v);
    drawHeldItemInWorld();
  } else {
    drawPlayerSquare(player.x, player.y, player.half, player.facing.x, player.facing.y);
    if (held.kind === "rod" && equippedRodId && ROD_STATS[equippedRodId]) {
      const v =
        equippedRodId === "testingRod"
          ? "testing"
          : equippedRodId === "liarRod"
            ? "liar"
            : equippedRodId === "garbageRod"
              ? "garbage"
              : equippedRodId === "gunRod"
                ? "gun"
                : equippedRodId === "rod67"
                  ? "rod67"
                  : equippedRodId === "sharkRod"
                    ? "shark"
                    : equippedRodId === "speedRod"
                      ? "speed"
                      : equippedRodId === "forestRod"
                        ? "forest"
                        : equippedRodId === "metalRod"
                          ? "metal"
                          : equippedRodId === "advancedRod"
                            ? "advanced"
                            : "beginner";
      const fx = player.facing.x;
      const fy = player.facing.y;
      const len = Math.hypot(fx, fy) || 1;
      drawEquippedRodToward(
        player.x + (fx / len) * TILE_SIZE * 2,
        player.y + (fy / len) * TILE_SIZE * 2,
        v
      );
    }
    drawHeldItemInWorld();
  }

  ctx.restore();

  // Day/Night + storm color grading overlay (screen-space)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (isNight) {
    ctx.fillStyle = "rgba(0, 10, 30, 0.28)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(10, 30, 60, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (stormActive) {
    ctx.fillStyle = "rgba(10, 10, 20, 0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (lightningFlashT > 0) {
      ctx.fillStyle = `rgba(230, 245, 255, ${0.25 * (lightningFlashT / 0.18)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  ctx.restore();

  drawIslandArrowOverlay();
}

function drawIslandArrowOverlay() {
  const t = getTileTypeAt(player.x, player.y);
  const atSea = t === TILE.DEEP_OCEAN || t === TILE.SHALLOW_OCEAN;
  if (!atSea) return;

  // Overlay uses device-pixel coords (setTransform(1)), so do NOT divide by dpr.
  const vw = canvas.width;
  const vh = canvas.height;
  const cx = vw / 2;
  const cy = vh / 2;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  function drawArrowAt(x, y, ang, scale) {
    // Arrow tip is at (x,y) and points toward +X after rotation.
    const len = 28 * scale;
    const headLen = 12 * scale;
    const headW = 11 * scale;
    const tailW = 5.5 * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);

    // Shaft (from behind tip toward tail)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(-headLen * 0.35, 0);
    ctx.stroke();

    // Filled arrow body with tip at (0,0)
    ctx.beginPath();
    ctx.moveTo(0, 0); // tip
    ctx.lineTo(-headLen, -headW / 2);
    ctx.lineTo(-headLen * 0.88, -tailW / 2);
    ctx.lineTo(-len, -tailW / 2);
    ctx.lineTo(-len, tailW / 2);
    ctx.lineTo(-headLen * 0.88, tailW / 2);
    ctx.lineTo(-headLen, headW / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  for (const is of islands) {
    if (is.kind === "illusion" || is.noArrow) continue;
    const dx = is.cx - player.x;
    const dy = is.cy - player.y;
    const ang = Math.atan2(dy, dx);
    const r = Math.min(vw, vh) * 0.42;
    const ax = cx + Math.cos(ang) * r;
    const ay = cy + Math.sin(ang) * r;

    ctx.fillStyle = "rgba(230,245,255,0.92)";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    drawArrowAt(ax, ay, ang, 1);

    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(230,245,255,0.96)";
    ctx.fillText(is.name, ax, ay - 18);
  }

  ctx.restore();
}

if (!loadGame()) {
  applyDefaultNewGame();
}
updateMoneyHud();
renderInventory();
renderBackpackGrid();
renderRodSlot();
window.addEventListener("beforeunload", saveGame);
requestAnimationFrame(frame);
