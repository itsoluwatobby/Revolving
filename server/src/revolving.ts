import express from 'express'

import dotenv from 'dotenv';
import process from 'process';
dotenv.config()

import { ServerMiddlewares } from './config/server_middlewares.js';

// import { dbConfig } from './config/mongoConfig.js';
// import { errorLog, logEvents } from './middleware/logger.js';
// dbConfig();

const app = express()

const PORT = process.env.PORT || 4000

new ServerMiddlewares(app, PORT)
