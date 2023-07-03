import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { Like_Unlike, createUserStory, deleteAllUserStories, deleteUserStory, getAllStories, getStoryById, getUserStories, likeAndUnlikeStory, updateUserStory } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { StoryModel } from "../models/Story.js";
import { getAllSharedByCategories, getAllSharedStories } from "../helpers/sharedHelper.js";
import { Categories, StoryProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};

export const createNewStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId } = req.params
    let newStory = req.body
    if (!userId || !newStory?.title || !newStory?.body) return res.sendStatus(400)
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    newStory = {...newStory, userId, author: user?.username} as StoryProps
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await createUserStory({...newStory});
    return responseType({res, status: 201, count:1, data: story})
  })
}

export const updateStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    const editedStory = req.body
    await autoDeleteOnExpire(userId)
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const updatedStory = await updateUserStory(storyId, editedStory)
    if(!updatedStory) return responseType({res, status: 404, message: 'Story not found'})
    return responseType({res, status: 201, count:1, data: updatedStory})
  })
}

export const deleteStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    
    await autoDeleteOnExpire(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await getStoryById(storyId)
    if(!story) return responseType({res, status: 404, message: 'story not found'})

    if(user?.roles.includes(ROLES.ADMIN)) {
      await deleteUserStory(storyId)
      return res.sendStatus(204)
    }
    if(!story?.userId.equals(user?._id)) return res.sendStatus(401)
    await deleteUserStory(storyId)
    return res.sendStatus(204)
  })
}

// Delete user story by admin
export const deleteStoryByAdmin = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { adminId, userId, storyId } = req.params;
    if(!adminId || !userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'user not found'})

    await autoDeleteOnExpire(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await getUserStories(userId)
    if(!story.length) return responseType({res, status: 404, message: 'user does not have a story'})

    if(user?.roles.includes(ROLES.ADMIN)) {
      await deleteAllUserStories(userId)
      return responseType({res, status: 201, message: 'All user stories deleted'})
    } 
    return responseType({res, status: 401, message: 'unauthorized'})
  })
}

export const getStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {storyId} = req.params
    if(!storyId) return res.sendStatus(400);
    const userStory = await getCachedResponse({key:`singleStory:${storyId}`, timeTaken: 1800, cb: async() => {
      const story = await getStoryById(storyId)
      return story;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as StoryProps;
    
    if(!userStory) return responseType({res, status: 404, message: 'story not found'})
    responseType({res, status: 200, count:1, data: userStory})
  })
}

// HANDLE GETTING A USER STORIES
export const getUserStory = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId} = req.params
    await autoDeleteOnExpire(userId)
    if(!userId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(!user) return res.sendStatus(404)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const userStories = await getCachedResponse({key: `userStory:${userId}`, cb: async() => {
      const userStory = await getUserStories(userId) 
      return userStory
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })  as (StoryProps[] | string);
    
    if(!userStories?.length) return responseType({res, status: 404, message: 'You have no stories'})
    return responseType({res, status: 200, count: userStories?.length, data: userStories})
  })
}

export const getStoryByCategory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const {category} = req.query
    if(!category) return res.sendStatus(400);
    const storyCategory = await getCachedResponse({key:`story:${category}`, cb: async() => {
      const categoryStory = await StoryModel.find({category: {$in: [category]}})
      const sharedCategoryStory = await getAllSharedByCategories(category as string)
      const reMoulded = sharedCategoryStory.map(share => {
        const object = {
          ...share.sharedStory, sharedId: share?._id, sharedLikes: share?.sharedLikes,
          sharerId: share?.sharerId, sharedDate: share?.createdAt
        }
        return object
      })
      const refactoredModel = [...categoryStory, ...reMoulded]
      return refactoredModel
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (StoryProps[] | string)
    
    if(!storyCategory?.length) return responseType({res, status: 404, message: 'You have no stories'});
    return responseType({res, status: 200, count: storyCategory?.length, data: storyCategory})
  })
}

export const getStories = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const allStories = await getCachedResponse({key:'allStories', cb: async() => {
      const stories = await getAllStories();
      const sharedStories = await getAllSharedStories();
      const reMoulded = sharedStories.map(share => {
        const object = {
          ...share.sharedStory, sharedId: share?._id, sharedLikes: share?.sharedLikes,
          sharerId: share?.sharerId,
          sharedDate: share?.createdAt 
        }
        return object
      })
      const everyStories = [...stories, ...reMoulded]
      return everyStories
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (StoryProps[] | string)

    if(!allStories?.length) return responseType({res, status: 404, message: 'No stories available'})
    return responseType({res, status: 200, count: allStories?.length, data: allStories})
  })
}

export const like_Unlike_Story = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, storyId} = req.params
    await autoDeleteOnExpire(userId)
    if (!userId || !storyId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeStory(userId, storyId) as Like_Unlike;
    responseType({res, status: 201, message: result})
  })
}

// async function runN(){
//   const sharedCategoryStory = await getAllSharedByCategories('Node')
//   console.log(sharedCategoryStory)
// }
// runN()