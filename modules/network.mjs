import { t, getBrowserLang } from '/lang/client_i18n.mjs';

// network functions
export async function makeRequest(url, method = "GET", body = null, responseType = "json") {
    try {
        const options = {
            method: method,
            headers: {
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
        console.error("API Error:", error);
        
        if (error.name === 'TypeError') {
            alert(t("Network connection lost. Please check your internet."));
        } else if (error.status !== 401) {
            alert(`${t("Error:")} ${error.message}`);
        }
        
        return null;
    }
}