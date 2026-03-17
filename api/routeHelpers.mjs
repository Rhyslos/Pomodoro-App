import { sessionManager } from '../singletons/sessionManager.mjs';
import { t, getLang } from '../lang/server_i18n.mjs';
import { sanitizeString } from '../modules/sanitize.mjs';

// request interceptors
export function attachLanguage(req, res, next) {
    req.lang = getLang(req.headers['accept-language']);
    next();
}

// request interceptors
export function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        }
    }
    next();
}

// request interceptors
export function requireRoom(req, res, next) {
    const room = sessionManager.getSession(req.params.roomId);
    if (!room) {
        return res.status(404).json({ error: t("Room not found", req.lang) });
    }
    req.room = room;
    next();
}

// request interceptors
export function requireHost(req, res, next) {
    if (req.room.host.userId !== req.user.userId) {
        return res.status(403).json({ error: t("Unauthorized", req.lang) });
    }
    next();
}

// response helpers
export function setAuthCookie(res, token) {
    res.cookie('pomodoro_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400000
    });
}

// error handling wrappers
export function catchAsync(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(error => {
            res.status(500).json({ error: error.message });
        });
    };
}