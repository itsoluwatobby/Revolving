import express, { Request, Response } from 'express'
const app = express()
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from '../config/corsOption.js';
import dbConfig from '../config/mongoConfig.js'
import mongoose from 'mongoose';
import { cpus } from 'os';
import cluster from 'cluster';
dotenv.config()
//dbConfig()
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

    server.listen(PORT, () => {
      console.log(`Server up and running on port ${PORT}`)
    })
  }
}
else{
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: true, message: 'server up and running' })
  })
  
  server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
  })
}
