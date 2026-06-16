import {myBody} from "./elements.js";

export function maxIndex(arr) {
    let idx = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > arr[idx]) {
            idx = i;
        }
    }
    return idx;
}

export function geometricArray(start, end, n) {
    const ratio = Math.pow(end / start, 1 / (n - 1));
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(start * Math.pow(ratio, i));
    }
    return arr;
}

export function getUserInfo() {
    const savedUsers = JSON.parse(localStorage.getItem('users'))
    let activeUser = false;
    let index;
    if (savedUsers) {
        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].active === true) {
                activeUser = true;
                index = i
            }
        } 
    }
    return activeUser ? [savedUsers, index] : [null, null];
}

export function generatePinkNoise(awaitFunction, audioCtx, newFreq, durationSetting, htmlEqBoostBox, html6Box, processorName) {

    awaitFunction();

    console.log(durationSetting);

    const now = audioCtx.currentTime;
    const fadeTime = 0.1;
    const audioGain = 0.2;
    const eqFreq = newFreq;
    const eqQ = 2.5;
    const sign = htmlEqBoostBox.checked ? 1 : -1;
    const eqGain = html6Box.checked ? sign*6 : sign*3;
    const pinkNoise = new AudioWorkletNode(audioCtx, processorName);

    const eqBand = audioCtx.createBiquadFilter();
    eqBand.type = 'peaking';       
    eqBand.frequency.value = eqFreq;   
    eqBand.Q.value = eqQ;     
    eqBand.gain.value = eqGain;   

    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(audioGain, now + fadeTime); // Quick fade in
    envelope.gain.setValueAtTime(audioGain, now + durationSetting - fadeTime); // Sustain
    envelope.gain.linearRampToValueAtTime(0, now + durationSetting); // Fade out

    pinkNoise.connect(eqBand);
    eqBand.connect(envelope);
    envelope.connect(audioCtx.destination);

    setTimeout(() => {
        envelope.disconnect();
        eqBand.disconnect();
        pinkNoise.disconnect();
    }, (durationSetting + 0.05) * 1000);
}

export function roundCheck(round, score) {
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

export function getToleranceFromRound(round) {
    const initTol = 2;
    const endTol = 1.1;
    const arr = geometricArray(initTol, endTol, 20);
    const tol = round > 20 ? endTol : arr[round-1];
    return tol;
}

export function changeBackgroundColor() {
    // generate a random hex color (e.g., #3498db)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    myBody.style.backgroundColor = randomColor;
}