import { NextFunction, Response } from "express"

export const verifyRoles = (roles: []) => {
  return (req: {roles: number[]}, res: Response, next: NextFunction) => {
    if(!roles.length) return res.sendStatus(403)
    const userRole = req.roles
    const allowedRoles = roles.map(role => userRole.includes(role)).find(res => res == true)
    if(!allowedRoles) return res.sendStatus(401).json('unauthorised')
    next();
  }
}
