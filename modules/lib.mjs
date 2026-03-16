// room generation functions
export function createRoomCode() {
    let roomCode = "";
    const characters = "ABCDEFGHIJKLMNPQRSTUVWSYZ123456789";
    
    for (let i = 0; i < 6; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));

        if (i === 2) {
            roomCode += "-";
        }
    }
    return roomCode;
}

// ID generation functions
export function createUserID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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