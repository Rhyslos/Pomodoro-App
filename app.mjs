import { UserManager } from 'modules/userManager.mjs';
import { SessionManager } from 'module/sessionManager.mjs';

// Initialization Functions
const userManager = new UserManager();
const sessionManager = new SessionManager();

// Export Functions
export { userManager, sessionManager };