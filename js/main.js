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

const lineContainer = document.getElementById("line-container");
const line = document.getElementById("line");

const eqGameButton = document.getElementById("eq-game-button");

// need to think of a way of automatically aligning this better with graph axis
// , at all screen scalings
const freqs = geometricArray(35, 13000, 100)

const roundFreqtext = document.getElementById("round-freq");
const guessFreqText = document.getElementById("guess-freq");
const resultText = document.getElementById("result");

let round = 0;
let clicks = 0;
let gameFreqs = [];

if (eqGameButton) {
    eqGameButton.addEventListener('click', function(event) {
        if (round > clicks) {
            // lineContainer.style.border = "2px solid red";
            // setTimeout(() => {
            //     lineContainer.style.border = "none";
            // }, 1000);
            alert("are you thick mate or what. how about make a frequency guess first then we'll see about the next round yeah?");
        }
        else {
            round += 1;
            console.log("round", round);

            const newFreq = freqs[Math.round(100*Math.random())];

            roundFreqtext.textContent = Math.round(newFreq);
            gameFreqs.push(newFreq);

            guessFreqText.textContent = "";
            resultText.textContent = "";

        }
    })
}

if (lineContainer) {
    lineContainer.addEventListener("mousemove", (e) => {
        const rect = lineContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;

        line.style.transform = `translateX(${x}px)`;
    });

    lineContainer.addEventListener("mouseenter", () => {
        line.style.display = "block";
    });

    lineContainer.addEventListener("mouseleave", () => {
        line.style.display = "none";
    });

    // add start/next round button to generate numbers

    lineContainer.addEventListener('click', function(event) {

        // change these to popup windows !!!

        if (clicks == round) {
            // eqGameButton.style.background = "red";
            // setTimeout(() => {
            //     eqGameButton.style.background = "initial";
            // }, 1000);
            alert('are you thick mate or what. how about press go first??');
        }

        else {
            clicks += 1;

            // eventually allow custom tolerance
            const floor = gameFreqs.at(-1)/2;
            const ceiling = gameFreqs.at(-1)*2;

            // fetch current width of container (const as new function each click)
            const boxWidth = lineContainer.offsetWidth;
            const mouseLocation = Math.round(100*event.offsetX/boxWidth);

            // console.log("Frequency guess:", freqs[mouseLocation]);
            const guessFreq = Math.round(freqs[mouseLocation]);
            guessFreqText.textContent = guessFreq;

            if (guessFreq > floor && guessFreq < ceiling) {
                resultText.textContent = "Correct!"
            }
            else {
                resultText.textContent = "Incorrect :("
            }
            
        }
    });
}

// we need to fetch pixel width of container each time mouse clicked to account for screen changes
// we need to have each click make visible a next round button?
// or if auto next round (tickbox?) then change the rng displayed target freq