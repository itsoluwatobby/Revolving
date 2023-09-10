import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
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
    let newComment: Partial<CommentProps> = req.body
    if (!userId || !storyId || !newComment?.comment) return res.sendStatus(400)
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    newComment = {...newComment, author: user?.username}
    const story = await getStoryById(storyId)
    if(!story) return responseType({res, status: 404, message: 'Story not found'})
    // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    createComment({...newComment})
    .then((comment) => responseType({res, status: 201, count:1, data: comment}))
    .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

export const updateComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, commentId } = req.params;
    const editedComment = req.body
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    await editComment(userId, commentId, editedComment)
    .then((comment) => responseType({res, status: 201, count:1, data: comment}))
    .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

export const deleteComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, commentId } = req.params;
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    const comment = await getCommentById(commentId) as CommentProps
    if(user?.roles.includes(ROLES.ADMIN)) {
      deleteSingleComment(commentId)
      .then(() => res.sendStatus(204))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    }
    if(comment?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
    deleteSingleComment(commentId)
    .then(() => res.sendStatus(204))
    .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

// ADMIN USER
export const deleteUserComments = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { adminId, userId, commentId } = req.params;
    const option = req.query as { command: string, storyId: string }
    if(!userId || !commentId) return res.sendStatus(400)
    const user = await getUserById(userId)
    await autoDeleteOnExpire(userId)
    const adminUser = await getUserById(adminId)
    if(!user || !adminUser) return responseType({res, status: 401, message: 'You do not have an account'})
    if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

    if(adminUser?.roles.includes(ROLES.ADMIN)) {
      if(option?.command == 'onlyInStory'){
        deleteAllUserCommentsInStory(userId, option?.storyId)
        .then(() => responseType({res, status: 201, message: 'All user comments in story deleted'}))
        .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
      }
      else if(option?.command == 'allUserComment'){
        deleteAllUserComments(userId)
        .then(() => responseType({res, status: 201, message: 'All user comments deleted'}))
        .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
      }
    }
    else return responseType({res, status: 401, message: 'unauthorized'})
  })
}

export const getComment = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {commentId} = req.params
    if(!commentId) return res.sendStatus(400);
    getCachedResponse({key:`singleComment:${commentId}`, timeTaken: 1800, cb: async() => {
      const comment = await getCommentById(commentId)
      return comment;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((userComment: CommentProps) => {
      if(!userComment) return responseType({res, status: 404, message: 'comment not found'})
      return responseType({res, status: 200, count:1, data: userComment})
    }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

// FOR ADMIN PAGE
export const userComments = (req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {adminId, userId} = req.params
    if(!adminId || !userId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(!user) return res.sendStatus(404)
    await autoDeleteOnExpire(userId)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const admin = await getUserById(adminId)
    if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
    getCachedResponse({key: `userComments:${userId}`, cb: async() => {
      const userComment = await getUserComments(userId) 
      return userComment
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((userComments: CommentProps[] | string) => {
      if(!userComments?.length) return responseType({res, status: 404, message: 'User have no comments'})
      return responseType({res, status: 200, count: userComments?.length, data: userComments})
    }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

export const getUserCommentStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400);
    await autoDeleteOnExpire(userId)
    getCachedResponse({key:`userCommentsInStories:${userId}`, cb: async() => {
      const comments = await getUserCommentsInStory(userId, storyId);
      return comments
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((commentsInStories: CommentProps[] | string) => {
      if(!commentsInStories?.length) return responseType({res, status: 404, message: 'No comments by you'})
      return responseType({res, status: 200, count: commentsInStories?.length, data: commentsInStories})
    }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

///////////////////////////////////////////

export const getStoryComments = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { storyId } = req.params
    if(!storyId) return res.sendStatus(400);
    getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
      const storyComment = await getAllCommentsInStory(storyId as string)
      return storyComment
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((storyComments: CommentProps[] | string) => {
      if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
      return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
    }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

export const like_Unlike_Comment = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, commentId} = req.params
    if (!userId || !commentId) return res.sendStatus(400);
    await autoDeleteOnExpire(userId)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    likeAndUnlikeComment(userId, commentId)
    .then((result: Like_Unlike_Comment) => responseType({res, status: 201, message: result}))
    .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
  })
}

