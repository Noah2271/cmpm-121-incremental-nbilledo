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

//Event Listeners
const button = document.getElementById("increment")!;
const counterElement = document.getElementById("counter")!;

button.addEventListener("click", () => {
  counter++;
  counterElement.innerHTML = `${counter} <br> Loaves of Bread`;
  console.log("woop");
});
