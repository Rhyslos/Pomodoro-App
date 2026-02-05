import express from 'express';
import apiRoutes from './api/api.mjs'; 

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static('Public'));
app.use('/modules', express.static('Modules'));
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});