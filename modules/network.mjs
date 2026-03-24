import { t, getBrowserLang } from '/lang/client_i18n.mjs';
import { showToast } from './ui.mjs';

// network functions
export async function makeRequest(url, method = "GET", body = null, responseType = "json") {
    try {
        const options = {
            method: method,
            headers: {
                "Accept-Language": getBrowserLang()
            },
            credentials: "same-origin" 
        };
        
        if (body && method !== "GET") {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            let errorMessage = "Request failed";
            try {
                const errData = await response.json();
                errorMessage = errData.error || errorMessage;
            } catch (parseError) {
                errorMessage = `HTTP Error: ${response.status}`;
            }

            const error = new Error(errorMessage);
            error.status = response.status; 
            throw error;
        }

        if (responseType === "text") {
            return await response.text();
        }
        return await response.json();
        
    } catch (error) {
        if (error.status !== 401 && error.status !== 408) {
            console.error("API Error:", error);
        }
        
        if (error.name === 'TypeError' || error.status === 408) {
            showToast(t("Network connection lost. Please check your internet."), true);
        } else if (error.status !== 401) {
            showToast(`${t("Error:")} ${error.message}`, true);
        }
        throw error;
    }
}