import { t, getBrowserLang } from '/Lang/client_i18n.mjs';

export async function makeRequest(url, method = "GET", body = null, responseType = "json") {
    try {
        const options = {
            method: method,
            headers: {
                // This now uses the override if it exists
                "Accept-Language": getBrowserLang() 
            }
        };

        const token = localStorage.getItem('pomodoro_token');
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        
        if (body && method !== "GET") {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Request failed");
        }

        if (responseType === "text") {
            return await response.text();
        }
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        alert(`${t("Error:")} ${error.message}`);
        return null;
    }
}