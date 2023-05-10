import { NextFunction, Response, Request } from "express"
import { USERROLES } from "../../types.js"

interface Roles extends Request{
  roles: USERROLES[]
}

export const verifyRoles = (roles: []) => {
  return (req: Roles, res: Response, next: NextFunction) => {
    if(!roles.length) return res.sendStatus(403)
    const userRole = req.roles
    const allowedRoles = roles.map(role => userRole.includes(role)).find(res => res == true)
    if(!allowedRoles) return res.sendStatus(403)
    next();
  }
}
