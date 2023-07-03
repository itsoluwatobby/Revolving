import { Request, Response, NextFunction } from 'express';

export const eventLogger = async(req: Request, res: Response, next: NextFunction) => {
  next()
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full'
  }).format(new Date())
  const errStats = res?.statusCode >= 400 ? `${res.statusMessage}` : ''
  const logMessage = `-${req.hostname}::${req.httpVersion} - [${date}] "${req.method} ${req.baseUrl}${req.url}" ${res.statusCode +' '+req.headers.origin} ${errStats}`
  console.info(logMessage)
}

