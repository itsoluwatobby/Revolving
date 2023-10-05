import bcrypt from 'bcrypt'
import { Request, Response } from "express";
import { UserModel } from '../models/User.js';
import { ROLES } from "../config/allowedRoles.js";
import { UserService } from '../services/userService.js';
import { RedisClientService } from '../helpers/redis.js';
import NotificationController from './notificationController.js';
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { EachSubs, GetFollowsType, GetSubscriptionType, SubscribeNotificationType, SubscriptionTo, UserFriends, UserProps } from "../../types.js";


class UserController{

  public dateTime: string
  private userService: UserService = new UserService()
  private redisClientService: RedisClientService = new RedisClientService()

  constructor(){
    this.dateTime = new Date().toString()
  }

  /**
   * @description fetches all users
  */
  public getUsers(req: Request, res: Response){
    asyncFunc(res, () => { 
      this.redisClientService.getCachedResponse({key:`allUsers`, cb: async() => {
        const allUsers = await this.userService.getAllUsers()
        return allUsers
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((users: UserProps[]) => {
        if(!users?.length) return responseType({res, status: 404, message: 'No users available'})
        return responseType({res, status: 200, count: users?.length, data: users})
      })
      .catch((error) => responseType({res, status: 403, message: `${error.message}`}))
    })
  }

   /**
   * @description fetches a user information
   * @param req - userid
  */
  public getUser(req: Request, res: Response){
    asyncFunc(res, () => { 
      const {userId} = req.params
      if(!userId || userId == null || userId == undefined) return res.sendStatus(400)
      this.redisClientService.getCachedResponse({key: `user:${userId}`, cb: async() => {
        const current = await this.userService.getUserById(userId)
        await autoDeleteOnExpire(userId)
        return current;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((user: UserProps) => {
        if(!user) return responseType({res, status: 404, message: 'User not found'})
        return responseType({res, status: 200, count: 1, data: user})
      })
      .catch((error) => responseType({res, status: 403, message: `${error.message}`}))
    })
  }

  /**
   * @description follow or unfollow a user
   * @param req - followerId-sender, followingId- receiver
  */
  public followUnFollowUser(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {followerId, followingId} = req.params
      if (!followerId || !followingId) return res.sendStatus(400);
      const user = await this.userService.getUserById(followingId);
      await autoDeleteOnExpire(followerId)
      if(!user) return responseType({res, status: 404, message: 'user not found'})
      const result = await this.userService.followOrUnFollow(followerId, followingId);
      const errorResponse = ['unable to follow', 'unable to unfollow']
      if (errorResponse?.includes(result)) return responseType({res, status: 409, message: result })
      return result !== 'duplicate' ? 
        responseType({res, status: 201, message: result}) 
            : responseType({res, status: 409, message: 'You cannot follow yourself'})
    })
  }

  /**
   * @description upadates user information
   * @param req - userid
   * @body body - updated user information
  */
  public updateUserInfo(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const userInfo: UserProps = req.body
      if(!userId) return res.sendStatus(400);
      const user = await UserModel.findById(userId).select('+password').exec();
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})

      if(userInfo?.password){
        const newPassword = userInfo?.password
        const conflictingPassword = await bcrypt.compare(newPassword, user?.password);
        if(conflictingPassword) return responseType({res, status:409, message:'same as old password'})
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.updateOne({$set: { password: hashedPassword }})
          .then(() => responseType({res, status:201, message:'password reset successful'}))
          .catch(() => res.sendStatus(500));
      }
      else{
        this.userService.updateUser(userId, userInfo)
        .then(updatedInfo => responseType({res, status: 201, message: 'success', data: updatedInfo}))
        .catch(error => responseType({res, status: 400, message: error.message}))
      }    
    })
  }

