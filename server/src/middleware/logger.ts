import fs from 'fs'
import fsPromises from 'fs/promises'
import { Request, Response, NextFunction } from 'express';
export const revolvingErrorLogs = async(req: Request, res: Response, next: NextFunction) => {
  const date = new Intl.DateTimeFormat('en-US', {dateStyle: 'full'}).format(new Date())
  if(res?.statusCode >= 400){
    const logMessage = `[-${req.headers.origin}::${req.httpVersion}] - [${date}] "${req.method} ${req.baseUrl}${req.url}" ${res.statusCode} ${res.statusMessage}\n`
    const filePath = process.cwd() + '\\errorLog\\error.log'
    if(!fs.existsSync(filePath)) await fsPromises.writeFile(filePath, logMessage)
    else await fsPromises.appendFile(filePath, logMessage)
    next()
  }
  else next()
}

