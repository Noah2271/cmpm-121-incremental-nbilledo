//import exampleIconUrl from "./noun-paperclip-7598668-00449F.png";
//<p>Example image asset: <img src="${exampleIconUrl}" class="icon" /></p>

import "./style.css";
// variables
let counter: number = 0;

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
  counterElement.innerHTML = `${counter} <br> Loaves of Bread`;
};

// event listeners
const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;

setInterval(() => {
  counter++;
  updateDisplay();
}, 1000);
button.addEventListener("click", () => {
  counter++;
  updateDisplay();
});
