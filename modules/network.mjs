import { t, getBrowserLang } from '/lang/client_i18n.mjs';
import { showToast, toggleOfflineBanner } from './ui.mjs';
import { state } from './state.mjs';
import { startSSE } from './roomClient.mjs';
import { logoutAccount } from './auth.mjs';

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
        } else if (error.status !== 401) {
            showToast(`${t("Error:")} ${error.message}`, true);
        }
        
        throw error;
    }
}

// network event functions
export function initNetworkListeners(initAppCallback) {
    window.addEventListener('offline', () => toggleOfflineBanner(true));

    window.addEventListener('online', async () => {
        toggleOfflineBanner(false);

        if (document.getElementById('login-screen')) {
            if (initAppCallback) initAppCallback();
            return;
        }

        if (state.currentUser) {
            try {
                const user = await makeRequest('/api/users/me', 'GET');
                if (user) {
                    state.currentUser = user;
                    localStorage.setItem('pomodoro_user', JSON.stringify(user));

                    if (state.currentRoomId) {
                        startSSE();
                    }
                }
            } catch (error) {
                if (error.status === 401) {
                    logoutAccount(); 
                }
            }
        }
    });

    if (!navigator.onLine) {
        toggleOfflineBanner(true);
    }
}