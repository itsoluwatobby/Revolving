import { Request, Response } from "express";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { Like_Unlike_Shared, createShareStory, getAllSharedStories, getSharedStoryById, getUserSharedStories, likeAndUnlikeSharedStory, unShareStory } from "../helpers/sharedHelper.js";
import { Categories, SharedProps } from "../../types.js";
import { getCachedResponse, redisClient } from "../helpers/redis.js";
import { getUserById } from "../helpers/userHelpers.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};

// Only for admin page
export const fetchSharedStories = (req: Request, res: Response) => {
  asyncFunc(res, () => {
    getCachedResponse({key:'allSharedStoriesCache', cb: async() => {
      const sharedStories = await getAllSharedStories();
      return sharedStories
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((allSharedStories: SharedProps[] | string) => {
      if(!allSharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
      return responseType({res, status: 200, count: allSharedStories?.length, data: allSharedStories})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const getSingleShared = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const {sharedId} = req.params
    if(!sharedId) return res.sendStatus(400);
    getCachedResponse({key:`sharedStory:${sharedId}`, cb: async() => {
      const shared = await getSharedStoryById(sharedId) as SharedProps
      return shared
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((sharedStory: SharedProps) => {
      if(!sharedStory) return responseType({res, status: 404, message: 'story not found'})
      return responseType({res, status: 200, count:1, data: sharedStory})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const shareStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, storyId } = req.params
    if (!userId || !storyId) return res.sendStatus(400);
    const user = await getUserById(userId)
    await autoDeleteOnExpire(userId)
    createShareStory(user, storyId)
    .then((newShare) => responseType({res, status: 201, count:1, data: newShare}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const unShareUserStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, sharedId } = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    await autoDeleteOnExpire(userId)
    const result = await unShareStory(userId, sharedId)
    redisClient.DEL(`sharedStory:${sharedId}`)
    return result == 'not found' 
        ? responseType({res, status: 404, count:0, message: result }) : result == 'unauthorized' 
            ? responseType({res, status: 401, count:0, message: result }) 
                : responseType({res, status: 201, count:1, message: 'story unshared'})
  })
}

export const getSharedStoriesByUser = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const {userId} = req.params
    if (!userId) return res.sendStatus(400);
    await autoDeleteOnExpire(userId)
    getCachedResponse({key:`userSharedStories:${userId}`, timeTaken: 1800, cb: async() => {
      const sharedStory = await getUserSharedStories(userId) as SharedProps[]
      return sharedStory;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
    .then((sharedStories: SharedProps[] | string) => {
      if(!sharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
      return responseType({res, status: 200, count: sharedStories?.length, data: sharedStories})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const like_Unlike_SharedStory = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, sharedId} = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    likeAndUnlikeSharedStory(userId, sharedId)
    .then((result: Like_Unlike_Shared) => responseType({res, status: 201, message: result}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

