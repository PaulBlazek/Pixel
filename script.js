const cashEl = document.getElementById("cash");
const pixelBtn = document.getElementById("pixel");
const speedWarningEl = document.getElementById("speed-warning");
const coinFlipEl = document.getElementById("coin-flip");
const coinTrackEl = document.getElementById("coin-track");
const coinTextEl = document.getElementById("coin-text");
const shopToggleBtn = document.getElementById("shop-toggle");
const shopCashEl = document.getElementById("shop-cash");
const gameScreenEl = document.getElementById("game-screen");
const shopScreenEl = document.getElementById("shop-screen");
const shopItemsEl = document.getElementById("shop-items");
const shopCloseBtn = document.getElementById("shop-close");
const menuToggleBtn = document.getElementById("menu-toggle");
const menuPanelEl = document.getElementById("menu-panel");
const menuCloseBtn = document.getElementById("menu-close");
const profileControlsEl = document.getElementById("profile-controls");
const profileLockedEl = document.getElementById("profile-locked");
const profileNameInput = document.getElementById("profile-name-input");
const profileNameSaveBtn = document.getElementById("profile-name-save");
const profileSelectEl = document.getElementById("profile-select");
const profileCreateBtn = document.getElementById("profile-create");
const profileDeleteBtn = document.getElementById("profile-delete");
const pixelColorControlsEl = document.getElementById("pixel-color-controls");
const pixelColorInput = document.getElementById("pixel-color-input");
const pixelColorSaveBtn = document.getElementById("pixel-color-save");
const pixelColorResetBtn = document.getElementById("pixel-color-reset");

const SAVE_KEY = "pixel-save-v1";
const SAVE_VERSION = 5;

const SHOP_FEATURE_COST = 20;
const BASE_SPEED_LIMIT = 5;
const SPEED_WARNING_STICK_MS = 3200;
const CASH_MINE_PAYOUT = 50;
const CASH_MINE_INTERVAL_MS = 60000;
const MINE_HEARTBEAT_MS = 1000;
const COIN_RESULT_STICK_MS = 4200;
const COIN_RESULT_FADE_MS = 420;
const GLOBAL_UNLOCK_ITEMS = new Set(["menu-system", "profile-switch", "profile-delete"]);
const SPEED_UPGRADE_ITEMS = new Set(["speed-limit-1", "speed-limit-2", "speed-limit-remove"]);

