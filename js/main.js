// 1. Select the HTML elements we want to work with
const myButton = document.getElementById('color-btn');
const myBody = document.body;

// 2. Define what should happen when the button is clicked
function changeBackgroundColor() {
    // Generate a random hex color (e.g., #3498db)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    // Apply that color to the body's background
    myBody.style.backgroundColor = randomColor;
    console.log("The button was clicked!")
}

// 3. Listen for the click event on the button
myButton.addEventListener('click', changeBackgroundColor);