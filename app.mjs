import { UserManager } from './modules/userManager.mjs';
import { SessionManager } from './modules/sessionManager.mjs';

// Initialization Functions
const userManager = new UserManager();
const sessionManager = new SessionManager();

// Export Functions
export { userManager, sessionManager };