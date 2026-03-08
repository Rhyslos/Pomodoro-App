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
    "Error:": { en: "Error:", no: "Feil:", ko: "오류:" }
};

// language functions
export function getBrowserLang() {
    const lang = navigator.language.slice(0, 2);
    if (['en', 'no', 'ko'].includes(lang)) return lang;
    return 'en';
}

// translation functions
export function t(key) {
    const lang = getBrowserLang();
    if (dictionary[key] && dictionary[key][lang]) return dictionary[key][lang];
    return dictionary[key]?.en || key;
}