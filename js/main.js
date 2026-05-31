// 1. Select the HTML elements we want to work with
const myButton = document.getElementById('color-btn');
const myBody = document.body;

// 2. Define what should happen when the button is clicked
function changeBackgroundColor() {
    // Generate a random hex color (e.g., #3498db)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    // Apply that color to the body's background
    myBody.style.backgroundColor = randomColor;
    // console.log("The button was clicked!")
}

// 3. ONLY listen for the click event if the button actually exists on this page!
if (myButton) {
    myButton.addEventListener('click', changeBackgroundColor);
}


const container = document.getElementById("line-container");
const line = document.getElementById("line");

container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;

    line.style.transform = `translateX(${x}px)`;
});

container.addEventListener("mouseenter", () => {
    line.style.display = "block";
});

container.addEventListener("mouseleave", () => {
    line.style.display = "none";
});

container.addEventListener('click', function(event) {
    console.log("Mouse clicked at", event.offsetX, "pixels!");
});