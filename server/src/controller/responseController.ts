import { Request, Response } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { CommentResponseProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";
import userServiceInstance from "../services/userService.js";
import responseServiceInstance from "../services/commentService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";

interface RequestProp extends Request{
  userId: string,
  responseId: string,
  commentId: string,
  // newComment: CommentProps
};

class ResponseController{


  createNewResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId } = req.params
      let newResponse: Partial<CommentResponseProps> = req.body
      if (!userId || !commentId || !newResponse?.response) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      newResponse = {...newResponse, author: user?.username}
      const comment = await responseServiceInstance.getCommentById(commentId)
      if(!comment) return responseType({res, status: 404, message: 'Comment not found'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      responseServiceInstance.createResponse({...newResponse})
      .then((response) => responseType({res, status: 201, count:1, data: response}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  updateResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, responseId } = req.params;
      const editedResponse = req.body
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      const responseExist = await responseServiceInstance.getResponseById(responseId)
      if(!responseExist) return responseType({res, status: 404, message: 'Response not found'})
      responseServiceInstance.editResponse(userId, responseId, editedResponse)
      .then((response) => responseType({res, status: 201, count:1, data: response}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  deleteResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, responseId } = req.params;
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      const response = await responseServiceInstance.getResponseById(responseId) as CommentResponseProps
      if(user?.roles.includes(ROLES.ADMIN)) {
        responseServiceInstance.deleteSingleResponse(responseId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
      }
      if(response?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
      responseServiceInstance.deleteSingleResponse(responseId)
      .then(() => res.sendStatus(204))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // ADMIN USER
  deleteUserResponses(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, responseId } = req.params;
      const option = req.query as { command: string, commentId: string }
      if(!userId || !responseId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      const adminUser = await userServiceInstance.getUserById(adminId)
      await autoDeleteOnExpire(userId)
      if(!user || !adminUser) return responseType({res, status: 404, message: 'You do not have an account'})
      if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

      if(adminUser?.roles.includes(ROLES.ADMIN)) {
        if(option?.command == 'onlyInComment'){
          responseServiceInstance.deleteAllUserResponseInComment(userId, option?.commentId)
          .then(() => responseType({res, status: 201, message: 'All user responses in comment responseServiceInstance.deleted'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
        else if(option?.command == 'allUserResponse'){
          responseServiceInstance.deleteAllUserResponses(userId)
          .then(() => responseType({res, status: 201, message: 'All user responses deleted'}))
          .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
        }
      }
      else return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

  getResponse(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const {responseId} = req.params
      if(!responseId) return res.sendStatus(400);
      getCachedResponse({key:`singleResponse:${responseId}`, timeTaken: 1800, cb: async() => {
        const response = await responseServiceInstance.getResponseById(responseId)
        return response;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userResponse: CommentResponseProps) => {
        if(!userResponse) return responseType({res, status: 404, message: 'response not found'})
        return responseType({res, status: 200, count:1, data: userResponse})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // FOR ADMIN PAGE
  userResponses(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {adminId, userId, responseId} = req.params
      if(!userId || !adminId || !responseId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId)
      if(!user) return res.sendStatus(404)
      await autoDeleteOnExpire(userId)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      const admin = await userServiceInstance.getUserById(adminId)
      if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
      getCachedResponse({key: `userResponses:${userId}/${responseId}`, cb: async() => {
        const userResponse = await responseServiceInstance.getUserResponses(userId, responseId) 
        return userResponse
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userResponses: CommentResponseProps[] | string) => {
        if(!userResponses?.length) return responseType({res, status: 404, message: 'User have no response'})
        return responseType({res, status: 200, count: userResponses?.length, data: userResponses})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  getResponseByComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { commentId } = req.params;
      if(!commentId) return res.sendStatus(400);
      getCachedResponse({key:`responseInComment:${commentId}`, cb: async() => {
        const responses = await responseServiceInstance.getAllCommentsResponse(commentId);
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

  like_Unlike_Response(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, responseId} = req.params
      if (!userId || !responseId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      responseServiceInstance.likeAndUnlikeResponse(userId, responseId)
      .then((result: Awaited<ReturnType<typeof responseServiceInstance.likeAndUnlikeResponse>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
}

export default new ResponseController()