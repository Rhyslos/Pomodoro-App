// initialization
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'node:crypto';
import { userManager } from '../singletons/userManager.mjs';
import { sessionManager } from '../singletons/sessionManager.mjs';
import { t } from '../lang/server_i18n.mjs';
import { authRateLimiter, requireAuth } from '../modules/middleware.mjs';
import { attachLanguage, sanitizeBody, requireRoom, requireHost, setAuthCookie, catchAsync } from './routeHelpers.mjs';

const router = express.Router();

// global interceptors
router.use(attachLanguage);
router.use(sanitizeBody);

// view routes
router.get('/views/:viewName', catchAsync(async (req, res) => {
    const viewName = req.params.viewName;
    
    if (!/^[a-zA-Z0-9_-]+$/.test(viewName)) {
        return res.status(400).send(t("Invalid view name", req.lang));
    }

    const viewPath = path.join(process.cwd(), 'views', `${viewName}.html`);
    const html = await fs.readFile(viewPath, 'utf-8');
    res.send(html);
}));

// user routes
router.post('/users/register', authRateLimiter, catchAsync(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) return res.status(400).json({ error: t("Missing fields", req.lang) });

    const user = await userManager.createUser(username, password);
    if (!user) return res.status(409).json({ error: t("Username taken", req.lang) });

    const session = await userManager.loginUser(username, password);
    
    setAuthCookie(res, session.token);
    res.status(201).json({ user: session.user });
}));

router.post('/users/login', authRateLimiter, catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const session = await userManager.loginUser(username, password);
    
    if (!session) return res.status(401).json({ error: t("Invalid credentials", req.lang) });
    
    setAuthCookie(res, session.token);
    res.status(200).json({ user: session.user });
}));

router.post('/users/logout', requireAuth, catchAsync(async (req, res) => {
    await userManager.logoutUser(req.token);
    res.clearCookie('pomodoro_token');
    res.status(200).json({ message: "Logged out" });
}));

router.get('/users/me', requireAuth, (req, res) => {
    res.json(req.user);
});

router.patch('/users/me', requireAuth, catchAsync(async (req, res) => {
    const updates = req.body;
    const updatedUser = await userManager.updateUser(req.user.userId, updates);
    
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    for (const [roomId, room] of sessionManager.sessions.entries()) {
        for (let user of room.users) {
            if (user.userId === updatedUser.userId) {
                room.updateUserCache(updatedUser); 
                break;
            }
        }
    }

    res.status(200).json(updatedUser);
}));

router.delete('/users/me', requireAuth, catchAsync(async (req, res) => {
    await userManager.deleteUser(req.user.userId);
    res.clearCookie('pomodoro_token');
    res.status(200).json({ message: "Account deleted" });
}));

// room core routes
router.post('/sessions', requireAuth, catchAsync(async (req, res) => {
    const settings = req.body.settings || {};
    const room = await sessionManager.createSession(req.user, settings);
    res.status(201).json(room.getStatus());
}));

router.get('/sessions/:roomId', requireAuth, requireRoom, (req, res) => {
    const isMember = Array.from(req.room.users).some(user => user.userId === req.user.userId);
    if (!isMember) {
        return res.status(403).json({ error: t("Unauthorized", req.lang) });
    }
    res.json(req.room.getStatus());
});

router.get('/sessions/:roomId/events', requireAuth, requireRoom, (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write(`data: ${JSON.stringify(req.room.getStatus())}\n\n`);

    req.room.addClient(res, req.user.userId);

    req.on('close', () => {
        req.room.removeClient(res);
    });
});

router.post('/sessions/:roomId/join', requireAuth, requireRoom, catchAsync(async (req, res) => {
    const joined = req.room.join(req.user);
    if (!joined) return res.status(403).json({ error: t("Room is locked or full", req.lang) });
    res.json(req.room.getStatus());
}));

router.post('/sessions/:roomId/leave', requireAuth, requireRoom, catchAsync(async (req, res) => {
    req.room.leave(req.user);
    res.status(200).json({ message: "Left room" });
}));

router.delete('/sessions/:roomId', requireAuth, requireRoom, requireHost, catchAsync(async (req, res) => {
    req.room.terminate(); 
    await sessionManager.endSession(req.params.roomId);
    res.status(200).json({ message: "Session ended" });
}));

// room action routes
router.post('/sessions/:roomId/action', requireAuth, requireRoom, requireHost, (req, res) => {
    const { action, payload = {} } = req.body;

    if (action === "start") req.room.startSession();
    if (action === "pause") req.room.pauseSession();
    if (action === "resume") req.room.resumeSession();
    if (action === "stop") req.room.stopSession();
    if (action === "settings") req.room.updateSettings(payload);

    res.json(req.room.getStatus());
});

router.post('/sessions/:roomId/tasks', requireAuth, requireRoom, (req, res) => {
    const task = { 
        id: crypto.randomUUID(), 
        userId: req.user.userId,
        username: req.user.username,
        color: req.user.color,
        name: req.body.name, 
        description: req.body.description, 
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    req.room.addTask(task);
    res.status(201).json(task);
});

router.patch('/sessions/:roomId/tasks/:taskId', requireAuth, requireRoom, (req, res) => {
    const task = req.room.tasks.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: t("Task not found", req.lang) });
    if (task.userId !== req.user.userId) return res.status(403).json({ error: t("Unauthorized", req.lang) });

    req.room.completeTask(req.params.taskId);
    res.status(200).json({ message: "Task completed" });
});

// room admin routes
router.post('/sessions/:roomId/lock', requireAuth, requireRoom, requireHost, (req, res) => {
    req.room.toggleLock(req.user.userId);
    res.status(200).json({ message: "Lock toggled" });
});

router.post('/sessions/:roomId/admin', requireAuth, requireRoom, requireHost, (req, res) => {
    const { targetId, action } = req.body;
    req.room.adminAction(req.user.userId, targetId, action);
    res.status(200).json({ message: "Admin action executed" });
});

// debug routes
router.post('/sessions/:roomId/debug/fake-user', requireAuth, requireRoom, catchAsync(async (req, res) => {
    if (!req.room.settings.debugMode) return res.status(403).json({ error: t("Debug mode is disabled", req.lang) });

    const randomId = Math.floor(Math.random() * 1000);
    const fakeName = `TestUser_${randomId}`;
    const fakeUser = await userManager.createUser(fakeName, "password");
    if (!fakeUser) return res.status(500).json({ error: t("Failed to generate user", req.lang) });

    req.room.join({ 
        userId: fakeUser.userId, 
        username: fakeUser.username, 
        color: fakeUser.color 
    });
    
    res.status(201).json({ message: "Fake user injected" });
}));

// export
export default router;