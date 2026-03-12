import { randomBytes, randomInt, randomUUID } from "node:crypto";

// Room generation functions
export function createRoomCode() {
    let RoomCode = "";
    const characters = "ABCDEFGHIJKLMNPQRSTUVWSYZ123456789";

    for (let i = 0; i < 6; i++) {
        RoomCode += characters.charAt(randomInt(0, characters.length));

        if (i === 2) {
            RoomCode += "-";
        }
    }
    return RoomCode;
}

// ID generation functions
export function createUserID() {
    let userID = randomUUID();
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