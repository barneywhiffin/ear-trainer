function geometricArray(start, end, n) {
    const ratio = Math.pow(end / start, 1 / (n - 1));
    const arr = [];
    for (let i = 0; i < n; i++) {

        arr.push(start * Math.pow(ratio, i));

    }
    return arr;
}

function getUserInfo() {
    const savedUsers = JSON.parse(localStorage.getItem('users'))
    let activeUser = false;
    let index = 0;
    for (let i in savedUsers) {
        if (savedUsers[i].active === true) {
            activeUser = true;
            index = i
        }
    } 
    if (activeUser) {
        return [savedUsers, index];
    }
    else {
        return [null, null];
    }
}

function maxIndex(arr) {
    let idx = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > arr[idx]) {
            idx = i;
        }
    }
    return idx;
}

const audioCtx = new AudioContext();

const myButton = document.getElementById('color-btn');
const myBody = document.body;
const lineContainer = document.getElementById("line-container");
const line = document.getElementById("line");
const eqGameButton = document.getElementById("eq-game-button");

// need to think of a way of automatically aligning this better with graph axis
// , at all screen scalings
const freqs = geometricArray(45, 11000, 100);

const guessFreqText = document.getElementById("guess-freq");
const resultText = document.getElementById("result");
const scoreText = document.getElementById("score-text");

const eqGameHowto = document.getElementById("eq-game-howto");
const openEqHowto = document.getElementById("open-eq-howto");
const closeEqHowto = document.getElementById("close-eq-howto");
const eqGameSettings = document.getElementById("eq-game-settings");
const openEqSettings = document.getElementById("open-eq-settings");
const closeEqSettings = document.getElementById("close-eq-settings");

const usernameTextbox = document.getElementById("username-textbox");
const addUsernameButton = document.getElementById("add-username-button");
const usernameDisplay = document.getElementById("username-display");
const scoresDisplay1 = document.getElementById("scores-display1");
const scoresDisplay2 = document.getElementById("scores-display2");
const scoresDisplay3 = document.getElementById("scores-display3");

// TODO: only bother running on specific audio related pages
window.addEventListener('load', async () => {
    if (usernameDisplay) {
        const [savedUsers, index] =  getUserInfo();
        if (index) {
            const savedUsername = savedUsers[index].username;
            usernameDisplay.textContent = `Username: ${savedUsername}`; 
        }
    }
    if (scoresDisplay1) {
        let [savedUsers, index] = getUserInfo();
        let allUsers = [];
        let allScores = [];
        for (let i in savedUsers) {
            for (let j in savedUsers[i].scores) {
                allUsers.push(savedUsers[i].username);
                allScores.push(savedUsers[i].scores[j]);
            }
        }
        topScoreIndex = maxIndex(allScores);

        // .splice lets us remove the value at a certain index
        scoresDisplay1.textContent = allUsers[topScoreIndex] + allScores[topScoreIndex]; 
        allUsers.splice(topScoreIndex, 1);  
        allScores.splice(topScoreIndex, 1); 
        
        topScoreIndex = maxIndex(allScores);
        scoresDisplay2.textContent = allUsers[topScoreIndex] + allScores[topScoreIndex]; 
        allUsers.splice(topScoreIndex, 1);  
        allScores.splice(topScoreIndex, 1);

        topScoreIndex = maxIndex(allScores);
        scoresDisplay3.textContent = allUsers[topScoreIndex] + allScores[topScoreIndex]; 
        allUsers.splice(topScoreIndex, 1);  
        allScores.splice(topScoreIndex, 1);
    }
    await audioCtx.audioWorklet.addModule('../js/pink-noise.js');
});

