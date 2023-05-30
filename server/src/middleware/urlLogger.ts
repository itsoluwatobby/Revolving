import { NextFunction, Request, Response } from "express"
import { objInstance } from "../helpers/helper.js"

export const logURLAndMethods = (req: Request, res: Response, next: NextFunction) => {
  objInstance.pushIn({ mtd: req.method, url: req.url })
  next()
} 