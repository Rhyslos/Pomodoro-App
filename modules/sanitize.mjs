// sanitization functions
export function sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    const decoded = input
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'");
        
    return decoded.replace(/[<>]/g, '').trim();
}