const SHOP_ITEMS = [
  {
    id: "shop-choices",
    name: "Shop Choices",
    description: "Unlocks a suspiciously large catalog of premium nonsense.",
    cost: 30,
    unlocks: [
      "menu-system",
      "cash-mine",
      "click-upgrade",
      "pixel-color-customizer",
      "more-mines-1",
      "deeper-mines-1",
      "faster-mines-1",
      "speed-limit-1"
    ]
  },
  {
    id: "menu-system",
    name: "Menu",
    description: "Unlocks the main menu button in the top-left of the game screen.",
    cost: 25,
    requires: ["shop-choices"],
    unlocks: ["profile-switch"]
  },
  {
    id: "profile-switch",
    name: "Profile Switch",
    description: "Unlock profile naming, swapping, and creating fresh profiles.",
    cost: 50,
    requires: ["menu-system"],
    unlocks: ["profile-delete"]
  },
  {
    id: "profile-delete",
    name: "Profile Delete",
    description: "Unlock the ability to delete profiles from the menu.",
    cost: 30,
    requires: ["profile-switch"]
  },
  {
    id: "speed-limit-1",
    name: "Fast Fingers",
    description: "Raise click speed limit from 5/s to 10/s.",
    cost: 300,
    requires: ["shop-choices"],
    unlocks: ["speed-limit-2"]
  },
  {
    id: "speed-limit-2",
    name: "Flaming Fingers",
    description: "Raise click speed limit from 10/s to 20/s.",
    cost: 1000,
    requires: ["speed-limit-1"],
    unlocks: ["speed-limit-remove"]
  },
  {
    id: "speed-limit-remove",
    name: "Remove Speed Limit",
    description: "Bribe some politicians to remove the click speed limit completely.",
    cost: 10000,
    requires: ["speed-limit-2"]
  },
  {
    id: "pixel-color-customizer",
    name: "Pixel Color Customizer",
    description: "Unlocks setting a custom pixel color in the menu.",
    cost: 50,
    requires: ["shop-choices"]
  },{
    id: "cash-mine",
    name: "Cash Mine",
    description: "Every minute flips a coin. Heads pays 50 cash, tails pays 0. Works even when on another profile!",
    cost: 50,
    requires: ["shop-choices"]
  },
  {
    id: "more-mines-1",
    name: "More Mines",
    description: "Add 1 extra cash mine (2 total).",
    cost: 300,
    requires: ["cash-mine"],
    unlocks: ["more-mines-2"]
  },
  {
    id: "more-mines-2",
    name: "Even More Mines",
    description: "Add 3 more cash mines (5 total).",
    cost: 1200,
    requires: ["more-mines-1"],
    unlocks: ["more-mines-3"]
  },
  {
    id: "more-mines-3",
    name: "Great Mining Franchise",
    description: "Add 5 more cash mines (10 total).",
    cost: 7000,
    requires: ["more-mines-2"]
  },
  {
    id: "deeper-mines-1",
    name: "Dig Deeper",
    description: "Raise mine payout per heads from 50 to 75.",
    cost: 300,
    requires: ["cash-mine"],
    unlocks: ["deeper-mines-2"]
  },
  {
    id: "deeper-mines-2",
    name: "Even Deeper Mines",
    description: "Raise mine payout per heads even further from 75 to 100.",
    cost: 900,
    requires: ["deeper-mines-1"],
    unlocks: ["deeper-mines-3"]
  },
  {
    id: "deeper-mines-3",
    name: "Diamond Mining",
    description: "Raise mine payout per heads from 100 to 200.",
    cost: 2500,
    requires: ["deeper-mines-2"]
  },
  {
    id: "faster-mines-1",
    name: "Faster Mines",
    description: "Mine cycle improves from 60s to 50s.",
    cost: 380,
    requires: ["cash-mine"],
    unlocks: ["faster-mines-2"]
  },
  {
    id: "faster-mines-2",
    name: "Rapid Mining",
    description: "Mine cycle improves even further from 50s to 40s.",
    cost: 600,
    requires: ["faster-mines-1"],
    unlocks: ["faster-mines-3"]
  },
  {
    id: "faster-mines-3",
    name: "Blindingly Fast Mining",
    description: "Mine cycle improves from 40s to 30s.",
    cost: 1500,
    requires: ["faster-mines-2"]
  },
  {
    id: "click-upgrade",
    name: "Click Upgrade",
    description: "Each click grants +1 extra cash.",
    cost: 230,
    requires: ["shop-choices"]
  },];

const itemById = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

const state = {
  activeProfileId: "profile-1",
  profileOrder: ["profile-1"],
  globalUnlocks: [],
  profiles: {
    "profile-1": {
      name: "Profile 1",
      cash: 0,
      shopFeatureUnlocked: false,
      purchasedItems: [],
      speedLimitDiscovered: false,
      pixelColor: "#00ffc3"
    }
  },
  inShopView: false,
  isMenuOpen: false
};

const runtime = {
  grantedClickTimestampsByProfile: {},
  speedWarningByProfile: {},
  cashMineIntervalId: null,
  cashMineNextTickByProfile: {},
  cashMineIntervalByProfile: {},
  coinFlipAnimTimerId: null,
  coinFlipFadeTimerId: null
};

let saveTimer = null;
let speedWarningRefreshTimer = null;

function getProfile(profileId = state.activeProfileId) {
  return state.profiles[profileId];
}

function getOwnedSet(profile) {
  return new Set(profile.purchasedItems);
}

function hasItem(profile, itemId) {
  return getOwnedSet(profile).has(itemId);
}

function hasGlobalUnlock(itemId) {
  return state.globalUnlocks.includes(itemId);
}

function getClickValue(profile) {
  return 1 + (hasItem(profile, "click-upgrade") ? 1 : 0);
}

function getMineCount(profile) {
  if (!hasItem(profile, "cash-mine")) {
    return 0;
  }
  let mines = 1;
  if (hasItem(profile, "more-mines-1")) {
    mines += 1;
  }
  if (hasItem(profile, "more-mines-2")) {
    mines += 3;
  }
  if (hasItem(profile, "more-mines-3")) {
    mines += 5;
  }
  return mines;
}

