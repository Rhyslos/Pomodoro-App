// string sanitization functions
export function sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// object sanitization functions
export function sanitizePayload(payload) {
    if (typeof payload !== 'object' || payload === null) {
        return sanitizeString(payload);
    }

    if (Array.isArray(payload)) {
        return payload.map(item => sanitizePayload(item));
    }

    const sanitized = {};
    for (const key in payload) {
        sanitized[key] = sanitizePayload(payload[key]);
    }
    
    return sanitized;
}