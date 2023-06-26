import { Request, Response } from "express";
import { createUser, getUserByEmail, getUserById, getUserByToken, getUserByVerificationToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { ClaimProps, UserProps } from "../../types.js";
import { sub } from "date-fns";
import { asyncFunc, mailOptions, responseType, signToken, transporter, objInstance, verifyToken } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";
import { redisClient } from "../helpers/redis.js";
import { ROLES } from "../config/allowedRoles.js";

interface NewUserProp extends Request{
  username: string,
  email: string,
  password: string,
  userId: string
}

interface QueryProps extends Request{token: string}
interface EmailProps extends Request{
  email: string,
  resetPass: string
}

export const registerUser = async(req: NewUserProp, res: Response) => {
  asyncFunc(res, async () => {
    const {username, email, password} = req.body
    if (!username || !email || !password) return res.sendStatus(400);

    const duplicateEmail = await UserModel.findOne({email}).select('+authentication.password').exec();
    if(duplicateEmail) {
      if (duplicateEmail?.isAccountActivated) {
        const matchingPassword = await brcypt.compare(password, duplicateEmail?.authentication?.password);
        if (!matchingPassword) return responseType({res, status: 409, message: 'Email taken'})
        
          return duplicateEmail?.isAccountLocked 
              ? responseType({res, status: 423, message: 'Account Locked'}) 
              : responseType({res, status: 200, message: 'You already have an account, Please login'})
      }
      else return responseType({res, status: 200, message: 'Please check your email to activate your account'})
    }
    const hashedPassword = await brcypt.hash(password, 10);
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const user = {
      username, email,
      authentication:{ password: hashedPassword }, 
      registrationDate: dateTime
    } as Partial<UserProps>
    const newUser = await createUser({...user})
    const roles = Object.values(newUser?.roles)
    const token = await signToken({roles, email}, '30m', process.env.ACCOUNT_VERIFICATION_SECRET)
    const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`
    const options = mailOptions(email, username, verificationLink)
    await newUser.updateOne({$set: {verificationToken: token}});

    transporter.sendMail(options, (err) => {
      if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
    })
    return responseType({res, status: 201, message: 'Please check your email to activate your account'})
  })
}

export const accountConfirmation = async(req: NewUserProp, res: Response) => {
  asyncFunc(res, async () => {
    const { token } = req.query
    if(!token) return res.sendStatus(400)
    const user = await getUserByVerificationToken(token as string)
    if(!user) {
      const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
      if (!verify?.email) return res.sendStatus(400)
      const user = await getUserByEmail(verify?.email);
      if(user.isAccountActivated) return responseType({res, status: 200, message: 'Your account has already been activated'})
    }

    const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
    if (!verify?.email) return res.sendStatus(400)
    if (verify?.email != user?.email) return res.sendStatus(400)

    if(user.isAccountActivated) return responseType({res, status: 200, message: 'Your account has already been activated'})
    await user.updateOne({$set: { isAccountActivated: true, verificationToken: '' }})
    return res.status(307).redirect(`${process.env.REDIRECTLINK}/signIn`)
  })
}

export const loginHandler = async(req: NewUserProp, res: Response) => {
  asyncFunc(res, async () => {
    const {email, password} = req.body
    if (!email || !password) return res.sendStatus(400);

    const user = await UserModel.findOne({email}).select('+authentication.password').exec();
    if(!user) return responseType({res, status: 404, message: 'You do not have an account'})

    const matchingPassword = await brcypt.compare(password, user?.authentication?.password);
    if (!matchingPassword) return responseType({res, status: 401, message: 'Bad credentials'})
    
    if (user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    if (!user?.isAccountActivated) {
      const verify = await verifyToken(user?.verificationToken, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
      if (!verify?.email) {
        const token = await signToken({roles: user?.roles, email}, '30m', process.env.ACCOUNT_VERIFICATION_SECRET)
        const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`

        const options = mailOptions(email, user?.username, verificationLink)
        await user.updateOne({$set: {verificationToken: token}});

        transporter.sendMail(options, (err) => {
          if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
        })
        return responseType({res, status: 403, message: 'Please check your email'})
      }
      else if (verify?.email) return responseType({res, status: 403, message: 'Please check your email to activate your account'})
    }
    const roles = Object.values(user?.roles);
    const accessToken = await signToken({roles, email}, '30m', process.env.ACCESSTOKEN_STORY_SECRET);
    const refreshToken = await signToken({roles, email}, '1d', process.env.REFRESHTOKEN_STORY_SECRET);

    const { _id, ...rest } = user

    await user.updateOne({$set: { status: 'online', refreshToken, isResetPassword: false }})
    //authentication: { sessionID: req?.sessionID },
    
    res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true

    return responseType({res, status: 200, count:1, data:{_id, roles, accessToken}})
  })
}

