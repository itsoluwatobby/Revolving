import bcrypt from 'bcrypt'
import { UserProps } from "../../types.js";
import { Request, Response } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import { deleteAccount, followOrUnFollow, getAllUsers, getUserById, updateUser } from "../services/userService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { UserModel } from '../models/User.js';


  /**
   * @description fetches all users
  */
  export function getUsers(req: Request, res: Response){
    asyncFunc(res, () => { 
      getCachedResponse({key:`allUsers`, cb: async() => {
        const allUsers = await getAllUsers()
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
  export function getUser(req: Request, res: Response){
    asyncFunc(res, () => { 
      const {userId} = req.params
      if(!userId || userId == null) return res.sendStatus(400)
      getCachedResponse({key: `user:${userId}`, cb: async() => {
        const current = await getUserById(userId)
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
   * @param req - followerId, followingId
  */
  export function followUnFollowUser(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {followerId, followingId} = req.params
      if (!followerId || !followingId) return res.sendStatus(400);
      const user = await getUserById(followingId);
      await autoDeleteOnExpire(followerId)
      if(!user) return responseType({res, status: 404, message: 'user not found'})
      const result = await followOrUnFollow(followerId, followingId);
      result != 'duplicate' ? 
          responseType({res, status: 201, message: result}) 
              : responseType({res, status: 409, message: 'You cannot follow yourself'})
    })
  }

  /**
   * @description upadates user information
   * @param req - userid
   * @body body - updated user information
  */
  export function updateUserInfo(req: Request, res: Response){
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
        updateUser(userId, userInfo)
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
  export function deleteUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await getUserById(userId);
      const admin = await getUserById(adminId as string);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(admin.roles.includes(ROLES.ADMIN)){
        deleteAccount(userId)
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
  export function lockAndUnlockUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await getUserById(userId);
      const admin = await getUserById(adminId as string);
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
  export function subscribeToNotification(req: Request, res: Response){
    asyncFunc(res, async() => {
      const {subscribeId, subscriberId} = req.params
      if(!subscribeId || !subscriberId) return res.sendStatus(400)
      // subscribeId - recipient, subscriberId - subscriber
      const subscribee = await getUserById(subscriberId);
      const subscribe = await getUserById(subscribeId);
      if(!subscribe) return responseType({res, status: 404, message: 'User not found'})

      if(subscribe?.notificationSubscribers?.includes(subscriberId)){
        subscribe.updateOne({$pull: { notificationSubscribers: subscriberId }})
        .then(async() => {
          await subscribee.updateOne({$pull: { subscribed: subscribeId }})
          return responseType({res, status: 201, message: 'SUCCESSFULLY UNSUBSCRIBED'})
        }).catch(() => responseType({res, status: 400, message: 'unable to subscribe'}))
      }
      else{
        subscribe.updateOne({$push: { notificationSubscribers: subscriberId }})
        .then(async() => {
          await subscribee.updateOne({$push: { subscribed: subscribeId }})
          return responseType({res, status: 201, message: 'SUBSCRIPTION SUCCESSFUL'})
        }).catch(() => responseType({res, status: 400, message: 'unable to subscribe'}))
      }
    })
  }

  /**
   * @description fetches user subscriptions
   * @param req - userid 
  */
  export const getSubscriptions = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {userId} = req.params
      if(!userId) return res.sendStatus(400)
      const user = await getUserById(userId);
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(userId)
      getCachedResponse({key: `userSubscriptions:${userId}`, cb: async() => {
        const allSubscriptions = await Promise.all(user?.notificationSubscribers?.map(async(id) => {
          const { _id, email, firstName, lastName, followers, followings } = await getUserById(id)
          return { _id, email, firstName, lastName, followers, followings }
        })) as Partial<UserProps[]>
        return allSubscriptions
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allSubscriptions: Partial<UserProps[]>) => {
        if(!allSubscriptions?.length) return responseType({res, status: 404, message: 'You have no subscriptions'})
        return responseType({res, status: 200, message: 'success', count: allSubscriptions?.length, data: allSubscriptions})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }
  
  /**
   * @description fetches user followers and followings
   * @param req - userid 
  */
  export const getUserFollows = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {userId} = req.params
      if(!userId) return res.sendStatus(400)
      const user = await getUserById(userId);
      if(!user) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(userId)
      getCachedResponse({key: `userFollows:${userId}`, cb: async() => {
        const followings = await Promise.all(user?.followings?.map(async(id) => {
          const { _id, email, firstName, lastName, followers, followings } = await getUserById(id)
          return { _id, email, firstName, lastName, followers, followings }
        })) as Partial<UserProps[]>
        const followers = await Promise.all(user?.followers?.map(async(id) => {
          const { _id, email, firstName, lastName, followers, followings } = await getUserById(id)
          return { _id, email, firstName, lastName, followers, followings }
        })) as Partial<UserProps[]>
        return { followings, followers }
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allFollows: {follows: Partial<UserProps[]>, followers: Partial<UserProps[]>}) => {
        if(!allFollows) return responseType({res, status: 404, message: 'You have no follows or followings'})
        return responseType({res, status: 200, message: 'success', data: allFollows})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }