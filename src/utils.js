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

export function changeBackgroundColor() {
    // generate a random hex color (e.g., #3498db)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    myBody.style.backgroundColor = randomColor;
}