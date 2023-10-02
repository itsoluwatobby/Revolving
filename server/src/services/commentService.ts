import { StoryModel } from "../models/Story.js";
import { CommentModel } from "../models/CommentModel.js";
import { CommentProps, CommentResponseProps, LikeNotificationType } from "../../types.js";
import { CommentResponseModel } from "../models/CommentResponse.js";
import StoryService from "./StoryService.js";
import UserService from "./userService.js";
import NotificationController from "../controller/notificationController.js";

export class CommentService {

  constructor(){}
  public async getAllCommentsInStory(storyId: string){
    return await CommentModel.find({ storyId }).lean();
  }

  public async getCommentById(commentId: string){
    return await CommentModel.findById(commentId).exec();
  }

  public async getUserComments(userId: string){
    return await CommentModel.find({ userId }).lean()
  }

  public async getUserCommentsInStory(userId: string, storyId: string){
    return await CommentModel.find({ userId, storyId }).lean()
  }

  public async createComment(comment: Partial<CommentProps>){
    const newComment = await CommentModel.create({ ...comment })
    await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $push: {commentIds: newComment?._id}})
    return newComment
  }

  public async editComment(userId: string, commentId: string, editedComment: CommentProps){
    return await CommentModel.findByIdAndUpdate({ userId, _id: commentId }, {...editedComment, edited: true})
  }

  public async likeAndUnlikeComment(userId: string, commentId: string): Promise<string>{
    const comment = await CommentModel.findById(commentId).exec();
    const story = await StoryService.getStoryById(comment?.storyId)
    const { displayPicture: { photo }, firstName, lastName } = await UserService.getUserById(userId)
    const notiLike = {
      userId, fullName: `${firstName} ${lastName}`,
      displayPicture: photo, storyId: story?._id, title: story?.title
    } as LikeNotificationType
    if(!comment?.likes.includes(userId)) {
      await comment?.updateOne({ $push: {likes: userId} })
      await NotificationController.addToNotification(comment?.userId as unknown as string, notiLike, 'CommentLikes')
      return 'You liked this comment'
    }
    else {
      await comment?.updateOne({ $pull: {likes: userId} })
      await NotificationController.removeSingleNotification(comment?.userId as unknown as string, notiLike, 'CommentLikes')
      return 'You unliked this comment'
    }
  }

  public async deleteSingleComment(commentId: string, option=true){
    if(option){
      const comment = await this.getCommentById(commentId)
      await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $pull: {commentIds: comment?._id}})
    }
    await CommentModel.findByIdAndDelete({ _id: commentId })
    await CommentResponseModel.deleteMany({ commentId })
  }

  public async deleteAllUserComments(userId: string){
    const userComments = await this.getUserComments(userId)
    await Promise.all(userComments.map(comment => {
      StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
      CommentResponseModel.deleteMany({ commentId: comment._id, userId })
    }))
    await CommentModel.deleteMany({ userId })
  }

  public async deleteAllUserCommentsInStory(userId: string, storyId: string){
    const userComments = await this.getUserComments(userId)
    await Promise.all(userComments.map(comment => {
      StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
      CommentResponseModel.deleteMany({ commentId: comment._id, userId })
    }))
    await CommentModel.deleteMany({ userId, storyId })
  }


  //* ---------------------------------------------- COMMENT RESPONSE -------------------------------------------------

  public async getAllCommentsResponse(commentId: string){
    return await CommentResponseModel.find({ commentId }).lean();
  }

  public async getResponseById(responseId: string){
    return await CommentResponseModel.findById(responseId).exec();
  }

  public async getResponseByCommentId(commentId: string){
    return await CommentResponseModel.findById(commentId).lean();
  }

  public async getUserResponses(userId: string, responseId: string){
    return await CommentResponseModel.find({ userId, _id: responseId }).lean()
  }

  public async createResponse(response: Partial<CommentResponseProps>){
    const newResponse = await CommentResponseModel.create({ ...response })
    await CommentModel.findByIdAndUpdate({_id: response.commentId}, { $push: {commentResponse: newResponse?._id}})
    response?.responseId 
        ? await CommentResponseModel.findByIdAndUpdate({_id: response?.responseId}, { $push: {responseTags: newResponse?._id}}) : null
    return newResponse
  }

  public async editResponse(userId: string, responseId: string, editedResponse: CommentResponseProps){
    return await CommentResponseModel.findByIdAndUpdate({ userId, _id: responseId }, {...editedResponse, edited: true})
  }

  public async likeAndUnlikeResponse(userId: string, responseId: string): Promise<string>{
    const response = await CommentResponseModel.findById(responseId).exec();
    if(!response?.likes.includes(userId)) {
      await response?.updateOne({ $push: {likes: userId} })
      return 'You liked this response'
    }
    else {
      await response?.updateOne({ $pull: {likes: userId} })
      return 'You unliked this response'
    }
  }
  
  // type Like_Unlike_Response = Awaited<ReturnType<typeof likeAndUnlikeResponse>>

  public async deleteSingleResponse(responseId: string){
    const response = await this.getResponseById(responseId)
    await CommentResponseModel.findByIdAndDelete({ _id: responseId })
    response?.responseId 
        ? await CommentResponseModel.findByIdAndUpdate({_id: response.responseId}, { $pull: {responseTags: response?._id}}) : null
    await CommentModel.findByIdAndUpdate({_id: response.commentId}, { $pull: {commentResponse: response?._id}})
  }

  async deleteAllUserResponses(userId: string) {
    const comments = await this.getUserComments(userId)
    await Promise.all(comments.map(async(comment) => {
      const userResponse = await this.getUserResponses(userId, comment._id)
      await Promise.all(userResponse.map(response => {
        CommentModel.findByIdAndUpdate({_id: comment._id}, {$pull: { commentResponse: response._id }})
      }))
    }))
    await CommentResponseModel.deleteMany({ userId })
  }

  public async deleteAllUserResponseInComment(userId: string, commentId: string) {
    const userResponse = await this.getUserResponses(userId, commentId)
    await Promise.all(userResponse.map(response => {
      CommentModel.findByIdAndUpdate({_id: response.commentId}, {$pull: { commentResponse: response._id }})
    }))
    await CommentResponseModel.deleteMany({ userId, commentId })
  }
}