function getMinePayout(profile) {
  if (hasItem(profile, "deeper-mines-3")) {
    return 200;
  }
  if (hasItem(profile, "deeper-mines-2")) {
    return 100;
  }
  if (hasItem(profile, "deeper-mines-1")) {
    return 75;
  }
  return CASH_MINE_PAYOUT;
}

function getMineIntervalMs(profile) {
  if (hasItem(profile, "faster-mines-3")) {
    return 30000;
  }
  if (hasItem(profile, "faster-mines-2")) {
    return 40000;
  }
  if (hasItem(profile, "faster-mines-1")) {
    return 50000;
  }
  return CASH_MINE_INTERVAL_MS;
}

function sanitizeHexColor(value, fallback = "#00ffc3") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return fallback;
  }
  return trimmed.toLowerCase();
}

function getPixelColor(profile) {
  return sanitizeHexColor(profile.pixelColor, "#00ffc3");
}

function getShadowColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const darken = (channel) => Math.max(0, Math.floor(channel * 0.58));
  const toHex = (channel) => channel.toString(16).padStart(2, "0");
  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
}

function applyPixelColor(profile) {
  const baseColor = getPixelColor(profile);
  const shadowColor = getShadowColor(baseColor);
  pixelBtn.style.setProperty("--pixel-custom", baseColor);
  pixelBtn.style.setProperty("--pixel-shadow-custom", shadowColor);
}

function isUnlocked(profile, item) {
  if (!item.requires || item.requires.length === 0) {
    return true;
  }
  const owned = getOwnedSet(profile);
  return item.requires.every((requiredId) => owned.has(requiredId) || hasGlobalUnlock(requiredId));
}

function getCurrentSpeedLimit(profile) {
  if (hasItem(profile, "speed-limit-remove")) {
    return Infinity;
  }
  if (hasItem(profile, "speed-limit-2")) {
    return 20;
  }
  if (hasItem(profile, "speed-limit-1")) {
    return 10;
  }
  return BASE_SPEED_LIMIT;
}

function shouldShowItem(profile, item, owned) {
  if (owned.has(item.id)) {
    return false;
  }
  if (GLOBAL_UNLOCK_ITEMS.has(item.id) && hasGlobalUnlock(item.id)) {
    return false;
  }
  if (SPEED_UPGRADE_ITEMS.has(item.id) && !profile.speedLimitDiscovered) {
    return false;
  }
  return isUnlocked(profile, item);
}

function canSeeShopButton(profile) {
  return profile.shopFeatureUnlocked || profile.cash >= SHOP_FEATURE_COST;
}

function getGrantedClickWindow(profileId = state.activeProfileId) {
  if (!runtime.grantedClickTimestampsByProfile[profileId]) {
    runtime.grantedClickTimestampsByProfile[profileId] = [];
  }
  return runtime.grantedClickTimestampsByProfile[profileId];
}

function pruneClickWindow(windowTimestamps, now) {
  const oldestAllowed = now - 1000;
  while (windowTimestamps.length > 0 && windowTimestamps[0] <= oldestAllowed) {
    windowTimestamps.shift();
  }
}

function clearSpeedWarningRefreshTimer() {
  if (speedWarningRefreshTimer !== null) {
    clearTimeout(speedWarningRefreshTimer);
    speedWarningRefreshTimer = null;
  }
}

function scheduleSpeedWarningRefresh() {
  clearSpeedWarningRefreshTimer();
  const warning = runtime.speedWarningByProfile[state.activeProfileId];
  if (!warning) {
    return;
  }

  const msUntilFade = Math.max(0, warning.visibleUntil - Date.now());
  speedWarningRefreshTimer = setTimeout(() => {
    speedWarningRefreshTimer = null;
    render();
  }, msUntilFade + 20);
}

function setSpeedWarning(profileId, text) {
  runtime.speedWarningByProfile[profileId] = {
    text,
    visibleUntil: Date.now() + SPEED_WARNING_STICK_MS
  };
  if (profileId === state.activeProfileId) {
    scheduleSpeedWarningRefresh();
  }
}

function clearSpeedWarning(profileId) {
  delete runtime.speedWarningByProfile[profileId];
}

function playCoinFlipAnimation(outcomes, payoutPerHeads, totalPayout) {
  if (!coinFlipEl || !coinTrackEl || !coinTextEl) {
    return;
  }

  if (runtime.coinFlipAnimTimerId !== null) {
    clearTimeout(runtime.coinFlipAnimTimerId);
    runtime.coinFlipAnimTimerId = null;
  }
  if (runtime.coinFlipFadeTimerId !== null) {
    clearTimeout(runtime.coinFlipFadeTimerId);
    runtime.coinFlipFadeTimerId = null;
  }

  coinTrackEl.innerHTML = outcomes
    .map((isHeads, index) =>
      `<div class="coin-face ${isHeads ? "is-heads" : "is-tails"}" style="--i:${index}">${isHeads ? "H" : "T"}</div>`
    )
    .join("");

  const heads = outcomes.filter(Boolean).length;
  coinTextEl.textContent = `Mines: ${outcomes.length} | Heads: ${heads} | +${totalPayout.toLocaleString()} cash`;
  coinFlipEl.classList.remove("hidden", "is-playing", "is-fading", "is-settled");
  void coinFlipEl.offsetWidth;
  coinFlipEl.classList.add("is-playing");

  runtime.coinFlipAnimTimerId = setTimeout(() => {
    runtime.coinFlipAnimTimerId = null;
    coinFlipEl.classList.remove("is-playing");
    coinFlipEl.classList.add("is-settled");
    coinFlipEl.classList.add("is-fading");
    runtime.coinFlipFadeTimerId = setTimeout(() => {
      runtime.coinFlipFadeTimerId = null;
      coinFlipEl.classList.add("hidden");
      coinFlipEl.classList.remove("is-fading", "is-settled");
    }, COIN_RESULT_FADE_MS);
  }, COIN_RESULT_STICK_MS);
}

function renderSpeedWarning(profile) {
  const profileId = state.activeProfileId;
  if (!Number.isFinite(getCurrentSpeedLimit(profile))) {
    clearSpeedWarning(profileId);
  }

  const warning = runtime.speedWarningByProfile[profileId];
  if (!warning) {
    speedWarningEl.classList.remove("is-visible");
    return;
  }

  speedWarningEl.textContent = warning.text;
  if (Date.now() <= warning.visibleUntil) {
    speedWarningEl.classList.add("is-visible");
    scheduleSpeedWarningRefresh();
  } else {
    speedWarningEl.classList.remove("is-visible");
  }
}

function updateShopVisibility() {
  shopToggleBtn.classList.toggle("hidden", !canSeeShopButton(getProfile()));
  gameScreenEl.classList.toggle("hidden", state.inShopView);
  shopScreenEl.classList.toggle("hidden", !state.inShopView);
}

function updateMenuVisibility() {
  const menuUnlocked = hasGlobalUnlock("menu-system");
  menuToggleBtn.classList.toggle("hidden", !menuUnlocked);
  menuPanelEl.classList.toggle("hidden", !menuUnlocked || !state.isMenuOpen || state.inShopView);
}

function renderShopItems(profile) {
  if (!profile.shopFeatureUnlocked) {
    shopItemsEl.innerHTML = "";
    return;
  }

  const owned = getOwnedSet(profile);
  const visibleItems = SHOP_ITEMS.filter((item) => shouldShowItem(profile, item, owned));
  shopItemsEl.innerHTML = visibleItems
    .map((item) => {
      const affordable = profile.cash >= item.cost;
      const buyDisabled = !affordable;
      return `
        <article class="shop-item" role="listitem">
          <h3>${item.name}</h3>
          <p class="shop-meta">${item.description || "No description yet."}</p>
          <p class="shop-meta">Cost: ${item.cost.toLocaleString()} cash</p>
          <button class="shop-buy" data-item-id="${item.id}" type="button" ${buyDisabled ? "disabled" : ""}>
            Buy (${item.cost} cash)
          </button>
        </article>
      `;
    })
    .join("");
}

function renderProfileControls(profile) {
  const profileSwitchUnlocked = hasGlobalUnlock("profile-switch");
  const profileDeleteUnlocked = hasGlobalUnlock("profile-delete");
  const colorCustomizerUnlocked = hasItem(profile, "pixel-color-customizer");
  profileControlsEl.classList.toggle("hidden", !profileSwitchUnlocked);
  profileLockedEl.classList.toggle("hidden", profileSwitchUnlocked);
  pixelColorControlsEl.classList.toggle("hidden", !colorCustomizerUnlocked);

  if (colorCustomizerUnlocked) {
    pixelColorInput.value = getPixelColor(profile);
  }

  if (!profileSwitchUnlocked) {
    return;
  }

  profileNameInput.value = profile.name;
  profileSelectEl.innerHTML = state.profileOrder
    .filter((profileId) => state.profiles[profileId])
    .map((profileId) => {
      const listedProfile = state.profiles[profileId];
      const selected = profileId === state.activeProfileId ? "selected" : "";
      return `<option value="${profileId}" ${selected}>${listedProfile.name}</option>`;
    })
    .join("");
  profileDeleteBtn.classList.toggle("hidden", !profileDeleteUnlocked);
}

function render() {
  const profile = getProfile();
  if (!profile) {
    return;
  }

  cashEl.textContent = profile.cash.toLocaleString();
  shopCashEl.textContent = profile.cash.toLocaleString();
  if (!profile.shopFeatureUnlocked) {
    shopToggleBtn.classList.add("is-locked");
    shopToggleBtn.textContent = `\uD83D\uDD12 Unlock Shop (${SHOP_FEATURE_COST} cash)`;
  } else {
    shopToggleBtn.classList.remove("is-locked");
    shopToggleBtn.textContent = state.inShopView ? "Close Shop" : "Open Shop";
  }

  updateShopVisibility();
  updateMenuVisibility();
  applyPixelColor(profile);
  renderShopItems(profile);
  renderProfileControls(profile);
  renderSpeedWarning(profile);
}

function buildSaveState() {
  const serializedProfiles = {};
  state.profileOrder.forEach((profileId) => {
    const profile = state.profiles[profileId];
    if (!profile) {
      return;
    }
    serializedProfiles[profileId] = {
      name: profile.name,
      cash: profile.cash,
      shopFeatureUnlocked: profile.shopFeatureUnlocked,
      purchasedItems: profile.purchasedItems,
      speedLimitDiscovered: profile.speedLimitDiscovered,
      pixelColor: getPixelColor(profile)
    };
  });

  return {
    activeProfileId: state.activeProfileId,
    profileOrder: state.profileOrder.filter((profileId) => serializedProfiles[profileId]),
    globalUnlocks: state.globalUnlocks.filter((itemId) => GLOBAL_UNLOCK_ITEMS.has(itemId)),
    profiles: serializedProfiles
  };
}

function saveGame() {
  const payload = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    state: buildSaveState()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

function queueSave() {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveGame();
  }, 150);
}

function createFreshProfile(name) {
  return {
    name,
    cash: 0,
    shopFeatureUnlocked: false,
    purchasedItems: [],
    speedLimitDiscovered: false,
    pixelColor: "#00ffc3"
  };
}

function sanitizePurchasedItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const legacyIdMap = {
    "pixel_color_customizer": "pixel-color-customizer",
    "more_mines_1": "more-mines-1",
    "more_mines_2": "more-mines-2",
    "more_mines_3": "more-mines-3",
    "deeper_mines_1": "deeper-mines-1",
    "deeper_mines_2": "deeper-mines-2",
    "deeper_mines_3": "deeper-mines-3",
    "faster_mines_1": "faster-mines-1",
    "faster_mines_2": "faster-mines-2",
    "faster_mines_3": "faster-mines-3"
  };
  const seen = new Set();
  const normalized = [];
  value.forEach((rawId) => {
    const itemId = legacyIdMap[rawId] || rawId;
    if (!itemById.has(itemId) || seen.has(itemId)) {
      return;
    }
    seen.add(itemId);
    normalized.push(itemId);
  });
  return normalized;
}

function sanitizeProfile(rawProfile, fallbackName) {
  const safeName = typeof rawProfile?.name === "string" && rawProfile.name.trim()
    ? rawProfile.name.trim().slice(0, 24)
    : fallbackName;
  const safeCash = typeof rawProfile?.cash === "number" && rawProfile.cash >= 0 ? rawProfile.cash : 0;
  return {
    name: safeName,
    cash: safeCash,
    shopFeatureUnlocked: Boolean(rawProfile?.shopFeatureUnlocked),
    purchasedItems: sanitizePurchasedItems(rawProfile?.purchasedItems),
    speedLimitDiscovered: Boolean(rawProfile?.speedLimitDiscovered),
    pixelColor: sanitizeHexColor(rawProfile?.pixelColor, "#00ffc3")
  };
}

