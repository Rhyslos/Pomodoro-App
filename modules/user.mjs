import { GenerateUserID } from "./lib.mjs";
import database from "../database/database.sql"

class user{
    
    createNewUser(username){
        const newUserID = GenerateUserID();

        try{
            const stmt = database.prepare('INSERT INTO users (user_id, username) VALUES (?, ?)');
            stmt.run(newID, username);
            return{id: newID, username: username}
        }
    }

}