import bcrypt from 'bcrypt'
import { UserProps } from "../../types.js";
import { Request, Response } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import userServiceInstance from "../services/userService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";

class UserController{

  constructor() {}

  getUsers(req: Request, res: Response){
    asyncFunc(res, () => { 
      getCachedResponse({key:`allUsers`, cb: async() => {
        const allUsers = await userServiceInstance.getAllUsers()
        return allUsers
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((users: UserProps[]) => {
        if(!users?.length) return responseType({res, status: 404, message: 'No users available'})
        return responseType({res, status: 200, count: users?.length, data: users})
      })
      .catch((error) => responseType({res, status: 403, message: `${error.message}`}))
    })
  }

  getUser(req: Request, res: Response){
    asyncFunc(res, () => { 
      const {userId} = req.params
      if(!userId || userId == null) return res.sendStatus(400)
      getCachedResponse({key: `user:${userId}`, cb: async() => {
        const current = await userServiceInstance.getUserById(userId)
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

  followUnFollowUser(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {followerId, followingId} = req.params
      if (!followerId || !followingId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(followingId);
      await autoDeleteOnExpire(followerId)
      if(!user) return responseType({res, status: 404, message: 'user not found'})
      const result = await userServiceInstance.followOrUnFollow(followerId, followingId);
      result != 'duplicate' ? 
          responseType({res, status: 201, message: result}) 
              : responseType({res, status: 409, message: 'You cannot follow yourself'})
    })
  }

  updateUserInfo(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const userInfo: UserProps = req.body
      if (!userId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId);
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
        userServiceInstance.updateUser(userId, userInfo)
        .then(updatedInfo => responseType({res, status: 201, message: 'success', data: updatedInfo}))
        .catch(error => responseType({res, status: 400, message: error.message}))
      }    
    })
  }

  deleteUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId);
      const admin = await userServiceInstance.getUserById(adminId as string);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(admin.roles.includes(ROLES.ADMIN)){
        userServiceInstance.deleteAccount(userId)
        .then(() => responseType({res, status: 204}))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      else return responseType({res, status: 401, message: 'unauthorized'});
    })
  }

  lockAndUnlockUserAccount(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      const {adminId} = req.query
      if (!userId || !adminId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId);
      const admin = await userServiceInstance.getUserById(adminId as string);
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

  subscribeToNotification(req: Request, res: Response){
    asyncFunc(res, async() => {
      const {subscriberId, subscribeeId} = req.params
      if(!subscriberId || !subscribeeId) return res.sendStatus(400)
      const subscribee = await userServiceInstance.getUserById(subscribeeId);
      const subscriber = await userServiceInstance.getUserById(subscriberId);
      if(!subscriber) return responseType({res, status: 404, message: 'User not found'})

      if(subscriber?.notificationSubscribers?.includes(subscribeeId)){
        subscriber.updateOne({$pull: {notificationSubscribers: { subscribeeId }}})
        .then(async() => {
          await subscribee.updateOne({$pull: { subscribed: { subscriberId } }})
          return responseType({res, status: 201, message: 'You unsubscrbed'})
        }).catch(() => responseType({res, status: 400, message: 'unable to subscribe'}))
      }
      else{
        subscriber.updateOne({$push: {notificationSubscribers: { subscribeeId }}})
        .then(async() => {
          await subscribee.updateOne({$push: { subscribed: { subscriberId } }})
          return responseType({res, status: 201, message: 'You subscrbed'})
        }).catch(() => responseType({res, status: 400, message: 'unable to subscribe'}))
      }
    })
  }

}

export default new UserController()