function loadFromV3(parsedState) {
  const rawProfiles = parsedState?.profiles;
  if (!rawProfiles || typeof rawProfiles !== "object") {
    return false;
  }

  const rawOrder = Array.isArray(parsedState.profileOrder) ? parsedState.profileOrder : [];
  const orderedIds = rawOrder.filter((profileId) => typeof profileId === "string" && rawProfiles[profileId]);
  const profileIds = orderedIds.length > 0 ? orderedIds : Object.keys(rawProfiles);
  if (profileIds.length === 0) {
    return false;
  }

  const profiles = {};
  profileIds.forEach((profileId, index) => {
    profiles[profileId] = sanitizeProfile(rawProfiles[profileId], `Profile ${index + 1}`);
  });

  const activeId = typeof parsedState.activeProfileId === "string" && profiles[parsedState.activeProfileId]
    ? parsedState.activeProfileId
    : profileIds[0];

  state.profiles = profiles;
  state.profileOrder = profileIds;
  state.activeProfileId = activeId;
  if (Array.isArray(parsedState.globalUnlocks)) {
    state.globalUnlocks = parsedState.globalUnlocks.filter((itemId) => GLOBAL_UNLOCK_ITEMS.has(itemId));
  } else {
    const inferredUnlocks = new Set();
    profileIds.forEach((profileId) => {
      profiles[profileId].purchasedItems.forEach((itemId) => {
        if (GLOBAL_UNLOCK_ITEMS.has(itemId)) {
          inferredUnlocks.add(itemId);
        }
      });
    });
    state.globalUnlocks = Array.from(inferredUnlocks);
  }
  return true;
}

function loadFromLegacy(parsedState) {
  const profile = createFreshProfile("Profile 1");
  if (typeof parsedState?.cash === "number" && parsedState.cash >= 0) {
    profile.cash = parsedState.cash;
  }
  if (typeof parsedState?.shopFeatureUnlocked === "boolean") {
    profile.shopFeatureUnlocked = parsedState.shopFeatureUnlocked;
  }
  profile.purchasedItems = sanitizePurchasedItems(parsedState?.purchasedItems);
  profile.speedLimitDiscovered = Boolean(parsedState?.speedLimitDiscovered);

  state.profiles = { "profile-1": profile };
  state.profileOrder = ["profile-1"];
  state.activeProfileId = "profile-1";
  state.globalUnlocks = profile.purchasedItems.filter((itemId) => GLOBAL_UNLOCK_ITEMS.has(itemId));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.state) {
      return;
    }

    const loadedProfiles = loadFromV3(parsed.state);
    if (!loadedProfiles) {
      loadFromLegacy(parsed.state);
    }
  } catch (_error) {
    // Ignore invalid save data and keep defaults.
  }
}

function createNewProfile() {
  let suffix = state.profileOrder.length + 1;
  let profileId = `profile-${suffix}`;
  while (state.profiles[profileId]) {
    suffix += 1;
    profileId = `profile-${suffix}`;
  }

  const profileName = `Profile ${suffix}`;
  state.profiles[profileId] = createFreshProfile(profileName);
  state.profileOrder.push(profileId);
  state.activeProfileId = profileId;
  state.inShopView = false;
  state.isMenuOpen = true;
}

function clearRuntimeForProfile(profileId) {
  delete runtime.grantedClickTimestampsByProfile[profileId];
  delete runtime.speedWarningByProfile[profileId];
  delete runtime.cashMineNextTickByProfile[profileId];
  delete runtime.cashMineIntervalByProfile[profileId];
}

function ensureAtLeastOneProfile() {
  if (state.profileOrder.length > 0) {
    return;
  }
  const fallbackId = "profile-1";
  state.profiles[fallbackId] = createFreshProfile("Profile 1");
  state.profileOrder = [fallbackId];
  state.activeProfileId = fallbackId;
  state.inShopView = false;
}

function deleteProfile(profileId) {
  if (!state.profiles[profileId]) {
    return false;
  }

  delete state.profiles[profileId];
  state.profileOrder = state.profileOrder.filter((id) => id !== profileId);
  clearRuntimeForProfile(profileId);

  if (state.activeProfileId === profileId) {
    state.activeProfileId = state.profileOrder[0] || "";
    state.inShopView = false;
  }

  ensureAtLeastOneProfile();
  return true;
}

