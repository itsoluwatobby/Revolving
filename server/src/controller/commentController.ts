import { Request, Response } from "express";
import { CommentProps } from "../../types.js";
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import userServiceInstance from "../services/userService.js";
import StoryServiceInstance from "../services/StoryService.js";
import commentServiceInstance from "../services/commentService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  commentId: string,
  // newComment: CommentProps
};

class CommentsController{

  constructor() {}
  createNewComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params
      let newComment: Partial<CommentProps> = req.body
      if (!userId || !storyId || !newComment?.comment) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      newComment = {...newComment, author: user?.username}
      const story = await StoryServiceInstance.getStoryById(storyId)
      if(!story) return responseType({res, status: 404, message: 'Story not found'})
      commentServiceInstance.createComment({...newComment})
      .then((comment) => responseType({res, status: 201, count:1, data: comment}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  updateComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId } = req.params;
      const editedComment = req.body
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      await commentServiceInstance.editComment(userId, commentId, editedComment)
      .then((comment) => responseType({res, status: 201, count:1, data: comment}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  deleteComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId } = req.params;
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})

      const comment = await commentServiceInstance.getCommentById(commentId) as CommentProps
      if(user?.roles.includes(ROLES.ADMIN)) {
        commentServiceInstance.deleteSingleComment(commentId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
      }
      if(comment?.userId.toString() != user?._id.toString()) return res.sendStatus(401)
      commentServiceInstance.deleteSingleComment(commentId)
      .then(() => res.sendStatus(204))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  // ADMIN USER
  deleteUserComments(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, commentId } = req.params;
      const option = req.query as { command: string, storyId: string }
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await userServiceInstance.getUserById(userId)
      await autoDeleteOnExpire(userId)
      const adminUser = await userServiceInstance.getUserById(adminId)
      if(!user || !adminUser) return responseType({res, status: 401, message: 'You do not have an account'})
      if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

      if(adminUser?.roles.includes(ROLES.ADMIN)) {
        if(option?.command == 'onlyInStory'){
          commentServiceInstance.deleteAllUserCommentsInStory(userId, option?.storyId)
          .then(() => responseType({res, status: 201, message: 'All user comments in story deleted'}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
        else if(option?.command == 'allUserComment'){
          commentServiceInstance.deleteAllUserComments(userId)
          .then(() => responseType({res, status: 201, message: 'All user comments deleted'}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
      }
      else return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

  getComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const {commentId} = req.params
      if(!commentId) return res.sendStatus(400);
      getCachedResponse({key:`singleComment:${commentId}`, timeTaken: 1800, cb: async() => {
        const comment = await commentServiceInstance.getCommentById(commentId)
        return comment;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userComment: CommentProps) => {
        if(!userComment) return responseType({res, status: 404, message: 'comment not found'})
        return responseType({res, status: 200, count:1, data: userComment})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  // FOR ADMIN PAGE
  userComments(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {adminId, userId} = req.params
      if(!adminId || !userId) return res.sendStatus(400);
      const user = await userServiceInstance.getUserById(userId)
      if(!user) return res.sendStatus(404)
      await autoDeleteOnExpire(userId)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      const admin = await userServiceInstance.getUserById(adminId)
      if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
      getCachedResponse({key: `userComments:${userId}`, cb: async() => {
        const userComment = await commentServiceInstance.getUserComments(userId) 
        return userComment
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userComments: CommentProps[] | string) => {
        if(!userComments?.length) return responseType({res, status: 404, message: 'User have no comments'})
        return responseType({res, status: 200, count: userComments?.length, data: userComments})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  getUserCommentStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      if(!userId || !storyId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      getCachedResponse({key:`userCommentsInStories:${userId}`, cb: async() => {
        const comments = await commentServiceInstance.getUserCommentsInStory(userId, storyId);
        return comments
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((commentsInStories: CommentProps[] | string) => {
        if(!commentsInStories?.length) return responseType({res, status: 404, message: 'No comments by you'})
        return responseType({res, status: 200, count: commentsInStories?.length, data: commentsInStories})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  getStoryComments(req: RequestProp, res: Response){
    asyncFunc(res, async() => {
      const { storyId } = req.params
      if(!storyId) return res.sendStatus(400);
      getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
        const storyComment = await commentServiceInstance.getAllCommentsInStory(storyId as string)
        return storyComment
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((storyComments: CommentProps[] | string) => {
        if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
        return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  like_Unlike_Comment(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, commentId} = req.params
      if (!userId || !commentId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const user = await userServiceInstance.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      commentServiceInstance.likeAndUnlikeComment(userId, commentId)
      .then((result: Awaited<ReturnType<typeof commentServiceInstance.likeAndUnlikeComment>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }
}

export default new CommentsController