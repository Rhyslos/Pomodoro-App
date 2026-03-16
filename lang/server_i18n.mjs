import fs from 'fs';
import path from 'path';

// dictionary variables
let dictionary = {};

// initialization functions
export function loadDictionary() {
    try {
        const file = fs.readFileSync(path.join(process.cwd(),'lang', 'locales', 'server.json'), 'utf-8');
        dictionary = JSON.parse(file);
    } catch (err) {
        console.warn("Failed to load server dictionary JSON");
    }
}

// language functions
export function getLang(header) {
    if (!header) return 'en';
    
    const langs = header.split(',').map(l => {
        let code = l.split(';')[0].trim().slice(0, 2);
        if (code === 'nb' || code === 'nn') code = 'no';
        return code;
    });

    for (let l of langs) {
        if (['en', 'no', 'ko'].includes(l)) return l;
    }
    return 'en';
}

// translation functions
export function t(key, lang) {
    if (dictionary[key] && dictionary[key][lang]) return dictionary[key][lang];
    return dictionary[key]?.en || key;
}