import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import { corsOptions } from './config/corsOption.js';
import { cpus } from 'os';
import cluster from 'cluster';
import { dbConfig } from './config/mongoConfig.js';
import { rateLimit } from 'express-rate-limit';
import SlowDown from 'express-slow-down';
import authRouter from './routes/authRoutes.js';
import { verifyAccessToken } from './middleware/verifyTokens.js';
import storyRouter from './routes/storyRoutes.js';
import { getStories, getStory } from './controller/storyController.js';
import { getUser, getUsers } from './controller/userController.js';
import userRouter from './routes/usersRoutes.js';
// import { errorLog, logEvents } from './middleware/logger.js';
dbConfig(null, null, null);
const app = express();
const PORT = process.env.PORT || 4000;
const requestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: `<p style='font-size: 18px; font-family: mono;'>Too many requests from this IP, please try again after a minute</>`
});
const speedLimiter = SlowDown({
    windowMs: 60 * 1000,
    delayAfter: 15,
    delayMs: 500,
    maxDelayMs: 2000, // limits delay to a maximum of 2 seconds
});
app.use(requestLimiter, speedLimiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));
app.use(helmet());
app.use(cookieParser());
const server = http.createServer(app);
let numberOfCores = cpus().length;
if (cluster.isPrimary) {
    console.log(`Primary with PID: ${process.pid} is running`);
    while ((numberOfCores - 5) != 0) {
        cluster.fork();
        numberOfCores--;
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}
else {
    console.log(`Worker with PID: ${process.pid} is running`);
    app.get('/', (req, res) => {
        res.status(200).json({ status: true, message: 'server up and running' });
    });
    // ROUTES
    app.use('/revolving/auth', authRouter);
    app.get('/revolving/users', getUsers);
    app.get('/revolving/users/:userId', getUser);
    app.get('/revolving/story', getStories);
    app.get('/revolving/story/:storyId', getStory);
    // checks for accesstoken
    app.use(verifyAccessToken);
    // story router
    app.use('/revolving/story', storyRouter);
    // user router
    app.use('/revolving/users', userRouter);
    //app.use(errorLog);
    app.all('*', (req, res) => {
        res.status(404).json({ status: false, message: 'NOT FOUND' });
    });
    mongoose.connection.once('open', () => {
        console.log('Revolving DB connected');
        server.listen(PORT, () => {
            console.log(`Server up and running on port ${PORT}`);
        });
    });
    mongoose.connection.on('error', () => {
        console.log('Error connecting to DB');
        process.exit(1);
    });
}
//# sourceMappingURL=revolving.js.map