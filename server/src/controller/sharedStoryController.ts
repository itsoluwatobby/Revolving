import { Request, Response } from "express";
import { UserService } from "../services/userService.js";
import { RedisClientService } from "../helpers/redis.js";
import { SharedStoryService } from "../services/SharedStoryService.js";
import { RequestStoryProp, SharedProps } from "../../types.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";


class SharedStoryController {

  private userService = new UserService()
  private sharedStoryService = new SharedStoryService()
  private redisClientService = new RedisClientService()

  constructor(){}

  // Only for admin page
  /**
   * @description fetches all shared stories
  */
  public fetchSharedStories(req: Request, res: Response){
    asyncFunc(res, () => {
      this.redisClientService.getCachedResponse({key:'allSharedStoriesCache', cb: async() => {
        const sharedStories = await this.sharedStoryService.getAllSharedStories();
        return sharedStories
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((allSharedStories: SharedProps[] | string) => {
        if(!allSharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
        return responseType({res, status: 200, count: allSharedStories?.length, data: allSharedStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description fetches a single shared story
   * @param req - shared story id 
  */
  public getSingleShared(req: RequestStoryProp, res: Response){
    asyncFunc(res, async() => {
      const {sharedId} = req.params
      if(!sharedId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`sharedStory:${sharedId}`, cb: async() => {
        const shared = await this.sharedStoryService.getSharedStoryById(sharedId) as SharedProps
        return shared
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((sharedStory: SharedProps) => {
        if(!sharedStory) return responseType({res, status: 404, message: 'story not found'})
        return responseType({res, status: 200, count:1, data: sharedStory})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description shares a story
   * @param req - userId and story id
  */
  public shareStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async() => {
      const { userId, storyId } = req.params
      if (!userId || !storyId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      this.sharedStoryService.createShareStory(user, storyId)
      .then((newShare) => responseType({res, status: 201, count:1, data: newShare}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description unshares a story
   * @param req - userId and shared story id
  */
  public unShareUserStory(req: RequestStoryProp, res: Response){
    asyncFunc(res, async() => {
      const { userId, sharedId } = req.params
      if (!userId || !sharedId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const result = await this.sharedStoryService.unShareStory(userId, sharedId)
      this.redisClientService.redisClient.DEL(`sharedStory:${sharedId}`)
      return result == 'not found' 
          ? responseType({res, status: 404, count:0, message: result }) : result == 'unauthorized' 
              ? responseType({res, status: 401, count:0, message: result }) 
                  : responseType({res, status: 201, count:1, message: 'story unshared'})
    })
  }

  /**
   * @description fetches shared stories user
   * @param req - userId 
  */
  public getSharedStoriesByUser(req: RequestStoryProp, res: Response){
    asyncFunc(res, async() => {
      const {userId} = req.params
      if (!userId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      this.redisClientService.getCachedResponse({key:`userSharedStories:${userId}`, timeTaken: 1800, cb: async() => {
        const sharedStory = await this.sharedStoryService.getUserSharedStories(userId) as SharedProps[]
        return sharedStory;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE']})
      .then((sharedStories: SharedProps[] | string) => {
        if(!sharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
        return responseType({res, status: 200, count: sharedStories?.length, data: sharedStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  /**
   * @description likes a shared story
   * @param req - userId and shared story id 
  */
  public like_Unlike_SharedStory(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, sharedId} = req.params
      if (!userId || !sharedId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.sharedStoryService.likeAndUnlikeSharedStory(userId, sharedId)
      .then((result: Awaited<ReturnType<typeof this.sharedStoryService.likeAndUnlikeSharedStory>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
}
export default new SharedStoryController()