function runCashMineTick(profileId, profile, now) {
  let changedSaveData = false;

  const mineCount = getMineCount(profile);
  const payoutPerHeads = getMinePayout(profile);
  const outcomes = Array.from({ length: mineCount }, () => Math.random() < 0.5);
  const heads = outcomes.filter(Boolean).length;
  const totalPayout = heads * payoutPerHeads;

  if (totalPayout > 0) {
    profile.cash += totalPayout;
    changedSaveData = true;
  }

  if (profileId === state.activeProfileId) {
    playCoinFlipAnimation(outcomes, payoutPerHeads, totalPayout);
    render();
  }

  const intervalMs = getMineIntervalMs(profile);
  runtime.cashMineNextTickByProfile[profileId] = now + intervalMs;
  runtime.cashMineIntervalByProfile[profileId] = intervalMs;

  if (changedSaveData) {
    queueSave();
  }
}

function runCashMineScheduler() {
  const now = Date.now();

  state.profileOrder.forEach((profileId) => {
    const profile = state.profiles[profileId];
    if (!profile) {
      return;
    }

    const mineCount = getMineCount(profile);
    if (mineCount <= 0) {
      delete runtime.cashMineNextTickByProfile[profileId];
      delete runtime.cashMineIntervalByProfile[profileId];
      return;
    }

    const intervalMs = getMineIntervalMs(profile);
    const previousInterval = runtime.cashMineIntervalByProfile[profileId];
    if (previousInterval && previousInterval !== intervalMs) {
      runtime.cashMineNextTickByProfile[profileId] = now + intervalMs;
    }

    if (!runtime.cashMineNextTickByProfile[profileId]) {
      runtime.cashMineNextTickByProfile[profileId] = now + intervalMs;
      runtime.cashMineIntervalByProfile[profileId] = intervalMs;
      return;
    }

    if (now >= runtime.cashMineNextTickByProfile[profileId]) {
      runCashMineTick(profileId, profile, now);
    } else {
      runtime.cashMineIntervalByProfile[profileId] = intervalMs;
    }
  });
}

function startCashMineLoop() {
  if (runtime.cashMineIntervalId !== null) {
    clearInterval(runtime.cashMineIntervalId);
    runtime.cashMineIntervalId = null;
  }
  runtime.cashMineIntervalId = setInterval(runCashMineScheduler, MINE_HEARTBEAT_MS);
}

function reset_game() {
  const confirmation = window.prompt("Type RESET to wipe all save data.", "");
  if (confirmation !== "RESET") {
    return;
  }

  localStorage.removeItem(SAVE_KEY);
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  state.activeProfileId = "profile-1";
  state.profileOrder = ["profile-1"];
  state.globalUnlocks = [];
  state.profiles = { "profile-1": createFreshProfile("Profile 1") };
  state.inShopView = false;
  state.isMenuOpen = false;
  runtime.grantedClickTimestampsByProfile = {};
  runtime.speedWarningByProfile = {};
  runtime.cashMineNextTickByProfile = {};
  runtime.cashMineIntervalByProfile = {};
  if (runtime.cashMineIntervalId !== null) {
    clearInterval(runtime.cashMineIntervalId);
    runtime.cashMineIntervalId = null;
  }
  if (runtime.coinFlipAnimTimerId !== null) {
    clearTimeout(runtime.coinFlipAnimTimerId);
    runtime.coinFlipAnimTimerId = null;
  }
  if (runtime.coinFlipFadeTimerId !== null) {
    clearTimeout(runtime.coinFlipFadeTimerId);
    runtime.coinFlipFadeTimerId = null;
  }
  if (coinFlipEl) {
    coinFlipEl.classList.remove("is-playing", "is-fading", "is-settled");
    coinFlipEl.classList.add("hidden");
  }
  clearSpeedWarningRefreshTimer();
  startCashMineLoop();
  render();
}

