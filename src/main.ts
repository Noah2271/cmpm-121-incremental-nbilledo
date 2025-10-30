import "./style.css";

//Upgrade Interface
type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  oneTimeUpgrade?: boolean;
  effect: () => void;
  upgradeCount: number;
  label?: string;
};

//Gamestate Variable Object
const StateVariables = {
  loavesCount: 0,
  lastTime: performance.now(),
  lastFloor: -1,
  loavesPerSecond: 0,
  loavesPerClick: 1,
  totalLoaves: 0,
};

// Upgrade Data Structure
const UPGRADES: Record<string, Upgrade> = {
  "auto-baker": {
    id: "auto-baker",
    name: "BAKER",
    label: "Bakers Hired",
    description: "Hire a baker: Produces 0.2 loaves per second.",
    cost: 10,
    costMultiplier: 1.2,
    upgradeCount: 0,
    effect: () => {
      StateVariables.loavesPerSecond += 0.2;
    },
  },
  "bakery": {
    id: "bakery",
    name: "BAKERY",
    label: "Bakeries Owned",
    description: "Open a bakery: Produces a loaf every second.",
    cost: 50,
    costMultiplier: 1.3,
    upgradeCount: 0,
    effect: () => {
      StateVariables.loavesPerSecond += 1;
    },
  },
  "sourdough": {
    id: "sourdough",
    name: "SOURDOUGH STARTER",
    label: "Sourdough Starters",
    description:
      "Give rise to a sourdough starter: Produce an extra half a loaf per click",
    cost: 75,
    costMultiplier: 1.4,
    upgradeCount: 0,
    effect: () => {
      StateVariables.loavesPerClick += 0.5;
    },
  },
  "oven": {
    id: "oven",
    name: "OVEN UPGRADE",
    label: "Oven Level",
    description: "Upgrade your oven: Produce an extra loaf per click.",
    cost: 100,
    costMultiplier: 1.5,
    upgradeCount: 1,
    effect: () => {
      StateVariables.loavesPerClick += 1;
    },
  },
  "minWage": {
    id: "minWage",
    name: "RAISE MINIMUM WAGE",
    description:
      "Pay your workers better: Bakers now produce 0.5 loaves per second.\nPURCHASEABLE ONCE",
    cost: 5000,
    upgradeCount: 0,
    costMultiplier: 0,
    oneTimeUpgrade: true,
    effect: () => {
      StateVariables.loavesPerSecond += UPGRADES["auto-baker"].upgradeCount *
        0.3;
      UPGRADES["auto-baker"].effect = () => {
        StateVariables.loavesPerSecond += 0.5;
      };
    },
  },
};

// HTML
document.body.innerHTML = `
  <div id="main">
    <div class="main-layout">
      <div class="game-container">
        <button id="increment" class="button">
          <img src="https://i.imgur.com/DIPDyK2.png" width="150" height="150">
        </button>
        <p id="loavesCount" class="centered-text"></p>
        <div class="stat-box"><p id="stats"></p></div>
      </div>
      <div id="shop">
        <h2 class="shop-title">Upgrades</h2>
        <womp></womp>
      </div>
    </div>
  </div>
`;

//Document Constants
const button = document.getElementById("increment")!;
const counterElement = document.getElementById("loavesCount")!;
const shopElement = document.getElementById("shop")!;
const statElement = document.getElementById("stats")!;

// Upgrade UI Handling
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
  button.disabled = StateVariables.loavesCount < cost;
  if (!upgrade.oneTimeUpgrade) {
    button.title = `${upgrade.description}\nOwned: ${upgrade.upgradeCount}`;
  } else {
    button.title = `${upgrade.description}\n`;
  }
}

// Update shop UI elements only once every time the amount of loaves increases to avoid unecessary update calls.
function updateShopDisplay(): void {
  Object.values(UPGRADES).forEach((upgrade) => {
    const cost = getUpgradeCost(upgrade);
    const buttonId = `upgrade-button-${upgrade.id}`;
    let button = document.getElementById(buttonId) as HTMLButtonElement;
    if (upgrade.oneTimeUpgrade && upgrade.upgradeCount > 0) return;
    if (!button) {
      button = createUpgradeButton(upgrade, buttonId);
      shopElement.appendChild(button);
    }
    updateUpgradeButton(button, upgrade, cost);
  });
}

// Upgrade UI Functionality
// cost = cost(costMultiplier^upgradeCount)
function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.upgradeCount),
  );
}

function buyUpgrade(key: string): void {
  const upgrade = UPGRADES[key];
  const cost = getUpgradeCost(upgrade);
  if (StateVariables.loavesCount >= cost) {
    StateVariables.loavesCount -= cost;
    upgrade.upgradeCount++;
    upgrade.effect();
    if (upgrade.oneTimeUpgrade == true) {
      const button = document.getElementById(`upgrade-button-${key}`);
      if (button) button.remove();
    }
    updateDisplay();
  }
}

function incrementAutoIncome(deltaTime: number): void {
  const income = StateVariables.loavesPerSecond * deltaTime;
  StateVariables.loavesCount += income;
  StateVariables.totalLoaves += income;
}

// Statistics UI
function updateCounterDisplay(): void {
  counterElement.innerHTML = `
    ${Math.trunc(StateVariables.loavesCount)} <br> LOAVES OF BREAD
  `;
}

// Statistics Handling
function formatStatLine(line: string, totalWidth: number = 40): string {
  const [label, value] = line.split(":").map((s) => s.trim());
  const dotsNeeded = Math.max(0, totalWidth - (label.length + value.length));
  const dots = ".".repeat(dotsNeeded);
  return `${label}${dots}${value}`;
}

function updateStatsDisplay(): void {
  const stats: string[] = [
    `Total Loaves Baked: ${Math.trunc(StateVariables.totalLoaves)}`,
    `Loaves Baking Per Second: ${StateVariables.loavesPerSecond.toFixed(2)}`,
    `Loaves Baked Per Click: ${StateVariables.loavesPerClick}`,
  ];

  Object.values(UPGRADES).forEach((upgrade) => {
    if (!upgrade.oneTimeUpgrade) {
      stats.push(`${upgrade.label}: ${upgrade.upgradeCount}`);
    }
  });

  const formatted = stats.map((line) => formatStatLine(line));

  statElement.innerHTML = `
    <pre class="stats-text">STATISTICS\n${formatted.join("\n")}</pre>
  `;
}

// Display Management
function updateDisplay(): void {
  updateShopDisplay();
  updateCounterDisplay();
  updateStatsDisplay();
}

// Primary Gameloop and actions
function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - StateVariables.lastTime) / 1000;
  StateVariables.lastTime = currentTime;
  incrementAutoIncome(deltaTime);
  updateDisplay();
  requestAnimationFrame(gameLoop);
}

/* Inspired by benho612, repository linked above */
let spinning = false;
let spinTimeout: ReturnType<typeof setTimeout>;

button.addEventListener("click", () => {
  StateVariables.loavesCount += StateVariables.loavesPerClick;
  StateVariables.totalLoaves += StateVariables.loavesPerClick;
  updateDisplay();

  if (!spinning) {
    spinning = true;
    button.classList.add("spin");
  }

  clearTimeout(spinTimeout);
  spinTimeout = setTimeout(() => {
    button.classList.remove("spin");
    spinning = false;
  }, 400);
});

// Game Start
requestAnimationFrame(gameLoop);
