import { Request, Response } from "express";
import { StoryModel } from "../models/Story.js";
import { ROLES } from "../config/allowedRoles.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";
import { UserService } from "../services/userService.js";
import { StoryService } from "../services/StoryService.js";
import NotificationController from "./notificationController.js";
import { SharedStoryService } from "../services/SharedStoryService.js";
import { asyncFunc, autoDeleteOnExpire, pagination, responseType } from "../helpers/helper.js";
import { NewStoryNotificationType, RequestStoryProp, StoryProps, SubUser, UserFriends, UserProps } from "../../types.js";

class StoryController {

  private userService = new UserService()
  private storyService = new StoryService()
  private sharedStoryService = new SharedStoryService()
  private redisClientService = new KV_Redis_ClientService()

  constructor(){}

  /**
  * @description creates a new user story
  * @param req - userid 
  */
  public createNewStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async () => {
      const { userId } = req.params
      let newStory = req.body
      if (!userId || !newStory?.body) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      newStory = {...newStory, userId, author: user?.username} as StoryProps
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      this.storyService.createUserStory({...newStory})
      .then(async(story) => {
        const { _id, title, body, picture, category, commentIds, likes, author } = story as StoryProps
        const notiStory = { 
          _id, title, body: body?.slice(0, 40), picture: picture[0], 
          category, commentIds, likes, author
        } as NewStoryNotificationType
        await NotificationController.addToNotification(userId, notiStory, 'NewStory')
        return responseType({res, status: 201, count:1, data: story})
      })
      .catch((error) => responseType({res, status: 404, message: `DB ERROR: ${error.message}`}))
    })
  }

   /**
   * @description updates user story
   * @param req - userid and storyId
  */
  public updateStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      const editedStory = req.body
      if(!userId || !storyId) return res.sendStatus(400)
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.storyService.updateUserStory(storyId, editedStory)
      .then((updatedStory) => {
        if(!updatedStory) return responseType({res, status: 404, message: 'Story not found'})
        return responseType({res, status: 201, count:1, data: updatedStory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description deletes story by user
   * @param req - userid 
  */
  public deleteStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      if(!userId || !storyId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      
      await autoDeleteOnExpire(userId)
      const story = await this.storyService.getStoryById(storyId)
      if(!story) return responseType({res, status: 404, message: 'story not found'})

      if(user?.roles.includes(ROLES.ADMIN)) {
        this.storyService.deleteUserStory(storyId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      else if(!story?.userId.equals(user?._id)) return res.sendStatus(401)
      this.storyService.deleteUserStory(storyId)
      .then(async() => {
        const { _id, title, body, picture, category, commentIds, likes, author } = story as StoryProps
        const notiStory = { 
          _id, title, body: body?.slice(0, 40), picture: picture[0], 
          category, commentIds, likes, author
        } as NewStoryNotificationType
        await NotificationController.removeSingleNotification(userId, notiStory, 'NewStory')  
        return res.sendStatus(204)
      })
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // Delete user story by admin
  /**
   * @description deletes a story by admin user
   * @param req - adminId, userId, storyId 
  */
  public deleteStoryByAdmin(req: RequestStoryProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, storyId } = req.params;
      if(!adminId || !userId || !storyId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      if(!user) return responseType({res, status: 401, message: 'user not found'})

      await autoDeleteOnExpire(userId)
      const story = await this.storyService.getUserStories(userId)
      if(!story.length) return responseType({res, status: 404, message: 'user does not have a story'})

      if(user?.roles.includes(ROLES.ADMIN)) {
        this.storyService.deleteAllUserStories(userId)
        .then(() => responseType({res, status: 201, message: 'All user stories deleted'}))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      } 
      return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

   /**
   * @description fetches a single story
   * @param req - storyid 
   */
  public getStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async () => {
      const {storyId} = req.params
      if(!storyId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`singleStory:${storyId}`, timeTaken: 1800, cb: async() => {
        const story = await this.storyService.getStoryById(storyId)
        return story;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userStory: StoryProps) => {
        if(!userStory) return responseType({res, status: 404, message: 'story not found'})
        return responseType({res, status: 200, count:1, data: userStory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // HANDLE GETTING A USER STORIES
   /**
   * @description fetches all user stories
   * @param req - userid 
  */
  public getUserStory(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId} = req.params
      if(!userId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId)
      if(!user) return res.sendStatus(404)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      this.redisClientService.getCachedResponse({key: `userStory:${userId}`, cb: async() => {
        const userStory = await this.storyService.getUserStories(userId) 
        return userStory
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userStories: StoryProps[] | string) => {
        if(!userStories?.length) return responseType({res, status: 404, message: 'You have no stories'})
        return responseType({res, status: 200, count: userStories?.length, data: userStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

   /**
   * @description fetches all stories by category
   * @param req - category 
  */
  public getStoryByCategory(req: RequestStoryProp, res: Response){
    asyncFunc(res, () => {
      const {category, page, limit} = req.query
      if(!category) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`story:${category}`, cb: async() => {
        const categoryStory = await StoryModel.find({category: {$in: [category]}})
        const sharedCategoryStory = await this.sharedStoryService.getAllSharedByCategories(category as string)
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
  
  // public get_test_Story_By_Category(req: RequestStoryProp, res: Response){
  //   asyncFunc(res, async() => {
  //     const {category, page, limit} = req.query
  //     if(!category) return res.sendStatus(400);
  //     const pageNum = Number(page), limitNum = Number(limit)
  //     pagination({ page: pageNum, limit: limitNum, Models: StoryModel, callback: async() => {
  //       this.redisClientService.getCachedResponse({key:`story:${category}`, cb: async() => {
  //         const categoryStory = await StoryModel.find({category: {$in: [category]}})
  //         const sharedCategoryStory = await this.sharedStoryService.getAllSharedByCategories(category as string)
  //         const reMouldedSharedStory = sharedCategoryStory.map(share => {
  //           const storyObject = {
  //             ...share.sharedStory, sharedId: share?._id, sharedLikes: share?.sharedLikes,
  //             sharerId: share?.sharerId, sharedDate: share?.createdAt, sharedAuthor: share?.sharedAuthor
  //           }
  //           return storyObject
  //         })
  //         const refactoredModel = [...categoryStory, ...reMouldedSharedStory]
  //         return refactoredModel
  //       }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
  //     }, query: 'hello' })
  //     .then((result) => {
  //       if(!result?.data?.length) return responseType({res, status: 404, message: 'You have no stories'});
  //       return responseType({res, status: 200, pages: result?.pageable, data: result?.data})
  //     }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  //   })
  // }

   /**
   * @description fetches all stories
   */
  public getStories(req: Request, res: Response){
    asyncFunc(res, () => {
      this.redisClientService.getCachedResponse({key:'allStories', cb: async() => {
        const stories = await this.storyService.getAllStories();
        const sharedStories = await this.sharedStoryService.getAllSharedStories();
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

  /**
   * @description fetches all stories with userid in it
   * @param req - userid 
  */
  public getStoriesWithUserId(req: Request, res: Response){
    asyncFunc(res, () => {
      const {userId} = req.params
      if (!userId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`allStoriesWithUserId:${userId}`, cb: async() => {
        const stories = await this.storyService.getStoriesWithUserIdInIt(userId);
        return stories
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((allStoriesWithUserId: StoryProps[] | string) => {
        if(!allStoriesWithUserId?.length) return responseType({res, status: 404, message: 'No stories available'})
        return responseType({res, status: 200, count: allStoriesWithUserId?.length, data: allStoriesWithUserId})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description likes or unlikes a story
   * @param req - story id and userId
  */
  public like_Unlike_Story(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, storyId} = req.params
      if (!userId || !storyId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.storyService.likeAndUnlikeStory(userId, storyId)
      .then((result: Awaited<ReturnType<typeof this.storyService.likeAndUnlikeStory>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description fetches users that likes a story
   * @param req - story id 
  */
  public getStoryLikes = (req: Request, res: Response) => {
    asyncFunc(res, async() => {
      const {storyId} = req.params
      if(!storyId) return res.sendStatus(400)
      const story = await this.storyService.getStoryById(storyId);
      if(!story) return responseType({res, status: 404, message: 'You do not have an account'})
      await autoDeleteOnExpire(storyId)
      this.redisClientService.getCachedResponse({key: `usersStoryLikes:${storyId}`, cb: async() => {
        const users = await Promise.all(story?.likes?.map(async(id) => {
          const { _id, email, firstName, lastName, followers, followings } = await this.userService.getUserById(id)
          return { _id, email, firstName, lastName, followers, followings }
        })) as Partial<UserProps[]>
        return users
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((allUsers: Partial<UserProps[]>) => {
        if(!allUsers?.length) return responseType({res, status: 404, message: 'You have no likes'})
        return responseType({res, status: 200, message: 'success', count: allUsers?.length, data: allUsers})
      }).catch((error) => responseType({res, status: 400, message: error?.message}))
    })
  }
}
export default new StoryController()
