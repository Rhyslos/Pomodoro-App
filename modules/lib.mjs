// A file for helper function not convenient to place elsewhere

function createRoomCode(){
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

function GenerateUserID(){
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    const randomValues = new Uint8Array;
    crypto.getRandomValues(randomValues);

    let result = "";
    //for(let i = 0; i < )
    const encodedString = btoa
}