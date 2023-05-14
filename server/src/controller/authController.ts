import { Request, Response } from "express";
import { createUser, getUserByEmail, getUserByVerificationToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { ClaimProps, UserProps } from "../../types.js";
import { sub } from "date-fns";
import { mailOptions, signToken, transporter, verifyToken } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";

interface NewUserProp extends Request{
  username: string,
  email: string,
  password: string
}

export const registerUser = async(req: NewUserProp, res: Response) => {
  try{
    const {username, email, password} = req.body
    if (!username || !email || !password) return res.sendStatus(400);

    const duplicateEmail = await UserModel.findOne({email}).select('+authentication.password').exec();
    if(duplicateEmail) {
      if (duplicateEmail?.isAccountActivated) {
        const matchingPassword = await brcypt.compare(password, duplicateEmail?.authentication?.password);
        if (!matchingPassword) return res.status(409).json('Email taken')
        return res.status(200).json('You already have an account, Please login')
      }
      else return res.status(200).json('Please check your email to activate your account')
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
    const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`
    const options = mailOptions(email, username, verificationLink)
    await newUser.updateOne({$set: {verificationToken: token}});
  
    transporter.sendMail(options, (err) => {
      if (err) return res.status(400).json('unable to send mail')
    })
    return res.status(201).json('Please check your email to activate your account')
  }
  catch(error){
    console.log(error)
    return res.sendStatus(500);
  }
}

export const accountConfirmation = async(req: NewUserProp, res: Response) => {
  try{
    const { token } = req.query
    if(!token) return res.sendStatus(400)
    const user = await getUserByVerificationToken(token as string)
    if(!user) {
      const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
      if (!verify?.email) return res.sendStatus(400)
      const user = await getUserByEmail(verify?.email);
      if(user.isAccountActivated) return res.status(200).json('Your has already been activated')
    }

    const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
    if (!verify?.email) return res.sendStatus(400)
    if (verify?.email != user?.email) return res.sendStatus(400)

    if(user.isAccountActivated) return res.status(200).json('Your has already been activated')
    await user.updateOne({$set: { isAccountActivated: true, verificationToken: '' }})
    return res.status(307).redirect(`${process.env.ROUTELINK}/revolving_api/login`)
  }
  catch(error){
    console.log(error)
    return res.sendStatus(500)
  }
}

export const loginHandler = async(req: NewUserProp, res: Response) => {
  try{
    const {email, password} = req.body
    if (!email || !password) return res.sendStatus(400);

    const user = await UserModel.findOne({email}).select('+authentication.password').exec();
    if(!user) return res.status(401).json('You do not have an account')
    const matchingPassword = await brcypt.compare(password, user?.authentication?.password);
    if (!matchingPassword) return res?.status(401).json('Incorrect password')

    if (user?.isAccountLocked) return res?.status(403).json('Your account is locked')
    if (!user?.isAccountActivated) {
      const verify = await verifyToken(user?.verificationToken, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
      if (!verify?.email) {
        const token = await signToken({roles: user?.roles, email}, '30m', process.env.ACCOUNT_VERIFICATION_SECRET)
        const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`
        const options = mailOptions(email, user?.username, verificationLink)
        await user.updateOne({$set: {verificationToken: token}});

        transporter.sendMail(options, (err) => {
          if (err) return res.status(400).json('unable to send mail')
        })
        return res.status(201).json('Please check your email')
      }
      else if (verify?.email) return res.status(200).json('Please check your email to activate your account')
    }
    const roles = Object.values(user?.roles);
    const accessToken = await signToken({roles, email}, '10m', process.env.ACCESSTOKEN_STORY_SECRET);
    const refreshToken = await signToken({roles, email}, '1d', process.env.REFRESHTOKEN_STORY_SECRET);

    const { _id, ...rest } = user

    await user.updateOne({$set: { status: 'online', refreshToken }})
    //authentication: { sessionID: req?.sessionID },
    
    res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 })//secure: true
    return res.status(200).json({_id, roles, accessToken})
  }
  catch(error){
    console.log(error)
    res.sendStatus(500);
  }
}

export const logoutHandler = async(req: NewUserProp, res: Response) => {
  try{
    const {email} = req.body
    if (!email) {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' })//secure: true
      return res.sendStatus(204);
    }
    const user = await getUserByEmail(email);
    if (!user) {
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' })//secure: true
      return res.sendStatus(204);
    }
    user.updateOne({$set: {status: 'offline', authentication: { sessionID: '' }, refreshToken: '' }})

    res.clearCookie('revolving', { httpOnly: true, sameSite: "none" })//secure: true
    return res.sendStatus(204)
  }
  catch(error){
    res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' })//secure: true
    return res.sendStatus(500);
  }
}

