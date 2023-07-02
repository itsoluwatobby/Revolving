import { Request, Response } from "express";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { deleteAccount, followOrUnFollow, getAllUsers, getUserById, updateUser } from "../helpers/userHelpers.js";
import { UserProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";
import { ROLES } from "../config/allowedRoles.js";
import bcrypt from 'bcrypt'

export const getUsers = (req: Request, res: Response) => {
  asyncFunc(res, async() => { 
    const users = await getCachedResponse({key:`allUsers`, cb: async() => {
      const allUsers = await getAllUsers()
      if(!allUsers?.length) return responseType({res, status: 404, message: 'No users available'})
      return allUsers
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']}) as UserProps[];
    return responseType({res, status: 200, count: users?.length, data: users})
  })
}

export const getUser = (req: Request, res: Response) => {
  asyncFunc(res, async() => { 
    const {userId} = req.params
    const user = await getCachedResponse({key: `user:${userId}`, cb: async() => {
      const current = await getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!current) return responseType({res, status: 404, message: 'User not found'})
      return current;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']}) as UserProps;
    return responseType({res, status: 200, count: 1, data: user})
  })
}

export const followUnFollowUser = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {followerId, followingId} = req.params
    if (!followerId || !followingId) return res.sendStatus(400);
    const user = await getUserById(followingId);
    await autoDeleteOnExpire(followerId)
    if(!user) return responseType({res, status: 404, message: 'user not found'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await followOrUnFollow(followerId, followingId);
    result != 'duplicate' ? 
        responseType({res, status: 201, message: result}) 
            : responseType({res, status: 409, message: 'You cannot follow yourself'})
  })
}

export const updateUserInfo = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId} = req.params
    const userInfo: UserProps = req.body
    if (!userId) return res.sendStatus(400);
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    if(userInfo?.authentication?.password){
      const newPassword = userInfo?.authentication?.password
      const conflictingPassword = await bcrypt.compare(newPassword, user?.authentication?.password);
      if(conflictingPassword) return responseType({res, status:409, message:'same as old password'})
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.updateOne({$set: { authentication: { password: hashedPassword }}})
        .then(() => responseType({res, status:201, message:'password reset successful'}))
        .catch(() => res.sendStatus(500));
    }
    else{
      await updateUser(userId, userInfo)
      .then(updatedInfo => {
        return responseType({res, status: 201, message: 'success', data: updatedInfo});
      })
      .catch(error => responseType({res, status: 400, message: error.message}))
    }    
  })
}

export const deleteUserAccount = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId} = req.params
    const {adminId} = req.query
    if (!userId) return res.sendStatus(400);
    const user = await getUserById(userId);
    const admin = await getUserById(adminId as string);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    if(user || admin.roles.includes(ROLES.ADMIN)){
      await deleteAccount(userId);
      return responseType({res, status: 204})
    }
    return responseType({res, status: 401, message: 'unauthorized'});
  })
}
