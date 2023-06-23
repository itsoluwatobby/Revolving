import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { CommentProps } from "../../types.js";
import { getCachedResponse } from "../helpers/redis.js";
import { Like_Unlike_Comment, createComment, deleteAllUserComments, deleteAllUserCommentsInStory, deleteSingleComment, editComment, getAllCommentsInStory, getCommentById, getUserComments, getUserCommentsInStory, likeAndUnlikeComment } from "../helpers/commentHelper.js";
import { getStoryById } from "../helpers/storyHelpers.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  commentId: string,
  // newComment: CommentProps
};

export const createNewComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params
    const newComment: Partial<CommentProps> = req.body
    if (!userId || !storyId || !newComment?.comment) return res.sendStatus(400)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    const story = await getStoryById(storyId)
    if(!story) return responseType({res, status: 404, message: 'Story not found'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const comment = await createComment({...newComment});
    return responseType({res, status: 201, count:1, data: comment})
  })
}

export const updateComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, commentId } = req.params;
    const editedComment = req.body
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const comment = await editComment(userId, commentId, editedComment)
    return responseType({res, status: 201, count:1, data: comment})
  })
}

export const deleteComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, commentId } = req.params;
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    const comment = await getCommentById(commentId) as CommentProps
    if(user?.roles.includes(ROLES.ADMIN)) {
      await deleteSingleComment(commentId)
      return res.sendStatus(204)
    }
    if(comment?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
    await deleteSingleComment(commentId)
    return res.sendStatus(204)
  })
}

// ADMIN USER
export const deleteUserComments = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { adminId, userId, commentId } = req.params;
    const option = req.query as { command: string, storyId: string }
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    const adminUser = await getUserById(adminId)
    if(!user || !adminUser) return responseType({res, status: 401, message: 'You do not have an account'})
    if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    if(adminUser?.roles.includes(ROLES.ADMIN)) {
      if(option?.command == 'onlyInStory'){
        await deleteAllUserCommentsInStory(userId, option?.storyId)
        return responseType({res, status: 201, message: 'All user comments in story deleted'})
      }
      else if(option?.command == 'allUserComment'){
        await deleteAllUserComments(userId)
        return responseType({res, status: 201, message: 'All user comments deleted'})
      }
    }
    return responseType({res, status: 401, message: 'unauthorized'})
  })
}

export const getComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {commentId} = req.params
    if(!commentId) return res.sendStatus(400);
    const userComment = await getCachedResponse({key:`singleComment:${commentId}`, timeTaken: 1800, cb: async() => {
      const comment = await getCommentById(commentId)
      return comment;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as CommentProps;
    
    if(!userComment) return responseType({res, status: 404, message: 'comment not found'})
    responseType({res, status: 200, count:1, data: userComment})
  })
}

// FOR ADMIN PAGE
export const userComments = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {adminId, userId} = req.params
    if(!adminId || !userId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(!user) return res.sendStatus(404)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const admin = await getUserById(adminId)
    if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
    const userComments = await getCachedResponse({key: `userComments:${userId}`, cb: async() => {
      const userComment = await getUserComments(userId) 
      return userComment
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })  as (CommentProps[] | string);
    
    if(!userComments?.length) return responseType({res, status: 404, message: 'User have no comments'})
    return responseType({res, status: 200, count: userComments?.length, data: userComments})
  })
}

export const getUserCommentStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400);
    const commentsInStories = await getCachedResponse({key:`userCommentsInStories:${userId}`, cb: async() => {
      const comments = await getUserCommentsInStory(userId, storyId);
      return comments
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (CommentProps[] | string)

    if(!commentsInStories?.length) return responseType({res, status: 404, message: 'No comments by you'})
    return responseType({res, status: 200, count: commentsInStories?.length, data: commentsInStories})
  })
}

///////////////////////////////////////////

export const getStoryComments = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { storyId } = req.params
    if(!storyId) return res.sendStatus(400);
    const storyComments = await getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
      const storyComment = await getAllCommentsInStory(storyId as string)
      return storyComment
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (CommentProps[] | string)
    
    if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
    return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
  })
}

export const like_Unlike_Comment = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, commentId} = req.params
    if (!userId || !commentId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeComment(userId, commentId) as Like_Unlike_Comment;
    responseType({res, status: 201, message: result})
  })
}

