// dictionary variables
const dictionary = {
    "Unauthorized": { en: "Unauthorized", no: "Uautorisert", ko: "권한 없음" },
    "Invalid session": { en: "Invalid session", no: "Ugyldig økt", ko: "유효하지 않은 세션" },
    "Missing fields": { en: "Missing fields", no: "Mangler felt", ko: "필드 누락" },
    "Username taken": { en: "Username taken", no: "Brukernavn er opptatt", ko: "사용 중인 사용자 이름" },
    "Invalid credentials": { en: "Invalid credentials", no: "Ugyldig pålogging", ko: "잘못된 자격 증명" },
    "User not found": { en: "User not found", no: "Bruker ikke funnet", ko: "사용자를 찾을 수 없음" },
    "Room not found": { en: "Room not found", no: "Rom ikke funnet", ko: "방을 찾을 수 없음" },
    "Room is locked or full": { en: "Room is locked or full", no: "Rommet er låst eller fullt", ko: "방이 잠겨 있거나 가득 찼습니다" },
    "View not found": { en: "View not found", no: "Visning ikke funnet", ko: "뷰를 찾을 수 없음" }
};

// language functions
export function getLang(header) {
    if (!header) return 'en';
    const langs = header.split(',').map(l => l.split(';')[0].trim().slice(0, 2));
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