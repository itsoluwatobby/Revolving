import { NextFunction, Request, Response } from "express";
import { getUserByToken } from "../helpers/userHelpers.js";
import { signToken, verifyToken } from "../helpers/helper.js";
import { ClaimProps, USERROLES } from "../../types.js";

interface TokenProp extends Request{
  email: string,
  roles: USERROLES[]
}

interface CookieProp extends Request{
  cookie: {
    revolving: string
  }
}

export const verifyAccessToken = async(req: TokenProp, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization']
  if(!auth || !auth.startsWith('Bearer ')) return res.sendStatus(403)
  const token = auth?.split(' ')[1]

  const verify = await verifyToken(token, process.env.ACCESSTOKEN_STORY_SECRET) as ClaimProps
  if(!verify?.email) return res.sendStatus(403)
  req.email = verify?.email
  req.roles = verify?.roles
  next()
}

export const getNewTokens = async(req: CookieProp, res: Response) => {
  const cookie = req.cookies;
  if(!cookie?.revolving) return res.sendStatus(403)
  const token = cookie?.revolving
  const user = await getUserByToken(token)
  if(!user) return res.sendStatus(403)

  const verify = await verifyToken(user?.refreshToken, process.env.REFRESHTOKEN_STORY_SECRET) as ClaimProps
  if(!verify?.email){
    res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' })// secure: true
    user.updateOne({$set: { refreshToken: '', authentication: { sessionID: '' } }})
    return res.sendStatus(403)
  }
  const roles = Object.values(user?.roles);
  const newAccessToken = await signToken({roles, email: user?.email}, '2h', process.env.ACCESSTOKEN_STORY_SECRET);
  const newRefreshToken = await signToken({roles, email: user?.email}, '1d', process.env.REFRESHTOKEN_STORY_SECRET);

  user.updateOne({$set: {status: 'online', refreshToken: newRefreshToken }})
    //authentication: { sessionID: req?.sessionID },
    
  res.cookie('revolving', newRefreshToken, { httpOnly: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 })//secure: true
  return res.status(200).json({roles, accessToken: newAccessToken})
}

// TODO: add secure option to cookies