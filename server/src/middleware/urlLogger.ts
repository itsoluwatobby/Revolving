import { NextFunction, Request, Response } from "express"
import { objInstance } from "../helpers/helper.js"

export function logURLAndMethods(req: Request, res: Response, next: NextFunction) {
  objInstance.pushIn({ mtd: req.method, url: req.url })
  next()
} 
