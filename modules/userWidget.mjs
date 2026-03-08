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
                    <input type="text" id="wc-username" placeholder="Enter display name">
                    <input type="password" id="wc-password" placeholder="Enter password">
                </div>
                <div class="checkbox-group" style="margin-bottom: 1.5rem; text-align: left;">
                    <input type="checkbox" id="wc-tos">
                    <label for="wc-tos" style="font-size: 0.85rem;">I actively consent to the <a href="#" onclick="window.loadPolicy('tos'); return false;">Terms of Service</a> and <a href="#" onclick="window.loadPolicy('privacy'); return false;">Privacy Policy</a>.</label>
                </div>
                <div class="button-group" style="flex-direction: column; gap: 10px;">
                    <button id="wc-login-btn" style="width: 100%; margin: 0;">Login</button>
                    <button id="wc-register-btn" class="cancel-btn" style="width: 100%; margin: 0;">Create Account</button>
                </div>
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