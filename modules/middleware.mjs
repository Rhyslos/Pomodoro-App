import { userManager } from '../singletons/userManager.mjs';
import { t, getLang } from '../lang/server_i18n.mjs';

// rate limiting variables
const authAttempts = new Map();
const windowMs = 900000; 

// memory management functions
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of authAttempts.entries()) {
        if (now - record.firstAttempt > windowMs) {
            authAttempts.delete(ip);
        }
    }
}, windowMs);

// middleware functions
export const parseCookies = (request) => {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name?.trim();
        if (!name) return;
        
        const value = rest.join('=').trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
};

export const authRateLimiter = (req, res, next) => {
    const lang = getLang(req.headers['accept-language']);
    const ip = req.ip;
    const now = Date.now();
    const maxAttempts = 5;

    if (!authAttempts.has(ip)) {
        authAttempts.set(ip, { count: 1, firstAttempt: now });
        return next();
    }

    const record = authAttempts.get(ip);

    if (now - record.firstAttempt > windowMs) {
        authAttempts.set(ip, { count: 1, firstAttempt: now });
        return next();
    }

    record.count++;

    if (record.count > maxAttempts) {
        return res.status(429).json({ error: t("Too many attempts. Please try again later.", lang) });
    }

    next();
};

export const requireAuth = async (req, res, next) => {
    const lang = getLang(req.headers['accept-language']);
    
    const cookies = parseCookies(req);
    const token = cookies.pomodoro_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: t("Unauthorized", lang) });

    const user = await userManager.getUserByToken(token);
    if (!user) return res.status(401).json({ error: t("Invalid session", lang) });

    req.user = user;
    req.token = token;
    next();
};