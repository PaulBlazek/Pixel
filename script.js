const cashEl = document.getElementById("cash");
const pixelBtn = document.getElementById("pixel");
const shopToggleBtn = document.getElementById("shop-toggle");
const gameScreenEl = document.getElementById("game-screen");
const shopScreenEl = document.getElementById("shop-screen");
const shopItemsEl = document.getElementById("shop-items");
const shopCloseBtn = document.getElementById("shop-close");

const SAVE_KEY = "pixel-save-v1";
const SAVE_VERSION = 2;

const SHOP_FEATURE_COST = 100;
const SHOP_ITEMS = [
  {
    id: "shop-choices",
    name: "Shop Choices",
    cost: 100,
    unlocks: [
      "dummy-1",
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
  { id: "dummy-1", name: "Tiny Billboard", cost: 25, requires: ["shop-choices"] },
  { id: "dummy-2", name: "Color Tax", cost: 30, requires: ["shop-choices"] },
  { id: "dummy-3", name: "Prestige Smudge", cost: 40, requires: ["shop-choices"] },
  { id: "dummy-4", name: "Loot Pixel", cost: 55, requires: ["shop-choices"] },
  { id: "dummy-5", name: "Idle Wiggle", cost: 80, requires: ["shop-choices"] },
  { id: "dummy-6", name: "Neon Drip", cost: 125, requires: ["shop-choices"] },
  { id: "dummy-7", name: "Golden Alias", cost: 180, requires: ["shop-choices"] },
  { id: "dummy-8", name: "Pity Multiplier", cost: 260, requires: ["shop-choices"] },
  { id: "dummy-9", name: "Whale Magnet", cost: 400, requires: ["shop-choices"] },
  { id: "dummy-10", name: "Monetized Blink", cost: 600, requires: ["shop-choices"] }
];

const itemById = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

const state = {
  cash: 0,
  shopFeatureUnlocked: false,
  purchasedItems: [],
  inShopView: false
};

let saveTimer = null;

function getOwnedSet() {
  return new Set(state.purchasedItems);
}

function isOwned(itemId) {
  return getOwnedSet().has(itemId);
}

function isUnlocked(item) {
  if (!item.requires || item.requires.length === 0) {
    return true;
  }
  const owned = getOwnedSet();
  return item.requires.every((requiredId) => owned.has(requiredId));
}

function getUnlockNames(item) {
  if (!item.unlocks || item.unlocks.length === 0) {
    return "None";
  }
  return item.unlocks
    .map((unlockedId) => itemById.get(unlockedId))
    .filter(Boolean)
    .map((unlockedItem) => unlockedItem.name)
    .join(", ");
}

function canSeeShopButton() {
  return state.shopFeatureUnlocked || state.cash >= SHOP_FEATURE_COST;
}

function updateShopVisibility() {
  shopToggleBtn.classList.toggle("hidden", !canSeeShopButton());
  gameScreenEl.classList.toggle("hidden", state.inShopView);
  shopScreenEl.classList.toggle("hidden", !state.inShopView);
}

function renderShopItems() {
  const owned = getOwnedSet();

  if (!state.shopFeatureUnlocked) {
    shopItemsEl.innerHTML = "";
    return;
  }

  const visibleItems = SHOP_ITEMS.filter((item) => isUnlocked(item) || owned.has(item.id));
  shopItemsEl.innerHTML = visibleItems
    .map((item) => {
      const ownedItem = owned.has(item.id);
      const affordable = state.cash >= item.cost;
      const buyDisabled = ownedItem || !affordable;
      const buttonText = ownedItem ? "Owned" : `Buy (${item.cost} cash)`;
      return `
        <article class="shop-item${ownedItem ? " is-owned" : ""}" role="listitem">
          <h3>${item.name}</h3>
          <p class="shop-meta">Cost: ${item.cost.toLocaleString()} cash</p>
          <p class="shop-meta">Unlocks: ${getUnlockNames(item)}</p>
          <button class="shop-buy" data-item-id="${item.id}" type="button" ${buyDisabled ? "disabled" : ""}>
            ${buttonText}
          </button>
        </article>
      `;
    })
    .join("");
}

function render() {
  cashEl.textContent = state.cash.toLocaleString();
  if (!state.shopFeatureUnlocked) {
    shopToggleBtn.classList.add("is-locked");
    shopToggleBtn.textContent = `\uD83D\uDD12 Unlock Shop (${SHOP_FEATURE_COST} cash)`;
  } else {
    shopToggleBtn.classList.remove("is-locked");
    shopToggleBtn.textContent = state.inShopView ? "Close Shop" : "Open Shop";
  }
  updateShopVisibility();
  renderShopItems();
}

function saveGame() {
  const payload = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    state
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

    if (typeof parsed.state.cash === "number") {
      state.cash = parsed.state.cash;
    }
    if (typeof parsed.state.shopFeatureUnlocked === "boolean") {
      state.shopFeatureUnlocked = parsed.state.shopFeatureUnlocked;
    }
    if (Array.isArray(parsed.state.purchasedItems)) {
      state.purchasedItems = parsed.state.purchasedItems.filter((itemId) => itemById.has(itemId));
    }
  } catch (_error) {
    // Ignore invalid save data and keep defaults.
  }
}

pixelBtn.addEventListener("click", () => {
  state.cash += 1;
  render();
  queueSave();
});

shopToggleBtn.addEventListener("click", () => {
  if (!state.shopFeatureUnlocked) {
    if (state.cash < SHOP_FEATURE_COST) {
      return;
    }
    state.cash -= SHOP_FEATURE_COST;
    state.shopFeatureUnlocked = true;
    state.inShopView = false;
    render();
    queueSave();
    return;
  }

  state.inShopView = !state.inShopView;
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
  if (!item || !state.shopFeatureUnlocked) {
    return;
  }
  if (isOwned(item.id) || !isUnlocked(item) || state.cash < item.cost) {
    return;
  }

  state.cash -= item.cost;
  state.purchasedItems.push(item.id);
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
