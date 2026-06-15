import {maxIndex, geometricArray, getUserInfo, getToleranceFromRound, changeBackgroundColor} from "./utils.js";
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
            // simplest way to tick all others false
            // is to remove the current one from the array
            boxes.splice(i, 1);
            // then loop through everything else in the array
            for (let j = 0; j < boxes.length; j++) {
                boxes[j].checked = false;
            }
            // then add it back
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
    
    page.closeEqSettings.addEventListener("click", () => page.eqGameSettings.close());
}

if (page.openEqSettings && !eqSettingsCheck) {
    console.log('Error: at least 1 of html elements eqcutbox, boostbox, mixbox, or closeeq is missing');
}

// TODO: have the confirm button greyed out and unclickable until something in textbox!!
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
            // const prevents reassigning the variable, not modifying the object it points to!
            // aka const means "this variable always refers to the same object"
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

if (page.eqGameButton) {
    if (localStorage.getItem('users') != null) {
        page.eqGameButton.disabled = false;
    }
    else {
        page.eqGoErrorText.textContent = "Please navigate to Account and create a username first";
    }

    page.eqGameButton.addEventListener('click', async() => {

        page.guessFreqText.textContent = "";
        page.resultText.textContent = "";
        round += 1;

        page.eqGameButton.disabled = true;

        const newFreq = freqs[Math.floor(Math.random() * freqs.length)];
        gameFreqs.push(newFreq);

        await ensureAudioReady();

        const now = audioCtx.currentTime;
        const duration = 2.0;
        const fadeTime = 0.1;
        const audioGain = 0.2;
        const eqFreq = newFreq;
        const eqQ = 2.5;
        const sign = page.eqBoostBox.checked ? 1 : -1;
        const eqGain = sign*6;
        const pinkNoise = new AudioWorkletNode(audioCtx, 'pink-noise-processor');

        const eqBand = audioCtx.createBiquadFilter();
        eqBand.type = 'peaking';       
        eqBand.frequency.value = eqFreq;   
        eqBand.Q.value = eqQ;     
        eqBand.gain.value = eqGain;   

        const envelope = audioCtx.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(audioGain, now + fadeTime); // Quick fade in
        envelope.gain.setValueAtTime(audioGain, now + duration - fadeTime); // Sustain
        envelope.gain.linearRampToValueAtTime(0, now + duration); // Fade out

        pinkNoise.connect(eqBand);
        eqBand.connect(envelope);
        envelope.connect(audioCtx.destination);

        setTimeout(() => {
            envelope.disconnect();
            eqBand.disconnect();
            pinkNoise.disconnect();
        }, (duration + 0.05) * 1000);
    });
}

function roundCheck(round, score) {
    if (round === score + 1) {
        return true;
    }
    else if (round === score) {
        return false;
    }
    else {
        throw new Error(`Error: round and score number are out of sync. Round: ${round}. Score: ${score}.`);
    }
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

        if (guessFreq > floor && guessFreq < ceiling) {
            page.resultText.textContent = `Correct! it was ${displayAnswer}Hz`;
            score += 1;
            page.scoreText.textContent = `Score: ${score}`;
            page.eqGameButton.disabled = false;
        }
        else {
            page.resultText.textContent = `Incorrect :( it was ${displayAnswer}Hz.`;
            // page.gameOverText.textContent = "Game Over";
            let [savedUsers, index] = getUserInfo();
            savedUsers[index].scores.push(score);
            localStorage.setItem('users', JSON.stringify(savedUsers));
            page.scoreText.textContent = "";
            round = 0;
            score = 0;
            page.eqGameButton.disabled = false;
        }
    });
}