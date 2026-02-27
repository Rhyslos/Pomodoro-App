import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { userManager } from '../singletons/userManager.mjs';
import { sessionManager } from '../singletons/sessionManager.mjs';

// Initialization functions
const router = express.Router();

// View routing functions
router.get('/views/:viewName', async (req, res) => {
    try {
        const viewPath = path.join(process.cwd(), 'views', `${req.params.viewName}.html`);
        const html = await fs.readFile(viewPath, 'utf-8');
        res.send(html);
    } catch (error) {
        res.status(404).send("View not found");
    }
});

// User routing functions
router.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await userManager.createUser(username);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/restore', async (req, res) => {
    try {
        const user = await userManager.restoreUser(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users/:userId', async (req, res) => {
    try {
        const user = await userManager.getUser(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:userId', async (req, res) => {
    try {
        await userManager.deleteUser(req.params.userId);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Session routing functions
router.post('/sessions', async (req, res) => {
    const { hostId } = req.body;
    const user = await userManager.getUser(hostId);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const room = await sessionManager.createSession(user); 
    res.status(201).json({ roomId: room.id });
});

router.get('/sessions/:roomId', (req, res) => {
    const room = sessionManager.getSession(req.params.roomId);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    res.json(room.getStatus());
});

router.post('/sessions/:roomId/join', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = sessionManager.getSession(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const user = await userManager.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const joined = room.join(user);
    if (!joined) return res.status(400).json({ error: "Room is full" });

    res.json(room.getStatus());
});

router.post('/sessions/:roomId/leave', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = sessionManager.getSession(roomId);
    if (room) {
        const user = await userManager.getUser(userId);
        if (user) room.leave(user);
    }
    
    res.status(200).json({ message: "Left room" });
});

router.delete('/sessions/:roomId', async (req, res) => {
    try {
        await sessionManager.endSession(req.params.roomId);
        res.status(200).json({ message: "Session ended" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/sessions/:roomId/action', (req, res) => {
    const { roomId } = req.params;
    const { action, payload } = req.body; 
    
    const room = sessionManager.getSession(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (action === "start") room.startSession();
    if (action === "stop") room.stopSession();
    if (action === "settings") room.updateSettings(payload);

    res.json(room.getStatus());
});

// Export functions
export default router;