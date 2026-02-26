import express from 'express';
import { userManager } from '../singletons/userManager.mjs';
import { sessionManager } from '../singletons/sessionManager.mjs';

// Initialization functions
const router = express.Router();

// User routes
router.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await userManager.createUser(username);
        res.status(201).json(user);
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

// Session routes
router.post('/sessions', (req, res) => {
    const { hostId } = req.body;
    const room = sessionManager.createSession({ id: hostId, username: "Host" }); 
    res.status(201).json({ roomId: room.id });
});

router.get('/sessions/:roomId', (req, res) => {
    const room = sessionManager.getSession(req.params.roomId);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    res.json(room.getStatus());
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