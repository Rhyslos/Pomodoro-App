// A file for helper function not convenient to place elsewhere

import { randomBytes } from "node:crypto";

export const print = console.log;

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

export function createUserID(){
    let userID = crypto.randomUUID();
    return userID;
}

export function createFriendCode(){
    return randomBytes(Math.ceil(6))
        .toString('hex')
        .slice(0, 6)
        .toUpperCase();
}