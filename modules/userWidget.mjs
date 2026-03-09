import { t } from '/lang/client_i18n.mjs';
import { handleLogin, handleRegister, deleteAccount, changeDisplayName, changePassword } from './auth.mjs';

// component functions
class UserWidget extends HTMLElement {
    connectedCallback() {
        console.log("User Widget successfully loaded and attached to DOM!");
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
                
                <div class="tos-container" style="font-size: 0.8rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="wc-tos-consent">
                    <label for="wc-tos-consent">I agree to the <a href="#" onclick="window.loadPolicy('tos'); return false;">Terms</a> and <a href="#" onclick="window.loadPolicy('privacy'); return false;">Privacy Policy</a></label>
                </div>

                <div class="auth-buttons" style="display: flex; gap: 10px;">
                    <button id="wc-login-btn">${t('Login')}</button>
                    <button id="wc-register-btn">${t('Create Account')}</button>
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
                <li><a href="#" id="wc-edit-name">Change Name</a></li>
                <li><a href="#" id="wc-edit-pass">Change Password</a></li>
                <li><a href="#" id="wc-delete" class="danger-text">Delete Account</a></li>
            `;

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