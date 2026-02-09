import express from 'express';
import { createNewUser } from '../modules/user.mjs'

const router = express.Router();
const user   = new user();

router.post('/users', (req, res) => {
    const desiredUsername = req.body.username;
    if(!desiredUsername || desiredUsername.length < 3) {
        return res.status(400).json({error: "The username is too short"});
    }
} )