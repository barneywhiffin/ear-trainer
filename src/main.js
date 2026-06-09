import {maxIndex, geometricArray, getUserInfo, changeBackgroundColor} from "./utils.js";
import * as page from "./elements.js";

const audioCtx = new AudioContext();

// need to think of a way of automatically aligning this better with graph axis
// , at all screen scalings
const freqs = geometricArray(45, 11000, 100);

// TODO: only bother running on specific audio related pages
window.addEventListener('load', async () => {
    if (page.usernameDisplay) {
        const [savedUsers, index] =  getUserInfo();
        if (index) {
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
        // .splice lets us remove the value at a certain index
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

        // crucially note that nowhere here is the modified data pushed back to local storage
    }
    await audioCtx.audioWorklet.addModule('../src/pink-noise.js');
});

async function ensureAudioReady() {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

// eq game popup windows
if (page.openEqHowto) {
    page.openEqHowto.addEventListener("click", () => page.eqGameHowto.showModal());
    page.closeEqHowto.addEventListener("click", () => page.eqGameHowto.close());
}

if (page.openEqSettings) {
    page.openEqSettings.addEventListener("click", () => page.eqGameSettings.showModal());
    page.closeEqSettings.addEventListener("click", () => page.eqGameSettings.close());
}

// TODO: eventually upgrade into a user class with scores

// most ideally, have the confirm button greyed out and unclickable until something in textbox!!
if (page.addUsernameButton) {
    page.addUsernameButton.addEventListener("click", function(event) {
        const username = page.usernameTextbox.value;
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
        for (let i = 0; i < savedUsers.length; i++) {
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
        page.usernameTextbox.value = "";
        if (page.usernameDisplay) {
            page.usernameDisplay.textContent = `Username: ${username}`;
        }
    })
}

if (page.myButton) {
    page.myButton.addEventListener('click', changeBackgroundColor);
}

// const gainSelection = document.getElementById("gain-select");

// if (gainSelection) {

// }

let round = 0;
let score = 0;
let clicks = 0;
let gameFreqs = [];

if (page.eqGameButton) {
    page.eqGameButton.addEventListener('click', async() => {
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

            page.guessFreqText.textContent = "";
            page.resultText.textContent = "";

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

if (page.lineContainer) {
    page.lineContainer.addEventListener("mousemove", (e) => {
        const rect = page.lineContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;

        page.line.style.transform = `translateX(${x}px)`;
    });

    page.lineContainer.addEventListener("mouseenter", () => {
        page.line.style.display = "block";
    });

    page.lineContainer.addEventListener("mouseleave", () => {
        page.line.style.display = "none";
    });

    // add start/next round button to generate numbers

    page.lineContainer.addEventListener('click', function(event) {
      
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
            const boxWidth = page.lineContainer.offsetWidth;
            const mouseLocation = Math.round(100*event.offsetX/boxWidth);

            const guessFreq = Math.round(freqs[mouseLocation]);
            page.guessFreqText.textContent = `Answer guessed: ${guessFreq}Hz`;
            const displayAnswer = Math.round(gameFreqs.at(-1));

            if (guessFreq > floor && guessFreq < ceiling) {
                page.resultText.textContent = `Correct! it was ${displayAnswer}Hz`;
                score += 1;
                page.scoreText.textContent = `Score: ${score}`;
            }
            else {
                page.resultText.textContent = `Incorrect :( it was ${displayAnswer}Hz`;
                let [savedUsers, index] = getUserInfo();
                // console.log(savedUsers);
                savedUsers[index].scores.push(score);
                localStorage.setItem('users', JSON.stringify(savedUsers));
                page.scoreText.textContent = `Score: 0`;
            }
            
        }
    });
}