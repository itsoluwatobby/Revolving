import { Request, Response } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";
import { UserService } from "../services/userService.js";
import { StoryService } from "../services/StoryService.js";
import { CommentNotificationType, CommentProps, RequestProp } from "../../types.js";
import { CommentService } from "../services/commentService.js";
import { NotificationController } from "./notificationController.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";

class CommentController{

  private userService = new UserService()
  private storyService = new StoryService()
  private commentService = new CommentService()
  private redisClientService = new KV_Redis_ClientService()
  private notification: NotificationController = new NotificationController()

  constructor(){}

  public createNewComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params
      let newComment: Partial<CommentProps> = req.body
      if (!userId || !storyId || !newComment?.comment) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
      newComment = {...newComment, author: user?.username}
      const story = await this.storyService.getStoryById(storyId)
      if(!story) return responseType({res, status: 404, message: 'Story not found'})
      this.commentService.createComment({...newComment})
      .then(async(comment) => {
        const { firstName, lastName, _id, displayPicture: { photo }, email } = user
        const notiComment = { 
          storyId: story?._id, title: story?.title, userId: _id, email,
          fullName: `${firstName} ${lastName}`, displayPicture: photo
        } as CommentNotificationType
        await this.notification.addToNotification(userId, notiComment, 'Comment')
        responseType({res, status: 201, count:1, data: comment})}
      )
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  public updateComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId } = req.params;
      const editedComment = req.body
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      await this.commentService.editComment(userId, commentId, editedComment)
      .then((comment) => responseType({res, status: 201, count:1, data: comment}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  public deleteComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, commentId, authorId } = req.params;
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'You do not have an account'})

      const comment = await this.commentService.getCommentById(commentId) as CommentProps
      const story = await this.storyService.getStoryById(comment?.storyId)
      if(user?.roles.includes(ROLES.ADMIN)) {
        this.commentService.deleteSingleComment(commentId)
        .then(() => res.sendStatus(204))
        .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
      }
      if(comment?.userId.toString() !== userId) return res.sendStatus(403)
      // || userId !== authorId
      this.commentService.deleteSingleComment(commentId)
      .then(async() => {
        const { firstName, lastName, _id, displayPicture: { photo }, email } = user
        const notiComment = { 
          storyId: story?._id, title: story?.title, userId: _id, email,
          fullName: `${firstName} ${lastName}`, displayPicture: photo
        } as CommentNotificationType
        await this.notification.removeSingleNotification(userId, notiComment, 'Comment')
        return res.sendStatus(204)
      })
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  // ADMIN USER
  public deleteUserComments(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { adminId, userId, commentId } = req.params;
      const option = req.query as { command: string, storyId: string }
      if(!userId || !commentId) return res.sendStatus(400)
      const user = await this.userService.getUserById(userId)
      await autoDeleteOnExpire(userId)
      const adminUser = await this.userService.getUserById(adminId)
      if(!user || !adminUser) return responseType({res, status: 401, message: 'You do not have an account'})
      if(adminUser?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});

      if(adminUser?.roles.includes(ROLES.ADMIN)) {
        if(option?.command == 'onlyInStory'){
          this.commentService.deleteAllUserCommentsInStory(userId, option?.storyId)
          .then(() => responseType({res, status: 201, message: 'All user comments in story deleted'}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
        else if(option?.command == 'allUserComment'){
          this.commentService.deleteAllUserComments(userId)
          .then(() => responseType({res, status: 201, message: 'All user comments deleted'}))
          .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
        }
      }
      else return responseType({res, status: 401, message: 'unauthorized'})
    })
  }

  public getComment(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const {commentId} = req.params
      if(!commentId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`singleComment:${commentId}`, timeTaken: 1800, cb: async() => {
        const comment = await this.commentService.getCommentById(commentId)
        return comment;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userComment: CommentProps) => {
        if(!userComment) return responseType({res, status: 404, message: 'comment not found'})
        return responseType({res, status: 200, count:1, data: userComment})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  // FOR ADMIN PAGE
  public userComments(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {adminId, userId} = req.params
      if(!adminId || !userId) return res.sendStatus(400);
      const user = await this.userService.getUserById(userId)
      if(!user) return res.sendStatus(404)
      await autoDeleteOnExpire(userId)
      // if(user?.isAccountLocked) return res.sendStatus(401)
      const admin = await this.userService.getUserById(adminId)
      if(!admin.roles.includes(ROLES.ADMIN)) return res.sendStatus(401)
      this.redisClientService.getCachedResponse({key: `userComments:${userId}`, cb: async() => {
        const userComment = await this.commentService.getUserComments(userId) 
        return userComment
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userComments: CommentProps[] | string) => {
        if(!userComments?.length) return responseType({res, status: 404, message: 'User have no comments'})
        return responseType({res, status: 200, count: userComments?.length, data: userComments})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  public getUserCommentStory(req: RequestProp, res: Response){
    asyncFunc(res, async () => {
      const { userId, storyId } = req.params;
      if(!userId || !storyId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      this.redisClientService.getCachedResponse({key:`userCommentsInStories:${userId}`, cb: async() => {
        const comments = await this.commentService.getUserCommentsInStory(userId, storyId);
        return comments
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((commentsInStories: CommentProps[] | string) => {
        if(!commentsInStories?.length) return responseType({res, status: 404, message: 'No comments by you'})
        return responseType({res, status: 200, count: commentsInStories?.length, data: commentsInStories})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  public getStoryComments(req: RequestProp, res: Response){
    asyncFunc(res, async() => {
      const { storyId } = req.params
      if(!storyId) return res.sendStatus(400);
      this.redisClientService.getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
        const storyComment = await this.commentService.getAllCommentsInStory(storyId as string)
        return storyComment
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((storyComments: CommentProps[] | string) => {
        if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
        return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
      }).catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }

  public like_Unlike_Comment(req: Request, res: Response){
    asyncFunc(res, async () => {
      const {userId, commentId} = req.params
      if (!userId || !commentId) return res.sendStatus(400);
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
      this.commentService.likeAndUnlikeComment(userId, commentId)
      .then((result: Awaited<ReturnType<typeof this.commentService.likeAndUnlikeComment>>) => responseType({res, status: 201, message: result}))
      .catch((error) => responseType({res, status: 400, message: `${error.message}`}))
    })
  }
}
export default new CommentController()
