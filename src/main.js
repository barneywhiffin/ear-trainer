import {maxIndex, geometricArray, getUserInfo, generatePinkNoise, getToleranceFromRound, roundCheck, changeBackgroundColor} from "./utils.js";
import * as page from "./elements.js";

const audioCtx = new AudioContext();

// TODO: stop audio playing when guess is made
// should actually be continuous up to this point imo
// and allow replay of sound after round (either way)
// also allow space for next round!!!

const lowestFreq = 62.5;
const highestFreq = 8000;
const nFreqs = 5000;
const freqs = geometricArray(lowestFreq, highestFreq, nFreqs);

// TODO: only bother running on specific audio related pages
window.addEventListener('load', async () => {
    if (page.usernameDisplay) {
        const [savedUsers, index] =  getUserInfo();
        if (index || index === 0) {
            const savedUsername = savedUsers[index].username;
            page.usernameDisplay.textContent = `Username: ${savedUsername}`; 
        }
    }
    if (page.scoresDisplayLeft1) {
        let [savedUsers, index] = getUserInfo();
        let allUsers = [];
        let allScores = [];
        for (let i = 0; i < savedUsers.length; i++) {
            for (let j = 0; j < savedUsers[i].scores.length; j++) {
                allUsers.push(savedUsers[i].username);
                allScores.push(savedUsers[i].scores[j]);
            }
        }

        let topScoreIndex = maxIndex(allScores);
        page.scoresDisplayLeft1.textContent = allUsers[topScoreIndex]; 
        page.scoresDisplayRight1.textContent = allScores[topScoreIndex]; 
        allUsers.splice(topScoreIndex, 1);  
        allScores.splice(topScoreIndex, 1); 
        
        topScoreIndex = maxIndex(allScores);
        page.scoresDisplayLeft2.textContent = allUsers[topScoreIndex]; 
        page.scoresDisplayRight2.textContent = allScores[topScoreIndex]; 
        allUsers.splice(topScoreIndex, 1);  
        allScores.splice(topScoreIndex, 1);

        topScoreIndex = maxIndex(allScores);
        page.scoresDisplayLeft3.textContent = allUsers[topScoreIndex]; 
        page.scoresDisplayRight3.textContent = allScores[topScoreIndex];  
    }
    await audioCtx.audioWorklet.addModule('../src/pink-noise.js');
});

