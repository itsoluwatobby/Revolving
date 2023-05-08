import express, { Request, Response } from 'express'
import http from 'http';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config() 
import mongoose from 'mongoose';

import morgan from 'morgan';
import helmet from 'helmet';
import { corsOptions } from './config/corsOption.js';

import { cpus } from 'os';
import cluster from 'cluster';
import { dbConfig } from './config/mongoConfig.js';
// import { errorLog, logEvents } from './middleware/logger.js';
dbConfig(null, null, null);
const app = express()

const PORT = process.env.PORT || 3000

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'))
app.use(helmet())
app.use(cookieParser())

const server = http.createServer(app)

let numberOfCores = cpus().length;
if (numberOfCores > 4){

  if (cluster.isPrimary){
    console.log(`Primary with PID: ${process.pid} is running`)

    while((numberOfCores - 5) != 0){
      cluster.fork();
      numberOfCores--
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })
  }
  else{
    console.log(`Worker with PID: ${process.pid} is running`)

    app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ status: true, message: 'server up and running' })
    })

    //app.use(errorLog);
    app.all('*', (req: Request, res: Response) => {
      res.status(404).json({status: false, message: 'NOT FOUND'})
    })
    
    mongoose.connection.once('open', () => {
      console.log('Revolving DB connected')
      server.listen(PORT, () => {
        console.log(`Server up and running on port ${PORT}`)
      })
    })

    mongoose.connection.on('error', () => {
      console.log('Error connection to DB')
      process.exit(1)
    })
  }
}
else{
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: true, message: 'server up and running' })
  })
  
  mongoose.connection.once('open', () => {
    console.log('Revolving DB connected')
    server.listen(PORT, () => {
      console.log(`Server up and running on port ${PORT}`)
    })
  })

  mongoose.connection.on('error', () => {
    console.log('Error connection to DB')
    process.exit(1)
  })
}
