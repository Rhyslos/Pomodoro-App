import { t } from '/lang/client_i18n.mjs';
import { handleLogin, handleRegister, deleteAccount, changeDisplayName, changePassword } from './auth.mjs';
import { translatePage } from './ui.mjs'; // 1. Add this import

// component functions
class UserWidget extends HTMLElement {
    connectedCallback() {
        this.mode = this.getAttribute('mode') || 'auth';
        this.render();
    }

    // ui generation functions
    render() {
        if (this.mode === 'auth') {
            this.innerHTML = `
                <div class="form-group">
                    <input type="text" id="wc-username" placeholder="${t('Display Name')}">
                    <input type="password" id="wc-password" placeholder="${t('Password')}">
                </div>
                
                <div class="tos-container">
                    <input type="checkbox" id="wc-tos-consent">
                    <label for="wc-tos-consent">
                        <span data-t="I accept the">${t('I accept the')}</span> 
                        <a href="#" data-t="Terms of Service" onclick="window.loadPolicy('tos'); return false;">${t('Terms of Service')}</a> 
                        <span data-t="and">${t('and')}</span> 
                        <a href="#" data-t="Privacy Policy" onclick="window.loadPolicy('privacy'); return false;">${t('Privacy Policy')}</a>
                    </label>
                </div>

                <div class="auth-buttons">
                    <button id="wc-login-btn" data-t="Login">${t('Login')}</button>
                    <button id="wc-register-btn" data-t="Create Account">${t('Create Account')}</button>
                </div>
            `;

            // user event functions
            this.querySelector('#wc-login-btn').addEventListener('click', () => {
                const user = this.querySelector('#wc-username').value;
                const pass = this.querySelector('#wc-password').value;
                handleLogin(user, pass);
            });

            this.querySelector('#wc-register-btn').addEventListener('click', () => {
                const user = this.querySelector('#wc-username').value;
                const pass = this.querySelector('#wc-password').value;
                const consented = this.querySelector('#wc-tos-consent').checked;
                handleRegister(user, pass, consented);
            });
            
        } else if (this.mode === 'profile') {
            // ... (keep your existing profile render code here)
        }

        // 2. Force translation of the newly injected HTML
        translatePage(); 
    }
}

// initialization functions
if (!customElements.get('user-widget')) {
    customElements.define('user-widget', UserWidget);
}