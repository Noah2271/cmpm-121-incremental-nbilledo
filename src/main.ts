// Import CSS
import "./style.css";

// Variables and Objects
const StateVariables = {
  counter: 0,
  lastTime: performance.now(),
  autoMultiplier: 0,
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
    name: "Auto-Baker",
    description: "Produces a single loaf per second.",
    cost: 10,
    costMultiplier: 1.2,
    count: 0,
    effect: () => {
      StateVariables.autoMultiplier += 1;
    },
  },
};

// Calculations
function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.count),
  );
}

// Display Refreshing
function updateCounterDisplay(): void {
  counterElement.innerHTML = `${
    Math.trunc(StateVariables.counter)
  } <br> Loaves of Bread`;
}

let lastFloor = -1;
function updateShopDisplay(): void {
  const currentFloor = Math.floor(StateVariables.counter);
  if (currentFloor === lastFloor) return;
  lastFloor = currentFloor;

  Object.values(UPGRADES).forEach((upgrade) => {
    const cost = getUpgradeCost(upgrade);
    const buttonId = `upgrade-button-${upgrade.id}`;
    let button = document.getElementById(buttonId) as HTMLButtonElement | null;

    if (!button) {
      button = document.createElement("button");
      button.id = buttonId;
      button.className = "upgrade-button";
      button.onclick = () => buyUpgrade(upgrade.id);
      shopElement.appendChild(button);
    }

    button.textContent = `${upgrade.name} (${upgrade.count}) - ${cost} loaves`;
    button.disabled = StateVariables.counter < cost;
    button.title = `${upgrade.description}\nOwned: ${upgrade.count}`;
  });
}

// Upgrade Handing
function buyUpgrade(key: string): void {
  const upgrade = UPGRADES[key];

  const cost = getUpgradeCost(upgrade);
  if (StateVariables.counter >= cost) {
    StateVariables.counter -= cost;
    upgrade.count++;
    upgrade.effect();
    updateCounterDisplay();
    updateShopDisplay();
  }
}

// Game loop per frame
function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - StateVariables.lastTime) / 1000;
  StateVariables.lastTime = currentTime;

  StateVariables.counter += StateVariables.autoMultiplier * deltaTime;

  updateCounterDisplay();
  updateShopDisplay();

  requestAnimationFrame(gameLoop);
}

document.body.innerHTML = `
  <div id="main">
    <div class="button-container">
      <button class="button" type="button" id="increment">🍞</button>
    </div>
    <div class="text-container">
      <p id="counter" class="centered-text">0 <br> Loaves of Bread</p>
    </div>
  </div>
  <div id="shop"></div>
`;

const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;
const shopElement = document.getElementById("shop")!;

// Event Handlers
button.addEventListener("click", () => {
  StateVariables.counter++;
  updateCounterDisplay();
  updateShopDisplay();
});

// Start Calls
updateShopDisplay();
requestAnimationFrame(gameLoop);
