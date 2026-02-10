import { GenerateUserID } from "./lib.mjs";
import database from "../database/database.mjs"

class user{
    
    createNewUser(username){
        const newUserID = GenerateUserID();

        try{
            const stmt = database.prepare('INSERT INTO users (user_id, username) VALUES (?, ?)');
            stmt.run(newID, username);
            return{id: newID, username: username}
        } catch (error){
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'){
                console.warn("Primary Key allready exists!");
                return this.createNewUser(username);
            }
            throw error;
        }
    }

}