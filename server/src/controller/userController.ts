import { Request, Response } from "express";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { followOrUnFollow, getAllUsers, getUserById } from "../helpers/userHelpers.js";
import { UserProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";

export const getUsers = async(req: Request, res: Response) => {
  asyncFunc(res, async() => { 
    const users = await getCachedResponse({key:`allUsers`, cb: async() => {
      const allUsers = await getAllUsers()
      if(!allUsers?.length) return responseType({res, status: 404, message: 'No users available'})
      return allUsers
    }}) as UserProps[];
    return responseType({res, status: 200, count: users?.length, data: users})
  })
}

export const getUser = async(req: Request, res: Response) => {
  asyncFunc(res, async() => { 
    const {userId} = req.params
    const user = await getCachedResponse({key: `user:${userId}`, cb: async() => {
      const current = await getUserById(userId)
      if(!current) return responseType({res, status: 404, message: 'User not found'})
      return current;
    }}) as UserProps;
    return responseType({res, status: 200, count: 1, data: user})
  })
}

export const followUnFollowUser = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {followerId, followingId} = req.params
    if (!followerId || !followingId) return res.sendStatus(400);
    const user = await getUserById(followingId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await followOrUnFollow(followerId, followingId);
    result != 'duplicate' ? 
        responseType({res, status: 201, message: result}) 
            : responseType({res, status: 409, message: 'You cannot follow yourself'})
  })
}

