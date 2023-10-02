import { NextFunction, Request, Response } from "express";
import { responseType, signToken, verifyToken } from "../helpers/helper.js";
import { ClaimProps, USERROLES, UserProps } from "../../types.js";
import { RedisClientService } from "../helpers/redis.js";
import { UserService } from "../services/userService.js";

interface TokenProp extends Request{
  email: string,
  roles: USERROLES[]
}

interface CookieProp extends Request{
  cookie: {
    revolving: string
  }
}

const redisClientSeerver = new RedisClientService();
const userService = new UserService()

async function activatedAccount(email: string): Promise<UserProps> {
  const userData = await redisClientSeerver.getCachedResponse({key: `user:${email}`, cb: async () => {
    const user = await userService.getUserByEmail(email)
    return user
  }, reqMtd: ['POST', 'PATCH', 'PUT', 'DELETE']}) as UserProps
  return userData
}

export async function verifyAccessToken(req: TokenProp, res: Response, next: NextFunction) {
  const auth = req.headers['authorization']
  if(!auth || !auth.startsWith('Bearer ')) return res.sendStatus(401)
  const token = auth?.split(' ')[1]

  const verify = await verifyToken(token, process.env.ACCESSTOKEN_STORY_SECRET) as ClaimProps | string
  if(typeof verify == 'string'){ 
    if(verify == 'Bad Token') return res.sendStatus(401)
    else if(verify == 'Expired Token') return res.sendStatus(403)
  }
  else if(typeof verify == 'object'){
    // check if user account is activated
    activatedAccount(verify?.email)
    .then((user) => {
      if(!user.isAccountActivated) return responseType({res, status: 403, message: 'Account not activated'})
      if(user.isAccountLocked) return responseType({res, status: 403, message: 'Account Locked, Please contact support'})
      req.email = verify?.email
      req.roles = verify?.roles
      next()
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  }
}

export async function getNewTokens(req: CookieProp, res: Response) {  
  const cookie = req.cookies;
  if(!cookie?.revolving) return responseType({res, status: 401, message: 'Bad Credentials'})
  const token = cookie?.revolving;
  const user = await userService.getUserByToken(token)
  if(!user) return res.sendStatus(404)

  const verify = await verifyToken(user?.refreshToken, process.env.REFRESHTOKEN_STORY_SECRET) as ClaimProps | string
  if(typeof verify == 'string'){
    if(verify == 'Bad Token') {
      // TODO: account hacked, send email to user
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })// secure: true
      user.updateOne({$set: { refreshToken: '', userSession: '' }})
      .then(() => res.sendStatus(401))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    }
    else if(verify == 'Expired Token') {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })// secure: true
      user.updateOne({$set: { refreshToken: '', userSession: '' }})
      .then(() => responseType({res, status: 403, message: 'Expired Token'}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    }
  }
  const roles = Object.values(user?.roles);
  const newAccessToken = await signToken({roles, email: user?.email}, '1h', process.env.ACCESSTOKEN_STORY_SECRET);
  const newRefreshToken = await signToken({roles, email: user?.email}, '12h', process.env.REFRESHTOKEN_STORY_SECRET);

  //userSession: sessionID: req?.sessionID,
  user.updateOne({$set: {status: 'online', refreshToken: newRefreshToken }})
  .then(() => {
    res.cookie('revolving', newRefreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true
    return responseType({res, status: 200, data:{_id: user?._id, roles, accessToken: newAccessToken}})
  }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
}
// TODO: add secure option to cookies