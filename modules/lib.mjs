// room generation functions
export function createRoomCode() {
    let RoomCode = "";
    const characters = "ABCDEFGHIJKLMNPQRSTUVWSYZ123456789";
    const randomArray = new Uint32Array(6);
    crypto.getRandomValues(randomArray);

    for (let i = 0; i < 6; i++) {
        RoomCode += characters.charAt(randomArray[i] % characters.length);

        if (i === 2) {
            RoomCode += "-";
        }
    }
    return RoomCode;
}

// ID generation functions
export function createUserID() {
    return crypto.randomUUID();
}

// ID generation functions
export function createFriendCode() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const codeSections = {
        first:  hex.slice(0, 4),    
        second: hex.slice(4, 7),    
        third:  hex.slice(7, 11),   
    };

    return `${codeSections.first}-${codeSections.second}-${codeSections.third}`;
}