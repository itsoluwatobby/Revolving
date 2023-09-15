import { StoryModel } from "../models/Story.js";
import { CommentModel } from "../models/CommentModel.js";
import { CommentProps, CommentResponseProps } from "../../types.js";
import { CommentResponseModel } from "../models/CommentResponse.js";


  export async function getAllCommentsInStory(storyId: string){
    return await CommentModel.find({ storyId }).lean();
  }

  export async function getCommentById(commentId: string){
    return await CommentModel.findById(commentId).exec();
  }

  export async function getUserComments(userId: string){
    return await CommentModel.find({ userId }).lean()
  }

  export async function getUserCommentsInStory(userId: string, storyId: string){
    return await CommentModel.find({ userId, storyId }).lean()
  }

  export async function createComment(comment: Partial<CommentProps>){
    const newComment = await CommentModel.create({ ...comment })
    await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $push: {commentIds: newComment?._id}})
    return newComment
  }

  export async function editComment(userId: string, commentId: string, editedComment: CommentProps){
    return await CommentModel.findByIdAndUpdate({ userId, _id: commentId }, {...editedComment, edited: true})
  }

  export async function likeAndUnlikeComment(userId: string, commentId: string): Promise<string>{
    const comment = await CommentModel.findById(commentId).exec();
    if(!comment?.likes.includes(userId)) {
      await comment?.updateOne({ $push: {likes: userId} })
      return 'You liked this comment'
    }
    else {
      await comment?.updateOne({ $pull: {likes: userId} })
      return 'You unliked this comment'
    }
  }

  export async function deleteSingleComment(commentId: string, option=true){
    if(option){
      const comment = await getCommentById(commentId)
      await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $pull: {commentIds: comment?._id}})
    }
    await CommentModel.findByIdAndDelete({ _id: commentId })
    await CommentResponseModel.deleteMany({ commentId })
  }

  export async function deleteAllUserComments(userId: string){
    const userComments = await getUserComments(userId)
    await Promise.all(userComments.map(comment => {
      StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
      CommentResponseModel.deleteMany({ commentId: comment._id, userId })
    }))
    await CommentModel.deleteMany({ userId })
  }

  export async function deleteAllUserCommentsInStory(userId: string, storyId: string){
    const userComments = await getUserComments(userId)
    await Promise.all(userComments.map(comment => {
      StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
      CommentResponseModel.deleteMany({ commentId: comment._id, userId })
    }))
    await CommentModel.deleteMany({ userId, storyId })
  }


  //* ---------------------------------------------- COMMENT RESPONSE -------------------------------------------------

  export async function getAllCommentsResponse(commentId: string){
    return await CommentResponseModel.find({ commentId }).lean();
  }

  export async function getResponseById(responseId: string){
    return await CommentResponseModel.findById(responseId).exec();
  }

  export async function getResponseByCommentId(commentId: string){
    return await CommentResponseModel.findById(commentId).lean();
  }

  export async function getUserResponses(userId: string, responseId: string){
    return await CommentResponseModel.find({ userId, _id: responseId }).lean()
  }

  export async function createResponse(response: Partial<CommentResponseProps>){
    const newResponse = await CommentResponseModel.create({ ...response })
    await CommentModel.findByIdAndUpdate({_id: response.commentId}, { $push: {commentResponse: newResponse?._id}})
    response?.responseId 
        ? await CommentResponseModel.findByIdAndUpdate({_id: response?.responseId}, { $push: {responseTags: newResponse?._id}}) : null
    return newResponse
  }

  export async function editResponse(userId: string, responseId: string, editedResponse: CommentResponseProps){
    return await CommentResponseModel.findByIdAndUpdate({ userId, _id: responseId }, {...editedResponse, edited: true})
  }

  export async function likeAndUnlikeResponse(userId: string, responseId: string): Promise<string>{
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

  export async function deleteSingleResponse(responseId: string){
    const response = await getResponseById(responseId)
    await CommentResponseModel.findByIdAndDelete({ _id: responseId })
    response?.responseId 
        ? await CommentResponseModel.findByIdAndUpdate({_id: response.responseId}, { $pull: {responseTags: response?._id}}) : null
    await CommentModel.findByIdAndUpdate({_id: response.commentId}, { $pull: {commentResponse: response?._id}})
  }

  export const deleteAllUserResponses = async(userId: string) => {
    const comments = await getUserComments(userId)
    await Promise.all(comments.map(async(comment) => {
      const userResponse = await getUserResponses(userId, comment._id)
      await Promise.all(userResponse.map(response => {
        CommentModel.findByIdAndUpdate({_id: comment._id}, {$pull: { commentResponse: response._id }})
      }))
    }))
    await CommentResponseModel.deleteMany({ userId })
  }

  export const deleteAllUserResponseInComment = async(userId: string, commentId: string) => {
    const userResponse = await getUserResponses(userId, commentId)
    await Promise.all(userResponse.map(response => {
      CommentModel.findByIdAndUpdate({_id: response.commentId}, {$pull: { commentResponse: response._id }})
    }))
    await CommentResponseModel.deleteMany({ userId, commentId })
  }

