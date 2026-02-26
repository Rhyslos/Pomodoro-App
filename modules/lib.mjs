import { randomBytes } from "node:crypto";

// Export variables
export const print = console.log;

// Room generation functions
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

// ID generation functions
export function createUserID(){
    let userID = crypto.randomUUID();
    return userID;
}

export function createFriendCode() {
    const bytes = randomBytes(6);
    const hex = bytes.toString("hex").toUpperCase();

    const codeSections = {
        first:  hex.slice(0, 4),    
        second: hex.slice(4, 7),    
        third:  hex.slice(7, 11),   
    };

    return `${codeSections.first}-${codeSections.second}-${codeSections.third}`;
}