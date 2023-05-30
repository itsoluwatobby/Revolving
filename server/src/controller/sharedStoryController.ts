import { Request, Response } from "express";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { Like_Unlike_Shared, createShareStory, getAllSharedStories, getSharedStoryById, getUserSharedStories, likeAndUnlikeSharedStory, unShareStory } from "../helpers/sharedHelper.js";
import { Categories, SharedProps, StoryProps } from "../../types.js";
import { getCachedResponse, redisClient } from "../helpers/redis.js";
import { getUserById } from "../helpers/userHelpers.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};

// SHARED STORIES ROUTE
export const getSharedStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {sharedId} = req.params
    if(!sharedId) return res.sendStatus(400);
    const sharedStory = await getCachedResponse({key:`sharedStory:${sharedId}`, cb: async() => {
      const shared = await getSharedStoryById(sharedId) as SharedProps
      return shared
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as SharedProps;

    if(!sharedStory) return responseType({res, status: 404, message: 'story not found'})
    responseType({res, status: 200, count:1, data: sharedStory})
  })
}

export const shareStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, storyId } = req.params
    if (!userId || !storyId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const newShare = await createShareStory(userId, storyId)
    return responseType({res, status: 201, count:1, data: newShare})
  })
}

export const unShareUserStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, sharedId } = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
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
    const sharedStories = await getCachedResponse({key:`userSharedStories:${userId}`, timeTaken: 1800, cb: async() => {
      const sharedStory = await getUserSharedStories(userId) as SharedProps[]
      return sharedStory;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']}) as (SharedProps[] | string);

    if(!sharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
    return responseType({res, status: 200, count: sharedStories?.length, data: sharedStories})
  })
}

export const like_Unlike_SharedStory = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, sharedId} = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeSharedStory(userId, sharedId) as Like_Unlike_Shared;
    responseType({res, status: 201, message: result})
  })
}

// Only for admin page
export const fetchSharedStory = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const allSharedStories = await getCachedResponse({key:'allSharedStoriesCache', cb: async() => {
      const sharedStories = await getAllSharedStories();
      return sharedStories
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (StoryProps[] | string)

    if(!allSharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
    return responseType({res, status: 200, count: allSharedStories?.length, data: allSharedStories})
  })
}

