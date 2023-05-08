import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { format } from 'date-fns';
import { Request, Response, NextFunction } from 'express';

const logger = async(logName: string, method: string) => {
  const { randomBytes } = await import("node:crypto");
  const date = `${format(new Date(), 'MMMM-dd-yyyy\tHH:mm:ss')}`
  const randomId = randomBytes(12).toString('hex')
  const logEvent = `[${date}]\t${randomId}\t${method}\n`
  try{
    (!fs.existsSync(path.join(__dirname, '..', 'log'))) && await fsPromises.mkdir(path.join(__dirname, '..', 'log'))
    await fsPromises.appendFile(path.join(__dirname, '..', 'log', logName), logEvent)
    console.log(logEvent)
  }catch(error){
    console.log('unable to log request')
  }
}

export const logEvents = (req: Request, res: Response, next: NextFunction) => {
  logger('reqLog.log', `${req.method}\t${req.url}\t${req.headers.origin}`)
  next()
}

export const errorLog = (err, req: Request, res: Response, next: NextFunction) => {
  logger(`${err.name}:\t${err?.message}`, 'errLog.log')
  res.sendFile(path.join(__dirname, '..', 'public', '404.html'))
  console.log(`${err?.stack}`)
  next()
}

