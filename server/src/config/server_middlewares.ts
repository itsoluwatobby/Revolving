import http from 'http'
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import cookieParser from "cookie-parser";
import SlowDown from 'express-slow-down';
import { dbConfig } from './mongoConfig.js';
import { corsOptions } from "./corsOption.js";
import express, { Application } from "express";
import { SocketServer } from './socketsServer.js';
import { RevolvingApplication } from './RevolvingApplication.js';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

type HTTPServerType = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export class ServerMiddlewares{

  private io: Server
  private server: HTTPServerType
  public staticPath = process.cwd() + '\\fileUpload'

  constructor(app: Application, PORT: string | 4000){
    dbConfig()
    app.use(this.Limiter(), this.speedLimiter())
    app.use(cors(corsOptions))
    app.use(express.json());
    app.use(express.static(this.staticPath))
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan('common'))
    // app.use(eventLogger)
    app.use(helmet())
    app.use(cookieParser())

    this.server = http.createServer(app)
    this.io = new Server(this.server, {
      pingTimeout: 120000,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
                    ? process.env.PUBLISHEDREDIRECTLINK : process.env.REDIRECTLINK,
        methods: ['POST', 'GET']
      }
    })

    // creating socket connection
    new SocketServer(this.io)

    // if(this.clusters.isPrimary){
    //   this.clusters.fork()
    //   this.clusters.fork()

    //   this.clusters.on('exit', (worker, code, signal) => {
    //     console.log(`worker ${worker.process.pid} died`)
    //   })
    // }
    // else{
      // app.use router initialization
      new RevolvingApplication(app).initiate()
      
      mongoose.connection.once('open', () => {
        console.log('Revolving DB connected')
        this.server.listen(PORT, () => {
          console.log(`Server up and running on port ${PORT}`)
        })
      })

      mongoose.connection.on('error', (error) => {
        console.log('Error connecting to DB... ERROR: ', error?.message)
        process.exit(1)
      })
    // }
  }

  private Limiter(): RateLimitRequestHandler{
    return (
      rateLimit({
        windowMs: 60 * 1000, //remembers req for a minute
        max: 200, // maximum of 60 requests per minute
        message: `<p style='font-size: 18px; font-family: mono;'>Too many requests from this IP, please try again after a minute</>`
      })
    )
  }

  private speedLimiter(){
    return (
      SlowDown({
        windowMs: 60 * 1000, // 60 seconds
        delayAfter: 150, //starts slowing down after 5 consecutive requests
        delayMs: 500, // adds a 500ms delay per request after delay limit is reached
        maxDelayMs: 2000, // limits delay to a maximum of 2 seconds
      })
    )
  }
}