async function ensureAudioReady() {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

// eq game popup windows
if (openEqHowto) {
    openEqHowto.addEventListener("click", () => eqGameHowto.showModal());
    closeEqHowto.addEventListener("click", () => eqGameHowto.close());
}

if (openEqSettings) {
    openEqSettings.addEventListener("click", () => eqGameSettings.showModal());
    closeEqSettings.addEventListener("click", () => eqGameSettings.close());
}

// TODO: eventually upgrade into a user class with scores

// most ideally, have the confirm button greyed out and unclickable until something in textbox!!
if (addUsernameButton) {
    addUsernameButton.addEventListener("click", function(event) {
        const username = usernameTextbox.value;
        let [savedUsers, index] =  getUserInfo()

        if (!index) {
            let users = [];
            let newUser = {
                username: username,
                active: true,
                scores: [],
            }
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // probably jank af workaround but it is doing the job
        let userExistsFlag = false;
        for (i in savedUsers) {
            savedUsers[i].active = false;
            if (username === savedUsers[i].username) {
                savedUsers[i].active = true;
                userExistsFlag = true;
            }
        }
        if (!userExistsFlag) {
            let newUser = {
                username: username,
                active: true,
                scores: [],
            }
            savedUsers.push(newUser);
        }
        localStorage.setItem('users', JSON.stringify(savedUsers));
        usernameTextbox.value = "";
        if (usernameDisplay) {
            usernameDisplay.textContent = `Username: ${username}`;
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
let score = 0;
let clicks = 0;
let gameFreqs = [];

if (eqGameButton) {
    eqGameButton.addEventListener('click', async() => {
        if (round > clicks) {
            // lineContainer.style.border = "2px solid red";
            // setTimeout(() => {
            //     lineContainer.style.border = "none";
            // }, 1000);
            alert("are you thick mate or what. how about make a frequency guess first then we'll see about the next round yeah?");

            // TODO: replace alerts with custom css popups as this won't work with androidddd
        }
        else {
            // set / reset things

            guessFreqText.textContent = "";
            resultText.textContent = "";

            round += 1;

            const newFreq = freqs[Math.floor(Math.random() * freqs.length)];

            gameFreqs.push(newFreq);

            // actually make the sound happen

            await ensureAudioReady();

            const now = audioCtx.currentTime;
            const duration = 2.0;
            const fadeTime = 0.1;
            const gain = 0.2;
            const eqFreq = newFreq;
            const eqQ = 2.0;
            const eqGain = 12;

            const pinkNoise = new AudioWorkletNode(audioCtx, 'pink-noise-processor');
            const envelope = audioCtx.createGain();

            const eqBand = audioCtx.createBiquadFilter();
            eqBand.type = 'peaking';       
            eqBand.frequency.value = eqFreq;   
            eqBand.Q.value = eqQ;     
            eqBand.gain.value = eqGain;   

            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(gain, now + fadeTime); // Quick fade in
            envelope.gain.setValueAtTime(gain, now + duration - fadeTime); // Sustain
            envelope.gain.linearRampToValueAtTime(0, now + duration); // Fade out

            pinkNoise.connect(eqBand);
            eqBand.connect(envelope);
            envelope.connect(audioCtx.destination);

            setTimeout(() => {
                envelope.disconnect();
                eqBand.disconnect();
                pinkNoise.disconnect();
            }, (duration + 0.05) * 1000);
        }
    });
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

            const guessFreq = Math.round(freqs[mouseLocation]);
            guessFreqText.textContent = `Answer guessed: ${guessFreq}Hz`;
            const displayAnswer = Math.round(gameFreqs.at(-1));

            if (guessFreq > floor && guessFreq < ceiling) {
                resultText.textContent = `Correct! it was ${displayAnswer}Hz`;
                score += 1;
                scoreText.textContent = `Score: ${score}`;
            }
            else {
                resultText.textContent = `Incorrect :( it was ${displayAnswer}Hz`;
                let [savedUsers, index] = getUserInfo();
                // console.log(savedUsers);
                savedUsers[index].scores.push(score);
                localStorage.setItem('users', JSON.stringify(savedUsers));
                scoreText.textContent = `Score: 0`;
            }
            
        }
    });
}