import express from 'express';
import apiRoutes from './api/routes.mjs';

// Server initialization functions
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware functions
app.use(express.json());
app.use(express.static('public'));
app.use('/modules', express.static('modules'));
app.use('/api', apiRoutes);

// Server execution functions
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});