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

function geometricArray(start, end, n) {
    const ratio = Math.pow(end / start, 1 / (n - 1));
    const arr = [];
    for (let i = 0; i < n; i++) {

        arr.push(start * Math.pow(ratio, i));

    }
    return arr;
}

const container = document.getElementById("line-container");
const line = document.getElementById("line");

const eqGameButton = document.getElementById("eq-game-button");

// need to think of a way of automatically aligning this better with graph axis
// , at all screen scalings
const freqs = geometricArray(35, 13000, 100)

const roundFreqtext = document.getElementById("round-freq");
const guessFreqText = document.getElementById("guess-freq");

let round = 0;
let clicks = 0;
let gameFreqs = [];

if (eqGameButton) {
    eqGameButton.addEventListener('click', function(event) {
        if (round > clicks) {
            container.style.border = "2px solid red";
            setTimeout(() => {
                container.style.border = "none";
            }, 1000);
        }
        else {
            round += 1;
            console.log("round", round);

            const newFreq = freqs[Math.round(100*Math.random())];

            roundFreqtext.textContent = Math.round(newFreq);
            gameFreqs.push(newFreq);
            console.log(gameFreqs);
        }
    })
}

if (container) {
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

    // add start/next round button to generate numbers

    container.addEventListener('click', function(event) {

        // change these to popup windows !!!

        if (clicks == round) {
            console.log("no way jose");
            eqGameButton.style.background = "red";
            setTimeout(() => {
                eqGameButton.style.background = "initial";
            }, 1000);
        }

        else {
            clicks += 1;

            // fetch current width of container (const as new function each click)
            const boxWidth = container.offsetWidth;
            const mouseLocation = Math.round(100*event.offsetX/boxWidth);

            // console.log("Frequency guess:", freqs[mouseLocation]);
            const guessFreq = Math.round(freqs[mouseLocation]);
            guessFreqText.textContent = guessFreq;
        }

    });
}

// we need to fetch pixel width of container each time mouse clicked to account for screen changes
// we need to have each click make visible a next round button?
// or if auto next round (tickbox?) then change the rng displayed target freq