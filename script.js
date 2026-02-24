const cashEl = document.getElementById("cash");
const pixelBtn = document.getElementById("pixel");
const shopToggleBtn = document.getElementById("shop-toggle");
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

const SAVE_KEY = "pixel-save-v1";
const SAVE_VERSION = 3;

const SHOP_FEATURE_COST = 20;
const PROFILE_SWITCH_ITEM_ID = "profile-switch";
const MENU_UNLOCK_ITEM_ID = "menu-system";
const GLOBAL_UNLOCK_ITEMS = new Set([MENU_UNLOCK_ITEM_ID, PROFILE_SWITCH_ITEM_ID]);
const SHOP_ITEMS = [
  {
    id: "shop-choices",
    name: "Shop Choices",
    description: "Unlocks a suspiciously large catalog of premium nonsense.",
    cost: 30,
    unlocks: [
      "menu-system",
      "dummy-2",
      "dummy-3",
      "dummy-4",
      "dummy-5",
      "dummy-6",
      "dummy-7",
      "dummy-8",
      "dummy-9",
      "dummy-10"
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
    requires: ["menu-system"]
  },
  { id: "dummy-2", name: "Color Tax", description: "Premium hues sold separately, naturally.", cost: 30, requires: ["shop-choices"] },
  { id: "dummy-3", name: "Prestige Smudge", description: "A decorative blur that screams elite value.", cost: 40, requires: ["shop-choices"] },
  { id: "dummy-4", name: "Loot Pixel", description: "Every click feels rarer if the label says loot.", cost: 55, requires: ["shop-choices"] },
  { id: "dummy-5", name: "Idle Wiggle", description: "The pixel wiggles to imply complicated systems.", cost: 80, requires: ["shop-choices"] },
  { id: "dummy-6", name: "Neon Drip", description: "Adds glow. Adds hype. Adds no restraint.", cost: 125, requires: ["shop-choices"] },
  { id: "dummy-7", name: "Golden Alias", description: "Rename your ambition in tasteful fake gold.", cost: 180, requires: ["shop-choices"] },
  { id: "dummy-8", name: "Pity Multiplier", description: "For players who almost had enough.", cost: 260, requires: ["shop-choices"] },
  { id: "dummy-9", name: "Whale Magnet", description: "Attracts high rollers and bad decisions.", cost: 400, requires: ["shop-choices"] },
  { id: "dummy-10", name: "Monetized Blink", description: "Now even blinking feels premium.", cost: 600, requires: ["shop-choices"] }
];

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
      purchasedItems: []
    }
  },
  inShopView: false,
  isMenuOpen: false
};

let saveTimer = null;

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

function isUnlocked(profile, item) {
  if (!item.requires || item.requires.length === 0) {
    return true;
  }
  const owned = getOwnedSet(profile);
  return item.requires.every((requiredId) => owned.has(requiredId) || hasGlobalUnlock(requiredId));
}

function canSeeShopButton(profile) {
  return profile.shopFeatureUnlocked || profile.cash >= SHOP_FEATURE_COST;
}

function updateShopVisibility() {
  shopToggleBtn.classList.toggle("hidden", !canSeeShopButton(getProfile()));
  gameScreenEl.classList.toggle("hidden", state.inShopView);
  shopScreenEl.classList.toggle("hidden", !state.inShopView);
}

function updateMenuVisibility() {
  const menuUnlocked = hasGlobalUnlock(MENU_UNLOCK_ITEM_ID);
  menuToggleBtn.classList.toggle("hidden", !menuUnlocked);
  menuPanelEl.classList.toggle("hidden", !menuUnlocked || !state.isMenuOpen || state.inShopView);
}

function renderShopItems(profile) {
  if (!profile.shopFeatureUnlocked) {
    shopItemsEl.innerHTML = "";
    return;
  }

  const owned = getOwnedSet(profile);
  const visibleItems = SHOP_ITEMS.filter((item) => {
    if (GLOBAL_UNLOCK_ITEMS.has(item.id) && hasGlobalUnlock(item.id)) {
      return false;
    }
    return !owned.has(item.id) && isUnlocked(profile, item);
  });
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
  const profileSwitchUnlocked = hasGlobalUnlock(PROFILE_SWITCH_ITEM_ID);
  profileControlsEl.classList.toggle("hidden", !profileSwitchUnlocked);
  profileLockedEl.classList.toggle("hidden", profileSwitchUnlocked);

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
}

function render() {
  const profile = getProfile();
  if (!profile) {
    return;
  }

  cashEl.textContent = profile.cash.toLocaleString();
  if (!profile.shopFeatureUnlocked) {
    shopToggleBtn.classList.add("is-locked");
    shopToggleBtn.textContent = `\uD83D\uDD12 Unlock Shop (${SHOP_FEATURE_COST} cash)`;
  } else {
    shopToggleBtn.classList.remove("is-locked");
    shopToggleBtn.textContent = state.inShopView ? "Close Shop" : "Open Shop";
  }

  updateShopVisibility();
  updateMenuVisibility();
  renderShopItems(profile);
  renderProfileControls(profile);
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
      purchasedItems: profile.purchasedItems
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
    purchasedItems: []
  };
}

function sanitizePurchasedItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  return value.filter((itemId) => {
    if (!itemById.has(itemId) || seen.has(itemId)) {
      return false;
    }
    seen.add(itemId);
    return true;
  });
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
    purchasedItems: sanitizePurchasedItems(rawProfile?.purchasedItems)
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

    const loadedV3 = loadFromV3(parsed.state);
    if (!loadedV3) {
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
  render();
}

pixelBtn.addEventListener("click", () => {
  const profile = getProfile();
  profile.cash += 1;
  render();
  queueSave();
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
  if (hasItem(profile, item.id) || !isUnlocked(profile, item) || profile.cash < item.cost) {
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
  if (!hasGlobalUnlock(MENU_UNLOCK_ITEM_ID)) {
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
  if (!hasGlobalUnlock(PROFILE_SWITCH_ITEM_ID)) {
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
  if (!hasGlobalUnlock(PROFILE_SWITCH_ITEM_ID)) {
    return;
  }
  createNewProfile();
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
render();

window.reset_game = reset_game;
