import { NextFunction, Request, Response } from "express";
import { getUserByToken } from "../helpers/userHelpers.js";
import { responseType, signToken, verifyToken } from "../helpers/helper.js";
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
  if(!auth || !auth.startsWith('Bearer ')) return res.sendStatus(401)
  const token = auth?.split(' ')[1]

  const verify = await verifyToken(token, process.env.ACCESSTOKEN_STORY_SECRET) as ClaimProps | string
  if(typeof verify == 'string'){ 
    if(verify == 'Bad Token') return res.sendStatus(401)
    else if(verify == 'Expired Token') return res.sendStatus(403)
  }
  else if(typeof verify == 'object'){
    req.email = verify?.email
    req.roles = verify?.roles
    next()
  }
}

export const getNewTokens = async(req: CookieProp, res: Response) => {
  const cookie = req.cookies;
  if(!cookie?.revolving) return responseType({res, status: 401, message: 'Bad Credentials'})
  const token = cookie?.revolving;
  const user = await getUserByToken(token)
  if(!user) return res.sendStatus(404)

  const verify = await verifyToken(user?.refreshToken, process.env.REFRESHTOKEN_STORY_SECRET) as ClaimProps | string
  if(typeof verify == 'string'){
    if(verify == 'Bad Token') {
      // TODO: account hacked, send email to user
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })// secure: true
      user.updateOne({$set: { refreshToken: '', authentication: { sessionID: '' } }})
      return res.sendStatus(401);
    }
    else if(verify == 'Expired Token') {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })// secure: true
      user.updateOne({$set: { refreshToken: '', authentication: { sessionID: '' } }})
      return responseType({res, status: 401, message: 'Bad Token'})
    }
  }
  const roles = Object.values(user?.roles);
  const newAccessToken = await signToken({roles, email: user?.email}, '35m', process.env.ACCESSTOKEN_STORY_SECRET);
  const newRefreshToken = await signToken({roles, email: user?.email}, '12h', process.env.REFRESHTOKEN_STORY_SECRET);

  await user.updateOne({$set: {status: 'online', refreshToken: newRefreshToken }})
    //authentication: { sessionID: req?.sessionID },
    
  res.cookie('revolving', newRefreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true
  return responseType({res, status: 200, data:{_id: user?._id, roles, accessToken: newAccessToken}})
}

// TODO: add secure option to cookies