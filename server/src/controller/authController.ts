import brcypt from 'bcrypt';
import dotenv from 'dotenv';
import { Document, Types } from "mongoose";
import { Request, Response } from "express";
import { UserModel } from "../models/User.js";
import { ROLES } from "../config/allowedRoles.js";
import { transporter } from '../config/mailConfig.js';
import { TaskBinModel } from "../models/TaskManager.js";
import { UserService } from '../services/userService.js';
import { mailOptions } from '../templates/registration.js'; 
import { KV_Redis_ClientService } from '../helpers/redis.js';
import { NotificationModel } from '../models/Notifications.js';
import { ClaimProps, EmailProps, NewUserProp, OTPPURPOSE, QueryProps, UserProps } from "../../types.js";
import { asyncFunc, responseType, signToken, objInstance, verifyToken, autoDeleteOnExpire, generateOTP, checksExpiration } from "../helpers/helper.js";

dotenv.config()

type UserDocument = Document<unknown, {}, UserProps> & UserProps & {_id: Types.ObjectId;}

type ExtraOTPRequestType = { 
  email: string, 
  length: number, 
  option: 'EMAIL' | 'DIRECT', 
  purpose: Exclude<OTPPURPOSE, 'OTHERS'> 
}

/**
 * @description Authentication controller
 */
class AuthenticationController {

  public dateTime: string
  public emailRegex: RegExp
  public passwordRegex: RegExp
  private serverUrl = process.env.NODE_ENV === 'production' 
        ? process.env.PRODUCTIONLINK : process.env.DEVELOPMENTLINK
  private clientUrl = process.env.NODE_ENV === 'production' 
        ? process.env.PUBLISHEDREDIRECTLINK : process.env.REDIRECTLINK
  private userService = new UserService()
  private redisClientService = new KV_Redis_ClientService()
  // private redisClientService = new RedisClientService()

  constructor(){
    this.emailRegex = /^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/
    this.passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;
    this.dateTime = new Date().toString()
  }

  /**
   * @description signs up a new user
   * @param body - username, email, password, type= 'LINK' | 'OTP'
  */
  public registerUser(req: NewUserProp, res: Response){
    asyncFunc(res, async () => {
      const {username, email, password, type}: Omit<NewUserProp, 'userId'> = req.body
      if (!username || !email || !password) return res.sendStatus(400);
      if(!this.emailRegex.test(email) || !this.passwordRegex.test(password)) return responseType({res, status: 400, message: 'Invalid email or Password format', data: {
        requirement:  {
          password: {
            "a": 'Should atleast contain a symbol and number', 
            "b": 'An uppercase and a lowerCase letter', 
            "c": 'And a minimum of nine characters'
          },
          email: {
            "a": 'Should be a valid email address', 
            "b": 'Verification link will be sent to the provided email for account verification'
          }
        }
      }})
      const duplicateEmail = await UserModel.findOne({email}).select('+password').exec();
      if(duplicateEmail) {
        if (duplicateEmail?.isAccountActivated) {
          const matchingPassword = await brcypt.compare(password, duplicateEmail?.password);
          if (!matchingPassword) return responseType({res, status: 409, message: 'Email taken'})
          
            return duplicateEmail?.isAccountLocked 
                ? responseType({res, status: 423, message: 'Account Locked'}) 
                : responseType({res, status: 200, message: 'You already have an account, Please login'})
        }
        else return responseType({res, status: 200, message: 'Please check your email to activate your account'})
      }
      const hashedPassword = await brcypt.hash(password, 10);
      const user = {
        username, email,
        password: hashedPassword, 
        registrationDate: this.dateTime
      } as Partial<UserProps>
      const newUser = await this.userService.createUser({...user})
      if(type === 'LINK'){
        const roles = Object.values(newUser?.roles)
        const token = await signToken({roles, email}, '30m', process.env.ACCOUNT_VERIFICATION_SECRET)
        const verificationLink = `${this.serverUrl}/revolving/auth/verify_account?token=${token}`
        const options = mailOptions(email, username, verificationLink)
        await newUser.updateOne({$set: {verificationToken: { type: 'LINK', token: verificationLink, createdAt: this.dateTime }}});
    
        transporter.sendMail(options, (err) => {
          if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
          else return responseType({res, status: 201, message: 'Please check your email to activate your account'})
        })
      }
      else if(type === 'OTP'){
        this.OTPGenerator(res, newUser)
      }
    })
  }

