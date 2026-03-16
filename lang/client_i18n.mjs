// dictionary variables
let dictionary = {};

// initialization functions
export async function loadClientDictionary() {
    try {
        const res = await fetch('/locales/client.json');
        dictionary = await res.json();
    } catch (err) {
        console.warn("Failed to load client dictionary JSON");
    }
}

// language functions
export function getBrowserLang() {
    const savedLang = localStorage.getItem('pomodoro_lang');
    if (savedLang && ['en', 'no', 'ko'].includes(savedLang)) return savedLang;

    let lang = navigator.language.slice(0, 2);
    if (lang === 'nb' || lang === 'nn') lang = 'no';
    
    if (['en', 'no', 'ko'].includes(lang)) return lang;
    return 'en';
}

export function setLanguage(langCode) {
    if (['en', 'no', 'ko'].includes(langCode)) {
        localStorage.setItem('pomodoro_lang', langCode);
        window.location.reload(); 
    }
}

// translation functions
export function t(key) {
    const lang = getBrowserLang();
    if (dictionary[key] && dictionary[key][lang]) return dictionary[key][lang];
    return dictionary[key]?.en || key;
}