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
import { getStories, getStory, getStoryByCategory } from './controller/storyController.js';
import { getUser, getUsers } from './controller/userController.js';
import userRouter from './routes/usersRoutes.js';
import passwordResetRouter from './routes/resetPassword.js';
import { logoutHandler } from './controller/authController.js';
import { logURLAndMethods } from './middleware/urlLogger.js';
import { fetchSharedStories, getSingleShared } from './controller/sharedStoryController.js';
import { getComment, getStoryComments } from './controller/commentController.js';
import commentRouter from './routes/commentRoutes.js';
import { getResponse, getResponseByComment } from './controller/responseController.js';
import responseRouter from './routes/responseRoutes.js';
// import { errorLog, logEvents } from './middleware/logger.js';
dbConfig(null, null, null);
const app = express();
const PORT = process.env.PORT || 4000;
const requestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: `<p style='font-size: 18px; font-family: mono;'>Too many requests from this IP, please try again after a minute</>`
});
const speedLimiter = SlowDown({
    windowMs: 60 * 1000,
    delayAfter: 30,
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
    app.get('/', (req, res) => {
        res.status(200).json({ status: true, message: 'server up and running' });
    });
    // CACHING URLS
    app.use(logURLAndMethods);
    // autoDelete bin
    //app.use(autoDeleteOnExpire)
    // ROUTES
    app.use('/revolving/auth', authRouter);
    app.post('/revolving/auth/logout/:userId', logoutHandler);
    // USERS
    app.get('/revolving/users', getUsers);
    app.get('/revolving/users/single/:userId', getUser);
    //password reset
    app.use('/revolving/auth', passwordResetRouter);
    app.get('/revolving/story/share_getAll', fetchSharedStories);
    //public routes
    app.get('/revolving/story', getStories);
    // comments
    app.get('/revolving/comment_in_story/:storyId', getStoryComments);
    app.get('/revolving/comment/:commentId', getComment);
    app.get('/revolving/response_in_comment/:commentId', getResponseByComment);
    app.get('/revolving/response/:responseId', getResponse);
    app.get('/revolving/story/category', getStoryByCategory);
    app.get('/revolving/story/:storyId', getStory);
    app.get('/revolving/story/share/:sharedId', getSingleShared);
    // checks for accesstoken
    app.use(verifyAccessToken);
    // story router
    app.use('/revolving/story', storyRouter);
    // user router
    app.use('/revolving/users', userRouter);
    // comment router
    app.use('/revolving/comments', commentRouter);
    // response router
    app.use('/revolving/responses', responseRouter);
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