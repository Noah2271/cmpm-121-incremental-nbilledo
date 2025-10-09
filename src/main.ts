// Import CSS
import "./style.css";

// Object containers
const StateVariables = {
  counter: 0,
  lastTime: performance.now(),
  lastFloor: -1,
  autoLoavesPerSecond: 0,
  clickValue: 1,
};

type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: () => void;
  count: number;
};

const UPGRADES: { [key: string]: Upgrade } = {
  "auto-baker": {
    id: "auto-baker",
    name: "Baker",
    description: "Hire a baker: Produces a loaf every five seconds.",
    cost: 10,
    costMultiplier: 1.2,
    count: 0,
    effect: () => {
      StateVariables.autoLoavesPerSecond += 0.2;
    },
  },
  "bakery": {
    id: "bakery",
    name: "Bakery",
    description: "Open a bakery: Produces a loaf every second.",
    cost: 50,
    costMultiplier: 1.3,
    count: 0,
    effect: () => {
      StateVariables.autoLoavesPerSecond += 1;
    },
  },
  "oven": {
    id: "oven",
    name: "Oven",
    description: "Upgrade your over: produce an extra loaf per click.",
    cost: 100,
    costMultiplier: 1.5,
    count: 0,
    effect: () => {
      StateVariables.clickValue += 1;
    },
  },
};

function updateDisplay() {
  updateShopDisplay();
  updateCounterDisplay();
}
// Shop Handling
function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.count),
  );
}

function updateShopDisplay(): void {
  const currentFloor = Math.floor(StateVariables.counter);
  if (currentFloor === StateVariables.lastFloor) return;
  StateVariables.lastFloor = currentFloor;

  Object.values(UPGRADES).forEach((upgrade) => {
    const cost = getUpgradeCost(upgrade);
    const buttonId = `upgrade-button-${upgrade.id}`;
    let button = document.getElementById(buttonId) as HTMLButtonElement;
    if (!button) {
      button = createUpgradeButton(upgrade, buttonId);
      shopElement.appendChild(button);
    }
    updateUpgradeButton(button, upgrade, cost);
  });
}

function createUpgradeButton(upgrade: Upgrade, id: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = id;
  button.className = "upgrade-button";
  button.onclick = () => buyUpgrade(upgrade.id);
  return button;
}

function updateUpgradeButton(
  button: HTMLButtonElement,
  upgrade: Upgrade,
  cost: number,
): void {
  button.innerHTML =
    `${upgrade.name} (${upgrade.count})<br> Cost: ${cost} loaves`;
  button.disabled = StateVariables.counter < cost;
  button.title = `${upgrade.description}\nOwned: ${upgrade.count}`;
}

// Upgrade Handing
function buyUpgrade(key: string): void {
  const upgrade = UPGRADES[key];
  const cost = getUpgradeCost(upgrade);
  if (StateVariables.counter >= cost) {
    StateVariables.counter -= cost;
    upgrade.count++;
    upgrade.effect();
    updateDisplay();
  }
}

// Bread Handling
function incrementAutoIncome(deltaTime: number): void {
  StateVariables.counter += StateVariables.autoLoavesPerSecond * deltaTime;
}

function updateCounterDisplay(): void {
  counterElement.innerHTML = `${
    Math.trunc(StateVariables.counter)
  } <br> Loaves of Bread <br> Current Loaves Baking A Second: ${
    StateVariables.autoLoavesPerSecond.toFixed(1)
  }`;
}

// Game loop per frame
function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - StateVariables.lastTime) / 1000;
  StateVariables.lastTime = currentTime;

  incrementAutoIncome(deltaTime);
  updateDisplay();

  requestAnimationFrame(gameLoop);
}

//HTML
document.body.innerHTML = `
  <div id="main">
    <div class="button-container">
      <button class="button" type="button" id="increment">🍞</button>
    </div>
    <div class="text-container">
      <p id="counter" class="centered-text">0 <br> Loaves of Bread<br> Current Loaves Baking Per Second: 0</p>
    </div>
  </div>
  <div id="shop"></div>
`;

const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;
const shopElement = document.getElementById("shop")!;

// Event Handlers
button.addEventListener("click", () => {
  StateVariables.counter += StateVariables.clickValue;
  updateDisplay();
});

// Start Calls
requestAnimationFrame(gameLoop);
