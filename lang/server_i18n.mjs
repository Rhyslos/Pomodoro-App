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
    "View not found": { en: "View not found", no: "Visning ikke funnet", ko: "뷰를 찾을 수 없음" },
    
    // security variables
    "Too many attempts. Please try again later.": { en: "Too many attempts. Please try again later.", no: "For mange forsøk. Vennligst prøv igjen senere.", ko: "시도 횟수가 너무 많습니다. 나중에 다시 시도해 주세요." },
    "Invalid view name": { en: "Invalid view name", no: "Ugyldig visningsnavn", ko: "잘못된 뷰 이름" },
    "Forbidden": { en: "Forbidden", no: "Forbudt", ko: "금지됨" },
    "Task not found": { en: "Task not found", no: "Oppgave ikke funnet", ko: "작업을 찾을 수 없음" },
    "Debug mode is disabled": { en: "Debug mode is disabled", no: "Feilsøkingsmodus er deaktivert", ko: "디버그 모드가 비활성화되었습니다" },
    "Failed to generate user": { en: "Failed to generate user", no: "Kunne ikke generere bruker", ko: "사용자 생성 실패" },
    "Too many attempts. Locked for 15 minutes.": { en: "Too many attempts. Locked for 15 minutes.", no: "For mange forsøk. Låst i 15 minutter.", ko: "시도 횟수가 너무 많습니다. 15분 동안 잠겼습니다." },
};

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