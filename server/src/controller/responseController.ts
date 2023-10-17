import { Request, Response } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { CommentResponseProps, RequestProp } from "../../types.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { UserService } from "../services/userService.js";
import { CommentService } from "../services/commentService.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";


class ResponseController {

  private userService = new UserService()
  private responseService = new CommentService()
  private redisClientService = new KV_Redis_ClientService()

  constructor(){}

  public createNewResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId } = req.params
      let newResponse: Partial<CommentResponseProps> = req.body
      if (!userId || !commentId || !newResponse?.response) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      newResponse = {...newResponse, author: user?.username}
      const comment = await this.responseService.getCommentById(commentId)
      if(!comment) return responseType({res, status: 404, message: 'Comment not found'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      this.responseService.createResponse({...newResponse})
      .then((response) => responseType({res, status: 201, count:1, data: response}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public updateResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, responseId } = req.params;
      const editedResponse = req.body
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      const responseExist = await this.responseService.getResponseById(responseId)
      if(!responseExist) return responseType({res, status: 404, message: 'Response not found'})
      this.responseService.editResponse(userId, responseId, editedResponse)
      .then((response) => responseType({res, status: 201, count:1, data: response}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public deleteResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, responseId } = req.params;
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      const response = await this.responseService.getResponseById(responseId) as CommentResponseProps
      if(user?.roles.includes(ROLES.ADMIN)) {
        this.responseService.deleteSingleResponse(responseId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      if(response?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
      this.responseService.deleteSingleResponse(responseId)
      .then(() => res.sendStatus(204))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // ADMIN USER
  public deleteUserResponses(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, responseId } = req.params;
      const option = req.query as { command: string, commentId: string }
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      const adminUser = await this.userService.getUserById(adminId)
      await autoDeleteOnExpire(userId)
      if(!user || !adminUser) return responseType({res, status: 404, message: 'You do not have an account'})
      if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

      if(adminUser?.roles.includes(ROLES.ADMIN)) {
        if(option?.command == 'onlyInComment'){
          this.responseService.deleteAllUserResponseInComment(userId, option?.commentId)
          .then(() => responseType({res, status: 201, message: 'All user responses in comment deleted'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
        else if(option?.command == 'allUserResponse'){
          this.responseService.deleteAllUserResponses(userId)
          .then(() => responseType({res, status: 201, message: 'All user responses deleted'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
      }
      else return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

  public getResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const {responseId} = req.params
      if(!responseId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`singleResponse:${responseId}`, timeTaken: 1800, cb: async() => {
        const response = await this.responseService.getResponseById(responseId)
        return response;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userResponse: CommentResponseProps) => {
        if(!userResponse) return responseType({res, status: 404, message: 'response not found'})
        return responseType({res, status: 200, count:1, data: userResponse})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // FOR ADMIN PAGE
  public userResponses(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {adminId, userId, responseId} = req.params
      if(!userId || !adminId || !responseId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId)
      if(!user) return res.sendStatus(404)
      await autoDeleteOnExpire(userId)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      const admin = await this.userService.getUserById(adminId)
      if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
      this.redisClientService.getCachedResponse({key: `userResponses:${userId}/${responseId}`, cb: async() => {
        const userResponse = await this.responseService.getUserResponses(userId, responseId) 
        return userResponse
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userResponses: CommentResponseProps[] | string) => {
        if(!userResponses?.length) return responseType({res, status: 404, message: 'User have no response'})
        return responseType({res, status: 200, count: userResponses?.length, data: userResponses})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public getResponseByComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { commentId } = req.params;
      if(!commentId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`responseInComment:${commentId}`, cb: async() => {
        const responses = await this.responseService.getAllCommentsResponse(commentId);
        return responses
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((responsesInStories: CommentResponseProps[] | string) => {
        if(!responsesInStories?.length) return responseType({res, status: 404, message: 'No responses available'})
        return responseType({res, status: 200, count: responsesInStories?.length, data: responsesInStories})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  ///////////////////////////////////////////

  // getStoryComments = (req: RequestProp, res: Response) => {
  //   asyncFunc(res, async() => {
  //     const { storyId } = req.query
  //     if(!storyId) return res.sendStatus(400);
  //     const storyComments = await getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
  //       const storyComment = await getAllCommentsInStory(storyId as string)
  //       return storyComment
  //     }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (CommentProps[] | string)
      
  //     if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
  //     return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
  //   })
  // }

  public like_Unlike_Response(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, responseId} = req.params
      if (!userId || !responseId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      this.responseService.likeAndUnlikeResponse(userId, responseId)
      .then((result: Awaited<ReturnType<typeof this.responseService.likeAndUnlikeResponse>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
}
export default new ResponseController()
