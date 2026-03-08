// dictionary variables
const dictionary = {
    "Please enter both username and password": { en: "Please enter both username and password", no: "Vennligst skriv inn både brukernavn og passord", ko: "사용자 이름과 비밀번호를 모두 입력하십시오" },
    "You must agree to the Terms of Service and Privacy Policy to create an account.": { en: "You must agree to the Terms of Service and Privacy Policy to create an account.", no: "Du må godta vilkårene for bruk og personvernerklæringen for å opprette en konto.", ko: "계정을 만들려면 서비스 약관 및 개인 정보 보호 정책에 동의해야 합니다." },
    "Password updated successfully.": { en: "Password updated successfully.", no: "Passordet ble oppdatert.", ko: "비밀번호가 성공적으로 업데이트되었습니다." },
    "Session has ended or you were disconnected.": { en: "Session has ended or you were disconnected.", no: "Økten er avsluttet eller du ble frakoblet.", ko: "세션이 종료되었거나 연결이 끊어졌습니다." },
    "Please enter a room code": { en: "Please enter a room code", no: "Vennligst skriv inn en romkode", ko: "방 코드를 입력하십시오" },
    "Task name is required": { en: "Task name is required", no: "Oppgavenavn er påkrevd", ko: "작업 이름이 필요합니다" },
    "Room code copied to clipboard!": { en: "Room code copied to clipboard!", no: "Romkode kopiert til utklippstavlen!", ko: "방 코드가 클립보드에 복사되었습니다!" },
    "Enter new display name:": { en: "Enter new display name:", no: "Skriv inn nytt visningsnavn:", ko: "새 표시 이름을 입력하십시오:" },
    "Enter a new password:": { en: "Enter a new password:", no: "Skriv inn nytt passord:", ko: "새 비밀번호를 입력하십시오:" },
    "Error:": { en: "Error:", no: "Feil:", ko: "오류:" },
    "Join Pomodoro": { en: "Join Pomodoro", no: "Bli med i Pomodoro", ko: "뽀모도로 시작하기" },
    "Login": { en: "Login", no: "Logg inn", ko: "로그인" },
    "Create Account": { en: "Create Account", no: "Opprett konto", ko: "계정 생성" },
    "Toggle Theme": { en: "Toggle Theme", no: "Bytt tema", ko: "테마 변경" },
    "Set Name Color": { en: "Set Name Color", no: "Velg farge på navn", ko: "이름 색상 설정" },
    "Logout": { en: "Logout", no: "Logg ut", ko: "로그아웃" },
    "Display Name": { en: "Display Name", no: "Visningsnavn", ko: "표시 이름" },
    "Password": { en: "Password", no: "Passord", ko: "비밀번호" }
};

// language functions
export function getBrowserLang() {
    // Check for manual override first
    const savedLang = localStorage.getItem('pomodoro_lang');
    if (savedLang && ['en', 'no', 'ko'].includes(savedLang)) return savedLang;

    const lang = navigator.language.slice(0, 2);
    if (['en', 'no', 'ko'].includes(lang)) return lang;
    return 'en';
}

export function setLanguage(langCode) {
    if (['en', 'no', 'ko'].includes(langCode)) {
        localStorage.setItem('pomodoro_lang', langCode);
        window.location.reload(); // Reload to apply changes everywhere
    }
}

// translation functions
export function t(key) {
    const lang = getBrowserLang();
    if (dictionary[key] && dictionary[key][lang]) return dictionary[key][lang];
    return dictionary[key]?.en || key;
}