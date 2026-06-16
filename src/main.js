import {maxIndex, adjIndex, geometricArray, getUserInfo, generatePinkNoise, getToleranceFromRound, roundCheck, changeBackgroundColor} from "./utils.js";
import * as page from "./elements.js";

const audioCtx = new AudioContext();

// TODO: work out how to save different score types depending on game setting

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

    page.eqGain3Box.addEventListener('click', function(event) {
        this.checked = true;
        page.eqGain6Box.checked = false;
        savedUsers[index].eqGain = "3dB";
        localStorage.setItem('users', JSON.stringify(savedUsers));
    })
    page.eqGain6Box.addEventListener('click', function(event) {
        this.checked = true;
        page.eqGain3Box.checked = false;
        savedUsers[index].eqGain = "6dB";
        localStorage.setItem('users', JSON.stringify(savedUsers));
    })

    if (index || index === 0) {
        const eqChoiceSetting = savedUsers[index].eqChoice;
        if (eqChoiceSetting === 'boost') {
            page.eqBoostBox.checked = true;
        }
        else if (eqChoiceSetting === 'cut') {
            page.eqCutBox.checked = true;
        }
        const eqGainSetting = savedUsers[index].eqGain;
        if (eqGainSetting === "6dB") {
            page.eqGain6Box.checked = true;
        }
        else if (eqGainSetting === "3dB") {
            page.eqGain3Box.checked = true;
        }
    }

    page.closeEqSettings.addEventListener("click", () => page.eqGameSettings.close());
}

if (page.openEqSettings && !eqSettingsCheck) {
    console.log('Error: at least 1 of html elements eqcutbox, boostbox, mixbox, or closeeq is missing');
}

if (page.eqDurationSlider) {
    // TODO: make it a stepped slider, always using the 0.5 values?
    // this would probably mean reworking how we fill the values...
    let [savedUsers, index] = getUserInfo();
    const shortestTime = 0.5;
    const longestTime = 5;
    const linspace = (start, end, numVals) =>
        Array.from({ length: numVals }, (_, i) =>
            start + (i * (end - start)) / (numVals - 1)
        );
    const durationValues = linspace(shortestTime, longestTime, 101);

    if (index || index === 0) {
        const readDuration = savedUsers[index].duration;
        const mapTo0 = readDuration - shortestTime;
        const writeSlider = mapTo0*100/(longestTime-shortestTime);
        page.eqDurationSlider.value = writeSlider;
        const displayDuration = (readDuration).toFixed(2);
        page.eqDurationDisplayText.textContent = displayDuration;;
    }

    page.eqDurationSlider.addEventListener('input', function(event) {
        const displayDuration = Number(durationValues[this.value].toFixed(2));
        page.eqDurationDisplayText.textContent = displayDuration;
    })
    page.eqDurationSlider.addEventListener('change', function(event) {
        let [savedUsers, index] = getUserInfo();
        const storeDuration = Number(durationValues[this.value].toFixed(2))
        savedUsers[index].duration = storeDuration;
        localStorage.setItem('users', JSON.stringify(savedUsers));
    })
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
                eqGain: "6dB",
                duration: 2.0,
                scores: [],
            }
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // probably jank af workaround but it is doing the job
        // TODO: we saw console error here about savedUsers did not have length when it was called here
        // i believe this is the root of the click achieving nothing problem
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
                eqGain: "6dB",
                duration: 2.0,
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
let gameFreqs = [];

if (page.eqGameGoButton) {
    page.eqGameGoButton.textContent = "New Game";
    if (localStorage.getItem('users') != null) {
        page.eqGameGoButton.disabled = false;
    }
    else {
        // TODO: also disable settings button when no user...
        page.eqGoErrorText.textContent = "Please navigate to Account and create a username first";
    }

    page.eqGameGoButton.addEventListener('click', async() => {

        let [savedUsers, index] = getUserInfo();

        page.gameOverText.textContent = "";
        page.guessFreqText.textContent = "";
        page.resultText.textContent = "";
        page.answerLine.style.display = "none";
        page.floorLine.style.display = "none";
        page.ceilingLine.style.display = "none";
        round += 1;
        page.eqGameGoButton.textContent = "Next Round";
        page.eqGameGoButton.disabled = true;

        const newFreq = freqs[Math.floor(Math.random() * freqs.length)];
        gameFreqs.push(newFreq);

        const durationSetting = savedUsers[index].duration;

        // TODO: fix ugly passing htmlelement just to do boosted/cut boolean
        generatePinkNoise(await ensureAudioReady, audioCtx, newFreq, durationSetting, page.eqBoostBox, page.eqGain6Box, 'pink-noise-processor');

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

    page.lineContainer.addEventListener('click', function(event) {
        if (!roundCheck(round, score)) return;

        const answer = gameFreqs.at(-1);
        const tol = getToleranceFromRound(round);
        const floor = answer/tol;
        const ceiling = answer*tol;

        // fetch current width of container (const as new function each click)
        const boxWidth = this.offsetWidth;
        const mouseLocation = Math.round(nFreqs*event.offsetX/boxWidth);

        const guessFreq = Math.round(freqs[mouseLocation]);
        page.guessFreqText.textContent = `Answer guessed: ${guessFreq}Hz`;
        
        const displayAnswer = Math.round(answer);

        const guessFloor = guessFreq/tol;
        const guessCeiling = guessFreq*tol;

        const answerAsFreqIdx = adjIndex(answer, freqs);
        const answerAsPixels = boxWidth*(answerAsFreqIdx/nFreqs);
        const floorAsFreqIdx = adjIndex(guessFloor, freqs);
        const floorAsPixels = boxWidth*(floorAsFreqIdx/nFreqs);
        const ceilingAsFreqIdx = adjIndex(guessCeiling, freqs);
        const ceilingAsPixels = boxWidth*(ceilingAsFreqIdx/nFreqs);
        
        page.answerLine.style.marginLeft = `${answerAsPixels}px`;
        page.floorLine.style.marginLeft = `${floorAsPixels}px`;
        page.floorLine.style.display = "block";
        page.ceilingLine.style.marginLeft = `${ceilingAsPixels}px`;
        page.ceilingLine.style.display = "block";
        page.line.style.display = "none";

        audioCtx.suspend();

        if (guessFreq > floor && guessFreq < ceiling) {
            page.answerLine.style.background = "green";
            page.answerLine.style.display = "block";
            page.resultText.textContent = `Correct! it was ${displayAnswer}Hz`;
            score += 1;
            page.scoreText.textContent = `Score: ${score}`;
            page.eqGameGoButton.disabled = false;
        }
        else {
            page.resultText.textContent = `Incorrect :( it was ${displayAnswer}Hz.`;
            page.answerLine.style.background = "red";
            page.answerLine.style.display = "block";
            // page.gameOverText.textContent = "Game Over";
            let [savedUsers, index] = getUserInfo();
            const durationSetting = savedUsers[index].duration;
            savedUsers[index].scores.push(score);
            localStorage.setItem('users', JSON.stringify(savedUsers));
            page.scoreText.textContent = "";
            round = 0;
            score = 0;
            page.eqGameGoButton.textContent = "New Game";
            page.eqGameGoButton.disabled = false;

            page.eqGameReplayButton.disabled = false;
            page.eqGameReplayButton.addEventListener('click', async() => {
                generatePinkNoise(await ensureAudioReady, audioCtx, gameFreqs.at(-1), durationSetting, page.eqBoostBox, page.eqGain6Box, 'pink-noise-processor');
            })
        }
    });
}