  /**
   * @description deletes user account by admin user
   * @param req - userid
   * @query query - adminId
  */
  public deleteUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId);
      const admin = await this.userService.getUserById(adminId as string);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(admin.roles.includes(ROLES.ADMIN)){
        this.userService.deleteAccount(userId)
        .then(() => responseType({res, status: 204}))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      else return responseType({res, status: 401, message: 'unauthorized'});
    })
  }

  /**
   * @description lock and unlock user account by admin user
   * @param req - userid
   * @query query - adminId
  */
  public lockAndUnlockUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId);
      const admin = await this.userService.getUserById(adminId as string);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(admin?.roles.includes(ROLES.ADMIN)){
        if(!user.isAccountLocked){
          user.updateOne({$set: { isAccountLocked: true }})
          .then(() => responseType({res, status: 201, message: 'user account LOCKED successfully'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
        else {
          user.updateOne({$set: { isAccountLocked: false }})
          .then(() => responseType({res, status: 201, message: 'user account UNLOCKED successfully'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
      }
      else return responseType({res, status: 401, message: 'unauthorized'});
    })
  }

  /**
   * @description subscribe to user post
   * @param req - subscribeId, subscriberId 
  */
  public subscribeToNotification(req: Request, res: Response){
    asyncFunc(res, async() => {
      const {subscribeId, subscriberId} = req.params
      if(!subscribeId || !subscriberId) return res.sendStatus(400)
      // subscribeId - recipient, subscriberId - subscriber
      const subscribee = await this.userService.getUserById(subscriberId);
      const subscribeRecipient = await this.userService.getUserById(subscribeId);
      if(!subscribeRecipient) return responseType({res, status: 404, message: 'User not found'})

      const { firstName, lastName, displayPicture: { photo } } = subscribee
      const notiSubscribe = {
        userId: subscriberId, fullName: `${firstName} ${lastName}`,
        displayPicture: photo
      } as SubscribeNotificationType

      const duplicate = subscribeRecipient?.notificationSubscribers?.find(sub => sub?.subscriberId === subscriberId) as EachSubs
      if(duplicate){
        const targetSubscriberRecipient = subscribee?.subscribed?.find(sub => sub?.subscribeRecipientId === subscribeId) as SubscriptionTo
        subscribeRecipient.updateOne({$pull: { notificationSubscribers: duplicate }})
        .then(async() => {
          await subscribee.updateOne({$pull: { subscribed: targetSubscriberRecipient }})
          await NotificationController.removeSingleNotification(subscribeId, notiSubscribe, 'Subcribe')
          return responseType({res, status: 201, message: 'SUCCESSFULLY UNSUBSCRIBED'})
        }).catch(() => responseType({res, status: 400, message: 'unable to unsubscribe'}))
      }
      else{
        subscribeRecipient.updateOne({$push: { notificationSubscribers: { subscriberId, createdAt: this.dateTime } }})
        .then(async() => {
          await subscribee.updateOne({$push: { subscribed: { subscribeRecipientId: subscribeId, createdAt: this.dateTime  } }})
          await NotificationController.addToNotification(subscribeId, notiSubscribe, 'Subcribe')
          return responseType({res, status: 201, message: 'SUBSCRIPTION SUCCESSFUL'})
        }).catch(() => responseType({res, status: 400, message: 'unable to subscribe'}))
      }
    })
  }

  /**
   * @description fetches user subscriptions
   * @param req - userid 
  */
  public getSubscriptions = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {userId} = req.params
      if(!userId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(userId)
      this.redisClientService.getCachedResponse({key: `userSubscriptions:${userId}`, cb: async() => {
        return await this.userService.getUserSubscriptions(user)
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allSubscriptions: GetSubscriptionType) => {
        if(!allSubscriptions?.subscriptions?.length && !allSubscriptions?.subscribed?.length) return responseType({res, status: 404, message: 'You have no subscriptions'})
        return responseType({res, status: 200, message: 'success', data: allSubscriptions})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }
  
  /**
   * @description fetches user followers and followings
   * @param req - userid 
  */
  public getUserFollows = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {userId} = req.params
      if(!userId || !userId?.length) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(userId)
      this.redisClientService.getCachedResponse({key: `userFollows:${userId}`, cb: async() => {
        return await this.userService.getUserFollowers(user)
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allFollows: GetFollowsType) => {
        if(!allFollows?.follows?.length && !allFollows?.followers?.length) return responseType({res, status: 404, message: 'You have no follows or followings'})
        return responseType({res, status: 200, message: 'success', data: allFollows})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }
  /**
   * @description fetches user friends
   * @param req - userid 
  */
  public getUserFriends = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {userId} = req.params
      if(!userId || !userId?.length) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(userId)
      this.redisClientService.getCachedResponse({key: `userFriends:${userId}`, cb: async() => {
        return await this.userService.getFriends(user)
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allUsers: UserFriends[]) => {
        if(!allUsers?.length) return responseType({res, status: 404, message: 'You have no friends'})
        return responseType({res, status: 200, message: 'success', count: allUsers?.length, data: allUsers})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }
}
export default new UserController()
