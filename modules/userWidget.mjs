import { t } from '/lang/client_i18n.mjs';
import { handleLogin, handleRegister, deleteAccount, changeDisplayName, changePassword } from './auth.mjs';

// component functions
class UserWidget extends HTMLElement {
    connectedCallback() {
        console.log("User Widget successfully loaded and attached to DOM!");
        this.mode = this.getAttribute('mode') || 'auth';
        this.render();
    }

    render() {
        if (this.mode === 'auth') {
            this.innerHTML = `
                <div class="form-group">
                    <input type="text" id="wc-username" placeholder="${t('Display Name')}">
                    <input type="password" id="wc-password" placeholder="${t('Password')}">
                </div>
                <button id="wc-login-btn">${t('Login')}</button>
                <button id="wc-register-btn">${t('Create Account')}</button>
            `;

            this.querySelector('#wc-login-btn').addEventListener('click', () => {
                const u = this.querySelector('#wc-username').value;
                const p = this.querySelector('#wc-password').value;
                handleLogin(u, p);
            });

            this.querySelector('#wc-register-btn').addEventListener('click', () => {
                const u = this.querySelector('#wc-username').value;
                const p = this.querySelector('#wc-password').value;
                const c = this.querySelector('#wc-tos').checked;
                handleRegister(u, p, c);
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