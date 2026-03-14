import { t } from '/lang/client_i18n.mjs';
import { handleLogin, handleRegister, deleteAccount, changeDisplayName, changePassword } from './auth.mjs';

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
            this.innerHTML = `
                <li><a href="#" id="wc-edit-name" data-t="Change Name">${t('Change Name')}</a></li>
                <li><a href="#" id="wc-edit-pass" data-t="Change Password">${t('Change Password')}</a></li>
                <li><a href="#" id="wc-delete" class="danger-text" data-t="Delete Account">${t('Delete Account')}</a></li>
            `;

            // user event functions
            this.querySelector('#wc-edit-name').addEventListener('click', (e) => { 
                e.preventDefault(); 
                changeDisplayName(); 
            });
            this.querySelector('#wc-edit-pass').addEventListener('click', (e) => { 
                e.preventDefault(); 
                changePassword(); 
            });
            this.querySelector('#wc-delete').addEventListener('click', (e) => { 
                e.preventDefault(); 
                deleteAccount(); 
            });
        }
    }
}

// initialization functions
customElements.define('user-widget', UserWidget);