export const logoutHandler = async(req: NewUserProp, res: Response) => {
  try{
    const { userId } = req.params
    if(!userId) {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
      redisFunc()
      return res.sendStatus(204);
    }
    const user = await getUserById(userId)
    if (!user) {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
      redisFunc()
      return res.sendStatus(204);
    }
    user.updateOne({$set: {status: 'offline', authentication: { sessionID: '' }, refreshToken: '' }})
    redisFunc()
    res.clearCookie('revolving', { httpOnly: true, sameSite: "none", secure: true })//secure: true
    return res.sendStatus(204)
  }
  catch(error){
    res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
    redisFunc()
    return res.sendStatus(500);
  }
}

export const forgetPassword = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const { email } = req.query
    if(!email) return res.sendStatus(400);
    const user = await getUserByEmail(email as string);
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if (user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'})

    const passwordResetToken = await signToken({roles: user?.roles, email: user?.email}, '25m', process.env.PASSWORD_RESET_TOKEN_SECRET)
    const verificationLink = `${process.env.ROUTELINK}/password_reset?token=${passwordResetToken}`
    const options = mailOptions(email as string, user.username, verificationLink, 'password')
    transporter.sendMail(options, (err) => {
      if (err) return responseType({res, status: 400, message:'unable to send mail, please retry'})
    })
    await user.updateOne({$set: { isResetPassword: true, verificationToken: passwordResetToken }})
    return responseType({res, status:201, message:'Please check your email'})
  })
}

export const passwordResetRedirectLink = async(req: QueryProps, res: Response) => {
  asyncFunc(res, async () => {
    const { token } = req.query
    if(!token) return res.sendStatus(400)
    const user = await getUserByVerificationToken(token as string)
    if(!user) return res.sendStatus(401)
    if(!user.isResetPassword) return res.sendStatus(401)

    const verify = await verifyToken(token as string, process.env.PASSWORD_RESET_TOKEN_SECRET) as ClaimProps
    if (!verify?.email) return res.sendStatus(400)
    if (verify?.email != user?.email) return res.sendStatus(400)

    await user.updateOne({$set: { verificationToken: '' }})
    res.status(307).redirect(`${process.env.REDIRECTLINK}/new_password?email=${user.email}`)
  })
}

export const passwordReset = async(req: EmailProps, res: Response) => {
  asyncFunc(res, async () => {
    const {resetPass, email} = req.body
    if(!email || !resetPass) return res.sendStatus(400)
    const user = await UserModel.findOne({email}).select('+authentication.password').exec();
    if(!user) return responseType({res, status: 401, message:'Bad credentials'})
    
    if(user.isResetPassword){
      const conflictingPassword = await brcypt.compare(resetPass, user?.authentication?.password);
      if(conflictingPassword) return responseType({res, status:409, message:'same as old password'})
      
      const hashedPassword = await brcypt.hash(resetPass, 10);
      await user.updateOne({$set: { authentication: { password: hashedPassword }, isResetPassword: false}})
        .then(() => responseType({res, status:201, message:'password reset successful, please login'}))
        .catch(() => res.sendStatus(500));
    }
    else return responseType({res, status:401, message:'unauthorised'})
  })
}

export const toggleAdminRole = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const {adminId, userId} = req.params
    if(!adminId || !userId) return res.sendStatus(400)
    const user = await getUserById(userId);
    const admin = await getUserById(adminId);
    if(!user || !admin) return responseType({res, status: 401, message:'User not found'})
    if(admin?.roles.includes(ROLES.ADMIN)) {
      if(!user?.roles.includes(ROLES.ADMIN)) {
        user.roles = [...user.roles, ROLES.ADMIN]
        user.save()
        const userAd = await getUserById(userId);
        return responseType({res, status:201, count: 1, message: 'admin role assigned', data: userAd})
      }
      else{
        user.roles = [ROLES.USER]
        user.save()
        const userAd = await getUserById(userId);
        return responseType({res, status:201, count: 1, message:'admin role removed', data: userAd})
      }
    }
    else return responseType({res, status:401, message:'unauthorised'})
  })
}

async function redisFunc(){
  objInstance.reset();
  if(redisClient.isOpen){
    await redisClient.flushAll();
    await redisClient.quit();
  }
  return;
}