  /**
   * @description account confirmation by link
   * @param query - token
  */
  public accountConfirmation(req: Request, res: Response){
    asyncFunc(res, async () => {
      const { token } = req.query
      if(!token) return res.sendStatus(400)
      const user = await this.userService.getUserByVerificationToken(token as string)
      if(!user) {
        const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
        if (!verify?.email) return res.sendStatus(400)
        const user = await this.userService.getUserByEmail(verify?.email);
        if(user.isAccountActivated) return responseType({res, status: 200, message: 'Your account has already been activated'})
        await user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'LINK', token: '', createdAt: '' }}})
        return res.status(307).redirect(`${this.serverUrl}/revolving/auth/signIn`)
      }
      else{
        const verify = await verifyToken(token as string, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
        if (!verify?.email) return res.sendStatus(400)
        if (verify?.email != user?.email) return res.sendStatus(400)
        if(user.isAccountActivated) return responseType({res, status: 200, message: 'Your account has already been activated'})
        await user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'LINK', token: '', createdAt: '' }}})
        return res.status(307).redirect(`${this.clientUrl}/signIn`)
      }
    })
  }

   /**
   * @descriptionconfirms OTP sent by user
   * @body body - email, otp, purpose='ACCOUNT' | 'PASSWORD' | 'OTHERS
  */
  public confirmOTPToken(req: Request, res: Response){
    asyncFunc(res, async () => {
      const { email, otp, purpose='ACCOUNT' }: {email: string, otp: string, purpose?: OTPPURPOSE} = req.body
      if(!email || !otp) return responseType({res, status: 400, message: 'OTP or Email required'});
      const user = await this.userService.getUserByEmail(email)
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'});
      if(purpose === 'ACCOUNT'){
        if(user.isAccountActivated) return responseType({res, status: 200, message: 'Your account has already been activated'})
        const OTPMatch = user?.verificationToken?.token === otp
        if(!OTPMatch) return responseType({res, status: 403, message: 'Bad Token'})
        if(!checksExpiration(user?.verificationToken?.createdAt)){
          await user.updateOne({$set: { isAccountActivated: true, verificationToken: { type: 'OTP', token: '', createdAt: '' }}})
          return responseType({res, status: 200, message: 'Welcome, account activated', data: { _id: user?._id, email: user?.email, roles: user?.roles }});
        }
        else return responseType({res, status: 403, message: 'OTP expired pls login to request for a new one'});
      }
      else if(purpose === 'PASSWORD'){
        if(!user.isResetPassword) return responseType({res, status: 403, message: 'You need to request for a password reset'})
        const OTPMatch = user?.verificationToken?.token === otp
        if(!OTPMatch) return responseType({res, status: 403, message: 'Bad Token'})
        if(!checksExpiration(user?.verificationToken?.createdAt)){
          await user.updateOne({$set: { verificationToken: { type: 'OTP', token: '', createdAt: '' }}})
          return responseType({res, status: 200, message: 'SUCCESSFUL', data: { _id: user?._id, email: user?.email, roles: user?.roles } });
        }
        else return responseType({res, status: 403, message: 'OTP expired pls login to request for a new one'});
      }
      else{
        const OTPMatch = user?.verificationToken?.token === otp
        if(!OTPMatch) return responseType({res, status: 403, message: 'Bad Token'})
        if(!checksExpiration(user?.verificationToken?.createdAt)){
          await user.updateOne({$set: { verificationToken: { type: 'OTP', token: '', createdAt: '' }}})
          return responseType({res, status: 200, message: 'Token verified', data: { _id: user?._id, email: user?.email, roles: user?.roles }});
        }
        else return responseType({res, status: 403, message: 'OTP expired pls request for a new one'});
      }
    })
  }

   /**
   * @description generates OTP and sends it to user email
   * @param req - response object, user, length(default - 6)
  */
  public OTPGenerator(res: Response, user: UserDocument, length=6, purpose: Exclude<OTPPURPOSE, 'OTHERS'>='ACCOUNT'){
    asyncFunc(res, async () => {
      const OTPToken = generateOTP(length)
      const options = mailOptions(user?.email, user?.username, OTPToken, 'account', 'OTP')
      if(purpose === 'ACCOUNT'){
        await user.updateOne({$set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } }});
      }
      else if(purpose === 'PASSWORD'){
        await user.updateOne({$set: { isResetPassword: true, verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } }})
      }
      transporter.sendMail(options, (err) => {
        if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
        else return responseType({res, status: 201, message: 'Please check your email, OTP sent'})
      })
    })
  }

  /**
   * @description generates a new OTP
   * @param req - email, length(optional), option='EMAIL
  */  
  public ExtraOTPGenerator(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {email, length, option, purpose}: ExtraOTPRequestType = req.body
      if(!email) return responseType({res, status: 400, message: 'Email required'});
      const user = await this.userService.getUserByEmail(email)
      if(option === 'EMAIL'){
        return this.OTPGenerator(res, user, length, purpose)
      }
      else{
        const OTPToken = generateOTP(length)
        await user.updateOne({$set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } }});
        return responseType({res, status: 200, message: 'OTP generated', data: { otp: OTPToken, expiresIn: '30 minutes' }})
      }
    })
  }

  /**
   * @description signs in in a user
   * @param req - email and password
  */
  public loginHandler(req: NewUserProp, res: Response){
    asyncFunc(res, async () => {
      const {email, password} = req.body
      if (!email || !password) return res.sendStatus(400);

      const user = await UserModel.findOne({email}).select('+password').exec();
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})

      const matchingPassword = await brcypt.compare(password, user?.password);
      if (!matchingPassword) return responseType({res, status: 401, message: 'Bad credentials'})
      
      if (user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      if (!user?.isAccountActivated) {
        if(user?.verificationToken?.type === 'LINK'){
          const verify = await verifyToken(user?.verificationToken?.token, process.env.ACCOUNT_VERIFICATION_SECRET) as ClaimProps
          if (!verify?.email) {
            const token = await signToken({roles: user?.roles, email}, '30m', process.env.ACCOUNT_VERIFICATION_SECRET)
            const verificationLink = `${this.serverUrl}/revolving/auth/verify_account?token=${token}`
    
            const options = mailOptions(email, user?.username, verificationLink)
            await user.updateOne({$set: {verificationToken: { type: 'LINK', token, createdAt: this.dateTime }}});
    
            transporter.sendMail(options, (err) => {
              if (err) return responseType({res, status: 400, message: 'unable to send mail, please retry'})
            })
            return responseType({res, status: 405, message: 'Please check your email'})
          }
          else if (verify?.email) return responseType({res, status: 406, message: 'Please check your email to activate your account'})
        }
        else{
          if(checksExpiration(user?.verificationToken?.createdAt)) this.OTPGenerator(res, user)
          else return responseType({res, status: 406, message: 'Please check your email.'})
        }
      }

      const roles = Object.values(user?.roles);
      const accessToken = await signToken({roles, email}, '4h', process.env.ACCESSTOKEN_STORY_SECRET);
      const refreshToken = await signToken({roles, email}, '1d', process.env.REFRESHTOKEN_STORY_SECRET);

      // create taskBin for user
      if(!Boolean(await TaskBinModel.exists({userId: user?._id}))){
        await TaskBinModel.create({ userId: user?._id, taskBin: [] })
      }
      if(!Boolean(await NotificationModel.exists({userId: user?._id}))){
        const newNotification = await NotificationModel.create({ userId: user?._id, notification: [] })
        await user.updateOne({$set: { notificationId: newNotification?._id }})
      }
      await autoDeleteOnExpire(user?._id)

      const { _id, updatedAt } = user
      //userSession: req?.sessionID,
      user.updateOne({$set: { status: 'online', refreshToken, isResetPassword: false, verificationToken: { token: '' } }})
      .then(() => {
        res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true
        return responseType({res, status: 200, count:1, data:{_id, roles, accessToken, updatedAt}})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

   /**
   * @description logs out a user
   * @param req - userId
  */ 
  public async logoutHandler(req: NewUserProp, res: Response){
    try{
      const { userId } = req.params
      if(!userId) {
        res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
        await this.redisFunc()
        return res.sendStatus(204);
      }
      const user = await this.userService.getUserById(userId)
      if (!user) {
        res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
        await this.redisFunc()
        return res.sendStatus(204);
      }
      await user.updateOne({$set: {status: 'offline', userSession: '', lastSeen: this.dateTime, refreshToken: '', verificationToken: { token: '' } }})
      await this.redisFunc()
      res.clearCookie('revolving', { httpOnly: true, sameSite: "none", secure: true })//secure: true
      return res.sendStatus(204)
    }
    catch(error){
      res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true })//secure: true
      await this.redisFunc()
      return res.sendStatus(500);
    }
  }

   /**
   * @description receives a request to reset user password
   * @param query - email
  */ 
  public forgetPassword(req: Request, res: Response){
    asyncFunc(res, async () => {
      const { email, type } = req.query
      if(!email) return res.sendStatus(400);
      const user = await this.userService.getUserByEmail(email as string);
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      if (user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'})

      if(type === 'LINK'){
        const passwordResetToken = await signToken({roles: user?.roles, email: user?.email}, '25m', process.env.PASSWORD_RESET_TOKEN_SECRET)
        const verificationLink = `${this.serverUrl}/revolving/auth/password_reset?token=${passwordResetToken}`
        const options = mailOptions(email as string, user.username, verificationLink, 'password')
        transporter.sendMail(options, (err) => {
          if (err) return responseType({res, status: 400, message:'unable to send mail, please retry'})
          else{
            user.updateOne({$set: { isResetPassword: true, verificationToken: { type: 'LINK', token: passwordResetToken, createdAt: this.dateTime } }})
            .then(() => responseType({res, status:201, message:'Please check your email'}))
            .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
          }
        })
      }
      else if(type === 'OTP') this.OTPGenerator(res, user, 6, 'PASSWORD')
    })
  }

  /**
   * @description confirms password request and sends back a password_reset link
   * @param query - token
  */ 
  public passwordResetRedirectLink(req: QueryProps, res: Response){
    asyncFunc(res, async () => {
      const { token } = req.query
      if(!token) return res.sendStatus(400)
      const user = await this.userService.getUserByVerificationToken(token as string)
      if(!user) return res.sendStatus(401)
      if(!user.isResetPassword) return res.sendStatus(401)

      const verify = await verifyToken(token as string, process.env.PASSWORD_RESET_TOKEN_SECRET) as ClaimProps
      if (!verify?.email) return res.sendStatus(400)
      if (verify?.email != user?.email) return res.sendStatus(400)

      user.updateOne({$set: { verificationToken: { type: 'LINK', token: '', createdAt: '' } }})
      .then(() => res.status(307).redirect(`${this.clientUrl}/new_password?email=${user.email}`))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

   /**
   * @description resets user password
   * @param boby - email, resetPass
  */ 
  public passwordReset(req: EmailProps, res: Response){
    asyncFunc(res, async () => {
      const {resetPass, email} = req.body
      if(!email || !resetPass) return res.sendStatus(400)
      const user = await UserModel.findOne({email}).select('+password').exec();
      if(!user) return responseType({res, status: 401, message:'Bad credentials'})
      
      if(user.isResetPassword){
        const conflictingPassword = await brcypt.compare(resetPass, user?.password);
        if(conflictingPassword) return responseType({res, status:409, message:'same as old password'})
        
        const hashedPassword = await brcypt.hash(resetPass, 10);
        user.updateOne({$set: { password: hashedPassword, isResetPassword: false }})
          .then(() => responseType({res, status:201, message:'password reset successful, please login'}))
          .catch(() => res.sendStatus(500));
      }
      else return responseType({res, status:401, message:'unauthorised'})
    })
  }

  /**
   * @description confirms user password
   * @param req - email, password
  */ 
  public confirmUserByPassword(req: EmailProps, res: Response){
    asyncFunc(res, async () => {
      const {password, email} = req.body
      if(!email || !password) return res.sendStatus(400)
      const user = await UserModel.findOne({email}).select('+password').exec();
      if(!user) return responseType({res, status: 403, message:'Bad credentials'})
      const isUserValid = await brcypt.compare(password, user?.password);
      if(!isUserValid) return responseType({res, status: 403, message:'Bad credentials'})
      return responseType({res, status:200, message:'authentication successful'})
    })
  }

  /**
   * @description toggles assigning admin role by admin
   * @param req - adminId and userId
  */ 
  public toggleAdminRole(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {adminId, userId} = req.params
      if(!adminId || !userId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      const admin = await this.userService.getUserById(adminId);
      if(!user || !admin) return responseType({res, status: 401, message:'User not found'})
      if(admin?.roles.includes(ROLES.ADMIN)) {
        if(!user?.roles.includes(ROLES.ADMIN)) {
          user.roles = [...user.roles, ROLES.ADMIN]
          await user.save()
          this.userService.getUserById(userId)
          .then((userAd) => responseType({res, status:201, count: 1, message: 'admin role assigned', data: userAd}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
        else{
          user.roles = [ROLES.USER]
          await user.save()
          this.userService.getUserById(userId)
          .then((userAd) => responseType({res, status:201, count: 1, message: 'admin role removed', data: userAd}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
      }
      else return responseType({res, status:401, message:'unauthorised'})
    })
  }

  /**
   * @description disconnects redis connection
  */ 
  public async redisFunc(){
    objInstance.reset();
    await this.redisClientService.redisClient.flushall();
  }
}
export default new AuthenticationController()
