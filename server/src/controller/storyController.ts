import { Request, Response } from "express";
import { StoryModel } from "../models/Story.js";
import { ROLES } from "../config/allowedRoles.js";
import { Categories, StoryProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";
import { createUserStory, deleteAllUserStories, deleteUserStory, getAllStories, getStoriesWithUserIdInIt, getStoryById, getUserStories, likeAndUnlikeStory, updateUserStory } from "../services/StoryService.js";
import { getAllSharedByCategories, getAllSharedStories } from "../services/SharedStoryService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { getUserById } from "../services/userService.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};


  export function createNewStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId } = req.params
      let newStory = req.body
      if (!userId || !newStory?.body) return res.sendStatus(400)
      const user = await getUserById(userId);
      await autoDeleteOnExpire(userId)
      newStory = {...newStory, userId, author: user?.username} as StoryProps
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      createUserStory({...newStory})
      .then((story) => responseType({res, status: 201, count:1, data: story}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function updateStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      const editedStory = req.body
      await autoDeleteOnExpire(userId)
      if(!userId || !storyId) return res.sendStatus(400)
      const user = await getUserById(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      updateUserStory(storyId, editedStory)
      .then((updatedStory) => {
        if(!updatedStory) return responseType({res, status: 404, message: 'Story not found'})
        return responseType({res, status: 201, count:1, data: updatedStory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function deleteStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      if(!userId || !storyId) return res.sendStatus(400)
      const user = await getUserById(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      
      await autoDeleteOnExpire(userId)
      const story = await getStoryById(storyId)
      if(!story) return responseType({res, status: 404, message: 'story not found'})

      if(user?.roles.includes(ROLES.ADMIN)) {
        deleteUserStory(storyId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      else if(!story?.userId.equals(user?._id)) return res.sendStatus(401)
      deleteUserStory(storyId)
      .then(() => res.sendStatus(204))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // Delete user story by admin
  export function deleteStoryByAdmin(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, storyId } = req.params;
      if(!adminId || !userId || !storyId) return res.sendStatus(400)
      const user = await getUserById(userId)
      if(!user) return responseType({res, status: 401, message: 'user not found'})

      await autoDeleteOnExpire(userId)
      const story = await getUserStories(userId)
      if(!story.length) return responseType({res, status: 404, message: 'user does not have a story'})

      if(user?.roles.includes(ROLES.ADMIN)) {
        deleteAllUserStories(userId)
        .then(() => responseType({res, status: 201, message: 'All user stories deleted'}))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      } 
      return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

  export function getStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const {storyId} = req.params
      if(!storyId) return res.sendStatus(400);
      getCachedResponse({key:`singleStory:${storyId}`, timeTaken: 1800, cb: async() => {
        const story = await getStoryById(storyId)
        return story;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userStory: StoryProps) => {
        if(!userStory) return responseType({res, status: 404, message: 'story not found'})
        return responseType({res, status: 200, count:1, data: userStory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // HANDLE GETTING A USER STORIES
  export function getUserStory(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      await autoDeleteOnExpire(userId)
      if(!userId) return res.sendStatus(400);
      const user = await getUserById(userId)
      if(!user) return res.sendStatus(404)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      getCachedResponse({key: `userStory:${userId}`, cb: async() => {
        const userStory = await getUserStories(userId) 
        return userStory
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userStories: StoryProps[] | string) => {
        if(!userStories?.length) return responseType({res, status: 404, message: 'You have no stories'})
        return responseType({res, status: 200, count: userStories?.length, data: userStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function getStoryByCategory(req: RequestProp, res: Response){
    asyncFunc(res, () => {
      const {category} = req.query
      if(!category) return res.sendStatus(400);
      getCachedResponse({key:`story:${category}`, cb: async() => {
        const categoryStory = await StoryModel.find({category: {$in: [category]}})
        const sharedCategoryStory = await getAllSharedByCategories(category as string)
        const reMouldedSharedStory = sharedCategoryStory.map(share => {
          const storyObject = {
            ...share.sharedStory, sharedId: share?._id, sharedLikes: share?.sharedLikes,
            sharerId: share?.sharerId, sharedDate: share?.createdAt, sharedAuthor: share?.sharedAuthor
          }
          return storyObject
        })
        const refactoredModel = [...categoryStory, ...reMouldedSharedStory]
        return refactoredModel
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((storyCategory: StoryProps[] | string) => {
        if(!storyCategory?.length) return responseType({res, status: 404, message: 'You have no stories'});
        return responseType({res, status: 200, count: storyCategory?.length, data: storyCategory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function getStories(req: Request, res: Response){
    asyncFunc(res, () => {
      getCachedResponse({key:'allStories', cb: async() => {
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
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((allStories: StoryProps[] | string) => {
        if(!allStories?.length) return responseType({res, status: 404, message: 'No stories available'})
        return responseType({res, status: 200, count: allStories?.length, data: allStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function getStoriesWithUserId(req: Request, res: Response){
    asyncFunc(res, () => {
      const {userId} = req.params
      if (!userId) return res.sendStatus(400);
      getCachedResponse({key:`allStoriesWithUserId:${userId}`, cb: async() => {
        const stories = await getStoriesWithUserIdInIt(userId);
        return stories
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((allStoriesWithUserId: StoryProps[] | string) => {
        if(!allStoriesWithUserId?.length) return responseType({res, status: 404, message: 'No stories available'})
        return responseType({res, status: 200, count: allStoriesWithUserId?.length, data: allStoriesWithUserId})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  export function like_Unlike_Story(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, storyId} = req.params
      if (!userId || !storyId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const user = await getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      likeAndUnlikeStory(userId, storyId)
      .then((result: Awaited<ReturnType<typeof likeAndUnlikeStory>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
