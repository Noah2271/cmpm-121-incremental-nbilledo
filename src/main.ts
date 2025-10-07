//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
//<p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>

import "./style.css";
// variables
let counter: number = 0;
let lastTime = performance.now();

// html
document.body.innerHTML = `
  <div class="button-container">
    <button class="button" type="button" id="increment">🍞</button>
  </div>
  <div class="text-container">
    <p id="counter" class="centered-text">0</br>Loaves of Bread</p>
  </div>
`;

// functions
const updateDisplay = () => {
  counterElement.innerHTML = `${Math.trunc(counter)} <br> Loaves of Bread`;
};

function updateCounter(currentTime: number) {
  const deltaTime = (currentTime - lastTime) / 1000;

  lastTime = currentTime;
  counter += deltaTime;
  updateDisplay();

  requestAnimationFrame(updateCounter);
}

// event listeners
const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;
requestAnimationFrame(updateCounter);
button.addEventListener("click", () => {
  counter++;
  updateDisplay();
});
