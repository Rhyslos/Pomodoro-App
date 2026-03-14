import express from 'express';
import apiRoutes from './api/routes.mjs';

// database initialization functions
import { dbManager } from './singletons/dbManager.mjs';
import { PostgresAdapter } from './database/postgresAdapter.mjs';

const dbUrl = process.env.DATABASE_URL;
const adapter = new PostgresAdapter(dbUrl);
dbManager.setAdapter(adapter);

await dbManager.connect();
console.log("Database connected and users table verified");

// Server initialization functions
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware functions
app.use(express.json());
app.use(express.static('public'));
app.use('/modules', express.static('modules'));
app.use('/lang', express.static('lang'));
app.use('/api', apiRoutes);

// Server execution functions
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});