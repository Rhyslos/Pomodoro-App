import express from 'express';
//import apiRoutes from './api/api.mjs'; 
import { pomodoroTimer } from './modules/timer.mjs';

const app = express();
const PORT = 8080;
const print = console.log;

app.use(express.json());
app.use(express.static('Public'));
app.use('/modules', express.static('Modules'));
//app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const session = new pomodoroTimer("Timer", "test", 1);

print("Starting Pomodoro Session");
session.startTimer(25);