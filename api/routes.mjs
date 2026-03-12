// Initialization functions
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'node:crypto';
import { userManager } from '../singletons/userManager.mjs';
import { sessionManager } from '../singletons/sessionManager.mjs';
import { t, getLang } from '../lang/server_i18n.mjs';
import { sanitizeString, sanitizePayload } from '../modules/sanitize.mjs';

const router = express.Router();

// Middleware functions
const requireAuth = async (req, res, next) => {
    const lang = getLang(req.headers['accept-language']);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: t("Unauthorized", lang) });

    const user = await userManager.getUserByToken(token);
    if (!user) return res.status(401).json({ error: t("Invalid session", lang) });

    req.user = user;
    req.token = token;
    next();
};

// View routing functions
router.get('/views/:viewName', async (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    try {
        const viewPath = path.join(process.cwd(), 'views', `${req.params.viewName}.html`);
        const html = await fs.readFile(viewPath, 'utf-8');
        res.send(html);
    } catch (error) {
        res.status(404).send(t("View not found", lang));
    }
});

// User routing functions
router.post('/users/register', async (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    try {
        const username = sanitizeString(req.body.username);
        const password = sanitizeString(req.body.password);
        
        if (!username || !password) return res.status(400).json({ error: t("Missing fields", lang) });

        const user = await userManager.createUser(username, password);
        if (!user) return res.status(409).json({ error: t("Username taken", lang) });

        const session = await userManager.loginUser(username, password);
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/login', async (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    try {
        const username = sanitizeString(req.body.username);
        const password = sanitizeString(req.body.password);
        const session = await userManager.loginUser(username, password);
        
        if (!session) return res.status(401).json({ error: t("Invalid credentials", lang) });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/logout', requireAuth, async (req, res) => {
    await userManager.logoutUser(req.token);
    res.status(200).json({ message: "Logged out" });
});

router.get('/users/me', requireAuth, (req, res) => {
    res.json(req.user);
});

router.patch('/users/me', requireAuth, async (req, res) => {
    try {
        const safeUpdates = sanitizePayload(req.body);
        const updatedUser = await userManager.updateUser(req.user.userId, safeUpdates);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/me', requireAuth, async (req, res) => {
    try {
        await userManager.deleteUser(req.user.userId);
        res.status(200).json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Session routing functions
router.post('/sessions', requireAuth, async (req, res) => {
    const safeSettings = sanitizePayload(req.body.settings);
    const room = await sessionManager.createSession(req.user, safeSettings); 
    res.status(201).json({ roomId: room.id });
});

router.get('/sessions/:roomId', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const room = sessionManager.getSession(req.params.roomId);
    
    if (!room) {
        return res.status(404).json({ error: t("Room not found", lang) });
    }

    const isMember = Array.from(room.users).some(user => user.userId === req.user.userId);
    if (!isMember) {
        return res.status(403).json({ error: t("Unauthorized", lang) });
    }

    res.json(room.getStatus());
});

router.post('/sessions/:roomId/join', requireAuth, async (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const { roomId } = req.params;

    const room = sessionManager.getSession(roomId);
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });

    const joined = room.join(req.user);
    if (!joined) return res.status(403).json({ error: t("Room is locked or full", lang) });

    res.json(room.getStatus());
});

router.post('/sessions/:roomId/leave', requireAuth, async (req, res) => {
    const { roomId } = req.params;
    const room = sessionManager.getSession(roomId);
    if (room) {
        room.leave(req.user);
    }
    res.status(200).json({ message: "Left room" });
});

router.delete('/sessions/:roomId', requireAuth, async (req, res) => {
    try {
        await sessionManager.endSession(req.params.roomId);
        res.status(200).json({ message: "Session ended" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routing functions
router.post('/sessions/:roomId/action', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const { roomId } = req.params;
    
    const action = sanitizeString(req.body.action); 
    const payload = sanitizePayload(req.body.payload); 
    
    const room = sessionManager.getSession(roomId);
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });

    if (room.host.userId !== req.user.userId) {
        return res.status(403).json({ error: t("Unauthorized", lang) });
    }

    if (action === "start") room.startSession();
    if (action === "pause") room.pauseSession();
    if (action === "resume") room.resumeSession();
    if (action === "stop") room.stopSession();
    if (action === "settings") room.updateSettings(payload);

    res.json(room.getStatus());
});

// Task routing functions
router.post('/sessions/:roomId/tasks', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const room = sessionManager.getSession(req.params.roomId);
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });

    const safeBody = sanitizePayload(req.body);
    
    const task = { 
        id: crypto.randomUUID(), 
        userId: req.user.userId,
        username: req.user.username,
        color: req.user.color,
        name: safeBody.name,
        description: safeBody.description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    room.addTask(task);
    res.status(201).json(task);
});

router.patch('/sessions/:roomId/tasks/:taskId', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const room = sessionManager.getSession(req.params.roomId);
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });

    const task = room.tasks.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: t("Task not found", lang) });
    if (task.userId !== req.user.userId) return res.status(403).json({ error: t("Unauthorized", lang) });

    room.completeTask(req.params.taskId);
    res.status(200).json({ message: "Task completed" });
});

// Admin routing functions
router.post('/sessions/:roomId/lock', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    const room = sessionManager.getSession(req.params.roomId);
    
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });
    
    room.toggleLock(req.user.userId);
    res.status(200).json({ message: "Lock toggled" });
});

router.post('/sessions/:roomId/admin', requireAuth, (req, res) => {
    const lang = getLang(req.headers['accept-language']);
    
    const targetId = sanitizeString(req.body.targetId);
    const action = sanitizeString(req.body.action);
    
    const room = sessionManager.getSession(req.params.roomId);
    
    if (!room) return res.status(404).json({ error: t("Room not found", lang) });

    room.adminAction(req.user.userId, targetId, action);
    res.status(200).json({ message: "Admin action executed" });
});

// Export functions
export default router;