import "./style.css";
// Data Objects
const StateVariables = {
  counter: 0,
  lastTime: performance.now(),
  lastFloor: -1,
  autoLoavesPerSecond: 0,
  clickValue: 1,
  totalLoaves: 0,
};

type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier?: number;
  oneTime?: boolean;
  effect: () => void;
  count: number;
  label?: string;
};

// Upgrade definitions
const UPGRADES: Record<string, Upgrade> = {
  "auto-baker": {
    id: "auto-baker",
    name: "Baker",
    label: "Bakers Hired",
    description: "Hire a baker: Produces 0.2 loaves per second.",
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
    label: "Bakeries Owned",
    description: "Open a bakery: Produces a loaf every second.",
    cost: 50,
    costMultiplier: 1.3,
    count: 0,
    effect: () => {
      StateVariables.autoLoavesPerSecond += 1;
    },
  },
  "sourdough": {
    id: "sourdough",
    name: "Sourdough Starter",
    label: "Sourdough Starters",
    description:
      "Give rise to a sourdough starter: Produce an extra half a loaf per click",
    cost: 75,
    costMultiplier: 1.4,
    count: 0,
    effect: () => {
      StateVariables.clickValue += 0.5;
    },
  },
  "oven": {
    id: "oven",
    name: "Oven Upgrade",
    label: "Oven Level",
    description: "Upgrade your oven: Produce an extra loaf per click.",
    cost: 100,
    costMultiplier: 1.5,
    count: 1,
    effect: () => {
      StateVariables.clickValue += 1;
    },
  },
  "minWage": {
    id: "minWage",
    name: "Raise Minimum Wage",
    description:
      "Pay your workers better: Bakers now produce 0.5 loaves per second.\nPURCHASEABLE ONCE",
    cost: 5000,
    count: 0,
    oneTime: true,
    effect: () => {
      StateVariables.autoLoavesPerSecond += UPGRADES["auto-baker"].count * 0.3;
      UPGRADES["auto-baker"].effect = () => {
        StateVariables.autoLoavesPerSecond += 0.5;
      };
    },
  },
};

// HTML
document.body.innerHTML = `
  <div id="main">
    <button id="increment" class="button"><img src="https://i.imgur.com/DIPDyK2.png" width="150" height="150"></button>
    <p id="counter" class="centered-text"></p>
    <div class="stat-box"><p id="stats"></p></div>
  </div>
  <div id="shop"></div>
`;

// Document Constants
const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;
const shopElement = document.getElementById("shop")!;
const statElement = document.getElementById("stats")!;

//Shop Handling
function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.count),
  );
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
  button.innerHTML = `${upgrade.name}<br> Cost: ${cost} loaves`;
  button.disabled = StateVariables.counter < cost;
  if (!upgrade.oneTime) {
    button.title = `${upgrade.description}\nOwned: ${upgrade.count}`;
  } else {
    button.title = `${upgrade.description}\n`;
  }
}

function updateShopDisplay(): void {
  const currentFloor = Math.floor(StateVariables.counter);
  if (currentFloor === StateVariables.lastFloor) return;
  StateVariables.lastFloor = currentFloor;

  Object.values(UPGRADES).forEach((upgrade) => {
    if (upgrade.oneTime && upgrade.count > 0) return;

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

// Upgrade Handling
function buyUpgrade(key: string): void {
  const upgrade = UPGRADES[key];
  const cost = getUpgradeCost(upgrade);

  if (StateVariables.counter >= cost) {
    StateVariables.counter -= cost;
    upgrade.count++;
    upgrade.effect();

    if (upgrade.oneTime == true) {
      const button = document.getElementById(`upgrade-button-${key}`);
      if (button) button.remove();
    }

    updateDisplay();
  }
}
// Bread Count Handling
function incrementAutoIncome(deltaTime: number): void {
  const income = StateVariables.autoLoavesPerSecond * deltaTime;
  StateVariables.counter += income;
  StateVariables.totalLoaves += income;
}

function updateCounterDisplay(): void {
  counterElement.innerHTML = `
    ${Math.trunc(StateVariables.counter)} <br> Loaves of Bread
  `;
}

function updateStatsDisplay(): void {
  const stats: string[] = [
    `Total Loaves Baked: ${Math.trunc(StateVariables.totalLoaves)}`,
    `Loaves Baking Per Second: ${
      StateVariables.autoLoavesPerSecond.toFixed(2)
    }`,
    `Loaves Baked Per Click: ${StateVariables.clickValue}`,
  ];

  Object.values(UPGRADES).forEach((upgrade) => {
    if (!upgrade.oneTime) {
      stats.push(`${upgrade.label}: ${upgrade.count}`);
    }
  });

  statElement.innerHTML = `
    Statistics<br>
    ${stats.join("<br>")}
  `;
}

// Display Management
function updateDisplay(): void {
  updateShopDisplay();
  updateCounterDisplay();
  updateStatsDisplay();
}

// Game Loop
function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - StateVariables.lastTime) / 1000;
  StateVariables.lastTime = currentTime;

  incrementAutoIncome(deltaTime);
  updateDisplay();

  requestAnimationFrame(gameLoop);
}

//Event Listeners
button.addEventListener("click", () => {
  StateVariables.counter += StateVariables.clickValue;
  StateVariables.totalLoaves += StateVariables.clickValue;
  updateDisplay();
});

// Game Start
requestAnimationFrame(gameLoop);
