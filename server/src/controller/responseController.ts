import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { CommentResponseProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";
import { Like_Unlike_Response, createResponse, deleteAllUserResponseInComment, deleteAllUserResponses, deleteSingleResponse, editResponse, getAllCommentsResponse, getCommentById, getResponseById, getUserResponses, likeAndUnlikeResponse } from "../helpers/commentHelper.js";
import { CommentModel } from "../models/CommentModel.js";

interface RequestProp extends Request{
  userId: string,
  responseId: string,
  commentId: string,
  // newComment: CommentProps
};

export const createNewResponse = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, commentId } = req.params
    let newResponse: Partial<CommentResponseProps> = req.body
    if (!userId || !commentId || !newResponse?.response) return res.sendStatus(400)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    newResponse = {...newResponse, author: user?.username}
    const comment = await getCommentById(commentId)
    if(!comment) return responseType({res, status: 404, message: 'Comment not found'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const response = await createResponse({...newResponse});
    return responseType({res, status: 201, count:1, data: response})
  })
}

export const updateResponse = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, responseId } = req.params;
    const editedResponse = req.body
    if(!userId || !responseId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const responseExist = await getResponseById(responseId)
    if(!responseExist) return responseType({res, status: 404, message: 'Response not found'})
    const response = await editResponse(userId, responseId, editedResponse)
    return responseType({res, status: 201, count:1, data: response})
  })
}

export const deleteResponse = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, responseId } = req.params;
    if(!userId || !responseId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const response = await getResponseById(responseId) as CommentResponseProps
    if(user?.roles.includes(ROLES.ADMIN)) {
      await deleteSingleResponse(responseId)
      return res.sendStatus(204)
    }
    if(response?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
    await deleteSingleResponse(responseId)
    return res.sendStatus(204)
  })
}

// ADMIN USER
export const deleteUserResponses = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { adminId, userId, responseId } = req.params;
    const option = req.query as { command: string, commentId: string }
    if(!userId || !responseId) return res.sendStatus(400)
    const user = await getUserById(userId)
    const adminUser = await getUserById(adminId)
    if(!user || !adminUser) return responseType({res, status: 404, message: 'You do not have an account'})
    if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    if(adminUser?.roles.includes(ROLES.ADMIN)) {
      if(option?.command == 'onlyInComment'){
        await deleteAllUserResponseInComment(userId, option?.commentId)
        return responseType({res, status: 201, message: 'All user responses in comment deleted'})
      }
      else if(option?.command == 'allUserResponse'){
        await deleteAllUserResponses(userId)
        return responseType({res, status: 201, message: 'All user responses deleted'})
      }
    }
    return responseType({res, status: 401, message: 'unauthorized'})
  })
}

export const getResponse = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {responseId} = req.params
    if(!responseId) return res.sendStatus(400);
    const userResponse = await getCachedResponse({key:`singleResponse:${responseId}`, timeTaken: 1800, cb: async() => {
      const response = await getResponseById(responseId)
      return response;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as CommentResponseProps;
    
    if(!userResponse) return responseType({res, status: 404, message: 'response not found'})
    responseType({res, status: 200, count:1, data: userResponse})
  })
}

// FOR ADMIN PAGE
export const userResponses = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {adminId, userId, responseId} = req.params
    if(!userId || !adminId || !responseId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(!user) return res.sendStatus(404)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const admin = await getUserById(adminId)
    if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
    const userResponses = await getCachedResponse({key: `userResponses:${userId}/${responseId}`, cb: async() => {
      const userResponse = await getUserResponses(userId, responseId) 
      return userResponse
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })  as (CommentResponseProps[] | string);
    
    if(!userResponses?.length) return responseType({res, status: 404, message: 'User have no response'})
    return responseType({res, status: 200, count: userResponses?.length, data: userResponses})
  })
}

export const getResponseByComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { commentId } = req.params;
    if(!commentId) return res.sendStatus(400);
    const responsesInStories = await getCachedResponse({key:`responseInComment:${commentId}`, cb: async() => {
      const responses = await getAllCommentsResponse(commentId);
      return responses
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (CommentResponseProps[] | string)

    if(!responsesInStories?.length) return responseType({res, status: 404, message: 'No responses available'})
    return responseType({res, status: 200, count: responsesInStories?.length, data: responsesInStories})
  })
}

///////////////////////////////////////////

// export const getStoryComments = (req: RequestProp, res: Response) => {
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

export const like_Unlike_Response = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, responseId} = req.params
    if (!userId || !responseId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeResponse(userId, responseId) as Like_Unlike_Response;
    responseType({res, status: 201, message: result})
  })
}

