// A file for helper function not convenient to place elsewhere

import { randomBytes } from "node:crypto";

export const print = console.log;

// --- Pomodoro ---
export function createRoomCode(){
    let RoomCode    = "";
    let characters  = "ABCDEFGHIJKLMNPQRSTUVWSYZ123456789"

    for ( let i = 0; i < 6; i++ ) {
        RoomCode += characters.charAt(Math.floor(Math.random() * characters.length));

        if(i === 2){
            RoomCode += "-"
        }
    }
    return RoomCode;
}

// --- Users ---
export function createUserID(){
    let userID = crypto.randomUUID();
    return userID;
}

export function createFriendCode() {
    const bytes = randomBytes(6);
    const hex = bytes.toString("hex").toUpperCase();

    const codeSections = {
        first:  hex.slice(0, 4),    // xxxx
        second: hex.slice(4, 7),    // xxx
        third:  hex.slice(7, 11),   // xxxx
    };

    return `${codeSections.first}-${codeSections.second}-${codeSections.third}`;
}