async function ensureAudioReady() {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

if (page.openEqHowto) {
    page.openEqHowto.addEventListener("click", () => page.eqGameHowto.showModal());
    page.closeEqHowto.addEventListener("click", () => page.eqGameHowto.close());
}

const eqSettingsCheck = page.openEqSettings && page.eqCutBox && page.eqBoostBox && page.eqMixBox && page.closeEqSettings;

if (eqSettingsCheck) {
    page.openEqSettings.addEventListener("click", () => page.eqGameSettings.showModal());

    let boxes = [page.eqCutBox, page.eqBoostBox, page.eqMixBox];
    let [savedUsers, index] = getUserInfo();

    for (let i = 0; i < boxes.length; i++) {
        const thisBox = boxes[i];
        thisBox.addEventListener("click", function(event) {
            this.checked = true;
            boxes.splice(i, 1);
            for (let j = 0; j < boxes.length; j++) {
                boxes[j].checked = false;
            }
            boxes.splice(i, 0, thisBox);

            if (index || index === 0) {
                if (thisBox === page.eqBoostBox) {
                    savedUsers[index].eqChoice = "boost";
                    localStorage.setItem('users', JSON.stringify(savedUsers));
                }
                else if (thisBox === page.eqCutBox) {
                    savedUsers[index].eqChoice = "cut";
                    localStorage.setItem('users', JSON.stringify(savedUsers));
                }
            }
        })
    }

    // TODO: need to add writing logic here too !!

    if (index || index === 0) {
        const eqGainSetting = savedUsers[index].eqChoice;
        if (eqGainSetting === 'boost') {
            page.eqBoostBox.checked = true;
        }
        else if (eqGainSetting === 'cut') {
            page.eqCutBox.checked = true;
        }
    }

    page.eqGain6Box.checked = true;
    page.eqGain3Box.addEventListener('click', function(event) {
        this.checked = true;
        page.eqGain6Box.checked = false;
    })
    page.eqGain6Box.addEventListener('click', function(event) {
        this.checked = true;
        page.eqGain3Box.checked = false;
    })

    // let gainBoxes = [page.eqGain6Box, page.eqGain3Box];

    page.closeEqSettings.addEventListener("click", () => page.eqGameSettings.close());
}

if (page.openEqSettings && !eqSettingsCheck) {
    console.log('Error: at least 1 of html elements eqcutbox, boostbox, mixbox, or closeeq is missing');
}

if (page.addUsernameButton) {
    page.addUsernameButton.addEventListener("click", function(event) {
        const username = page.usernameTextbox.value;
        let [savedUsers, index] =  getUserInfo()

        if (!index) {
            let users = [];
            let newUser = {
                username: username,
                active: true,
                eqChoice: "boost",
                scores: [],
            }
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // probably jank af workaround but it is doing the job
        let userExistsFlag = false;
        for (let i = 0; i < savedUsers.length; i++) {
            savedUsers[i].active = false;
            if (username === savedUsers[i].username) {
                savedUsers[i].active = true;
                userExistsFlag = true;
            }
        }
        if (!userExistsFlag) {
            const newUser = {
                username: username,
                active: true,
                eqChoice: "boost",
                scores: [],
            }
            savedUsers.push(newUser);
        }
        localStorage.setItem('users', JSON.stringify(savedUsers));
        page.usernameTextbox.value = "";
        if (page.usernameDisplay) {
            page.usernameDisplay.textContent = `Username: ${username}`;
        }
    })
}

if (page.myButton) {
    page.myButton.addEventListener('click', changeBackgroundColor);
}

let round = 0;
let score = 0;
let clicks = 0;
let gameFreqs = [];

if (page.eqGameGoButton) {
    page.eqGameGoButton.textContent = "New Game";
    if (localStorage.getItem('users') != null) {
        page.eqGameGoButton.disabled = false;
    }
    else {
        page.eqGoErrorText.textContent = "Please navigate to Account and create a username first";
    }

    page.eqGameGoButton.addEventListener('click', async() => {

        page.gameOverText.textContent = "";

        page.guessFreqText.textContent = "";
        page.resultText.textContent = "";
        round += 1;
        page.eqGameGoButton.textContent = "Next Round";
        page.eqGameGoButton.disabled = true;

        const newFreq = freqs[Math.floor(Math.random() * freqs.length)];
        gameFreqs.push(newFreq);

        // TODO: fix ugly passing htmlelement just to do boosted/cut boolean
        generatePinkNoise(await ensureAudioReady, audioCtx, newFreq, page.eqBoostBox, page.eqGain6Box, 'pink-noise-processor');

    });
}

if (page.lineContainer) {
    page.lineContainer.addEventListener("mousemove", (e) => {
        if (!roundCheck(round, score)) return;
        const rect = page.lineContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;

        page.line.style.transform = `translateX(${x}px)`;
    });

    page.lineContainer.addEventListener("mouseenter", () => {
        if (!roundCheck(round, score)) return;
        page.line.style.display = "block";
    });

    page.lineContainer.addEventListener("mouseleave", () => {
        if (!roundCheck(round, score)) return;
        page.line.style.display = "none";
    });

    // TODO: add start/next round button to generate numbers
    // TODO: allow sound replay
    // TODO: allow modification of default audio length. slider. user saved

    page.lineContainer.addEventListener('click', function(event) {
        if (!roundCheck(round, score)) return;

        clicks += 1;

        const tol = getToleranceFromRound(round);
        const floor = gameFreqs.at(-1)/tol;
        const ceiling = gameFreqs.at(-1)*tol;

        // fetch current width of container (const as new function each click)
        const boxWidth = page.lineContainer.offsetWidth;
        const mouseLocation = Math.round(nFreqs*event.offsetX/boxWidth);

        const guessFreq = Math.round(freqs[mouseLocation]);
        page.guessFreqText.textContent = `Answer guessed: ${guessFreq}Hz`;
        const displayAnswer = Math.round(gameFreqs.at(-1));

        page.line.style.display = "none";

        audioCtx.suspend();

        if (guessFreq > floor && guessFreq < ceiling) {
            page.resultText.textContent = `Correct! it was ${displayAnswer}Hz`;
            score += 1;
            page.scoreText.textContent = `Score: ${score}`;
            page.eqGameGoButton.disabled = false;
        }
        else {
            page.resultText.textContent = `Incorrect :( it was ${displayAnswer}Hz.`;
            page.gameOverText.textContent = "Game Over";
            let [savedUsers, index] = getUserInfo();
            savedUsers[index].scores.push(score);
            localStorage.setItem('users', JSON.stringify(savedUsers));
            page.scoreText.textContent = "";
            round = 0;
            score = 0;
            page.eqGameGoButton.textContent = "New Game";
            page.eqGameGoButton.disabled = false;

            page.eqGameReplayButton.disabled = false;
            page.eqGameReplayButton.addEventListener('click', async() => {
                generatePinkNoise(await ensureAudioReady, audioCtx, gameFreqs.at(-1), page.eqBoostBox, page.eqGain6Box, 'pink-noise-processor');
            })
        }
    });
}