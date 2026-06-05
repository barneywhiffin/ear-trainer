function geometricArray(start, end, n) {
    const ratio = Math.pow(end / start, 1 / (n - 1));
    const arr = [];
    for (let i = 0; i < n; i++) {

        arr.push(start * Math.pow(ratio, i));

    }
    return arr;
}

const myButton = document.getElementById('color-btn');
const myBody = document.body;
const lineContainer = document.getElementById("line-container");
const line = document.getElementById("line");
const eqGameButton = document.getElementById("eq-game-button");

// need to think of a way of automatically aligning this better with graph axis
// , at all screen scalings
const freqs = geometricArray(35, 13000, 100);

const roundFreqtext = document.getElementById("round-freq");
const guessFreqText = document.getElementById("guess-freq");
const resultText = document.getElementById("result");

const eqGameHowto = document.getElementById("eq-game-howto");
const openEqHowto = document.getElementById("open-eq-howto");
const closeEqHowto = document.getElementById("close-eq-howto");
const eqGameSettings = document.getElementById("eq-game-settings");
const openEqSettings = document.getElementById("open-eq-settings");
const closeEqSettings = document.getElementById("close-eq-settings");

const usernameTextbox = document.getElementById("username-textbox");
const usernameButton = document.getElementById("username-button");
const usernameDisplayButton = document.getElementById("username-display-button");
const usernameDisplay = document.getElementById("username-display");

// eq game popup windows
if (openEqHowto) {
    openEqHowto.addEventListener("click", () => eqGameHowto.showModal());
    closeEqHowto.addEventListener("click", () => eqGameHowto.close());
}

if (openEqSettings) {
    openEqSettings.addEventListener("click", () => eqGameSettings.showModal());
    closeEqSettings.addEventListener("click", () => eqGameSettings.close());
}

// eventually upgrade into a user class

// most ideally, have the confirm button greyed out and unclickable until something in textbox!!
if (usernameButton) {
    usernameButton.addEventListener("click", function(event) {
        const username = usernameTextbox.value;
        localStorage.setItem('username', username);
        // console.log(username);
        usernameTextbox.value = "";
    })
}


if (usernameDisplayButton) {
    usernameDisplayButton.addEventListener("click", function(event) {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            usernameDisplay.textContent = savedUsername;
        }
        else {
            usernameDisplay.textContent = "No username entered yet";
        }
    })
}


// background colour button function
function changeBackgroundColor() {
    // Generate a random hex color (e.g., #3498db)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    // Apply that color to the body's background
    myBody.style.backgroundColor = randomColor;
    // console.log("The button was clicked!")
}


if (myButton) {
    myButton.addEventListener('click', changeBackgroundColor);
}

// const gainSelection = document.getElementById("gain-select");

// if (gainSelection) {

// }

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

            // TODO: replace alerts with custom css popups as this won't work with androidddd
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