pixelBtn.addEventListener("click", () => {
  const profile = getProfile();
  const profileId = state.activeProfileId;
  const now = Date.now();
  const speedLimit = getCurrentSpeedLimit(profile);
  const grantedClickWindow = getGrantedClickWindow(profileId);
  pruneClickWindow(grantedClickWindow, now);

  let changedSaveData = false;

  if (!Number.isFinite(speedLimit) || grantedClickWindow.length < speedLimit) {
    profile.cash += getClickValue(profile);
    grantedClickWindow.push(now);
    changedSaveData = true;
  } else {
    if (!profile.speedLimitDiscovered) {
      profile.speedLimitDiscovered = true;
      changedSaveData = true;
    }
    setSpeedWarning(profileId, `Clicks are currently limited to ${speedLimit}/sec. Upgrade in the shop.`);
  }

  render();
  if (changedSaveData) {
    queueSave();
  }
});

shopToggleBtn.addEventListener("click", () => {
  const profile = getProfile();
  if (!profile.shopFeatureUnlocked) {
    if (profile.cash < SHOP_FEATURE_COST) {
      return;
    }
    profile.cash -= SHOP_FEATURE_COST;
    profile.shopFeatureUnlocked = true;
    state.inShopView = false;
    render();
    queueSave();
    return;
  }

  state.inShopView = !state.inShopView;
  if (state.inShopView) {
    state.isMenuOpen = false;
  }
  render();
});

shopCloseBtn.addEventListener("click", () => {
  state.inShopView = false;
  render();
});

shopItemsEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const itemId = target.dataset.itemId;
  if (!itemId) {
    return;
  }
  const item = itemById.get(itemId);
  const profile = getProfile();
  if (!item || !profile.shopFeatureUnlocked) {
    return;
  }
  if (profile.cash < item.cost) {
    return;
  }
  if (!shouldShowItem(profile, item, getOwnedSet(profile))) {
    return;
  }

  profile.cash -= item.cost;
  profile.purchasedItems.push(item.id);
  if (GLOBAL_UNLOCK_ITEMS.has(item.id) && !hasGlobalUnlock(item.id)) {
    state.globalUnlocks.push(item.id);
  }
  render();
  queueSave();
});

menuToggleBtn.addEventListener("click", () => {
  if (!hasGlobalUnlock("menu-system")) {
    return;
  }
  state.isMenuOpen = !state.isMenuOpen;
  render();
});

menuCloseBtn.addEventListener("click", () => {
  state.isMenuOpen = false;
  render();
});

profileNameSaveBtn.addEventListener("click", () => {
  if (!hasGlobalUnlock("profile-switch")) {
    return;
  }
  const profile = getProfile();
  const nextName = profileNameInput.value.trim().slice(0, 24);
  if (!nextName) {
    profileNameInput.value = profile.name;
    return;
  }
  profile.name = nextName;
  render();
  queueSave();
});

profileSelectEl.addEventListener("change", () => {
  const selectedId = profileSelectEl.value;
  if (!state.profiles[selectedId]) {
    return;
  }
  state.activeProfileId = selectedId;
  state.inShopView = false;
  state.isMenuOpen = false;
  render();
  queueSave();
});

profileCreateBtn.addEventListener("click", () => {
  if (!hasGlobalUnlock("profile-switch")) {
    return;
  }
  createNewProfile();
  render();
  queueSave();
});

profileDeleteBtn.addEventListener("click", () => {
  if (!hasGlobalUnlock("profile-delete")) {
    return;
  }

  const selectedId = profileSelectEl.value;
  const targetProfile = state.profiles[selectedId];
  if (!targetProfile) {
    return;
  }

  const confirmationText = `DELETE ${targetProfile.name}`;
  const promptText = `Type exactly "${confirmationText}" to permanently delete this profile.`;
  const input = window.prompt(promptText, "");
  if (input !== confirmationText) {
    return;
  }

  const deleted = deleteProfile(selectedId);
  if (!deleted) {
    return;
  }

  render();
  queueSave();
});

pixelColorSaveBtn.addEventListener("click", () => {
  const profile = getProfile();
  if (!hasItem(profile, "pixel-color-customizer")) {
    return;
  }
  profile.pixelColor = sanitizeHexColor(pixelColorInput.value, getPixelColor(profile));
  render();
  queueSave();
});

pixelColorResetBtn.addEventListener("click", () => {
  const profile = getProfile();
  if (!hasItem(profile, "pixel-color-customizer")) {
    return;
  }
  profile.pixelColor = "#00ffc3";
  render();
  queueSave();
});

window.addEventListener("beforeunload", saveGame);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveGame();
  }
});

loadGame();
startCashMineLoop();
render();

window.reset_game = reset_game;
