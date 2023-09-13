import http from 'http';
import cors from 'cors';
import express from 'express';
dotenv.config();
import dotenv from 'dotenv';
import process from 'process';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { cpus } from 'os';
import cluster from 'cluster';
import { corsOptions } from './config/corsOption.js';
import SlowDown from 'express-slow-down';
import { dbConfig } from './config/mongoConfig.js';
import { rateLimit } from 'express-rate-limit';
import { RevolvingApplication } from './config/RevolvingApplication.js';
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
const staticPath = process.cwd() + '\\fileUpload';
app.use(requestLimiter, speedLimiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));
// app.use(eventLogger)
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
    // app.use router initialization
    new RevolvingApplication(app).initiate();
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