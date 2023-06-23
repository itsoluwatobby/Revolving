import { CommentProps, CommentResponseProps } from "../../types.js";
import { CommentModel } from "../models/CommentModel.js";
import { CommentResponseModel } from "../models/CommentResponse.js";
import { StoryModel } from "../models/Story.js";

export const getAllCommentsInStory = async(storyId: string) => await CommentModel.find({ storyId }).lean();

export const getCommentById = async(commentId: string) => await CommentModel.findById(commentId).exec();

export const getUserComments = async(userId: string) => await CommentModel.find({ userId }).lean()

export const getUserCommentsInStory = async(userId: string, storyId: string) => await CommentModel.find({ userId, storyId }).lean()

export const createComment = async(comment: Partial<CommentProps>) => {
  const newComment = await CommentModel.create({ ...comment })
  await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $push: {commentIds: newComment?._id}})
  return newComment
}

export const editComment = async(userId: string, commentId: string, editedComment: CommentProps) => await CommentModel.findByIdAndUpdate({ userId, _id: commentId }, {...editedComment, edited: true})

export const likeAndUnlikeComment = async(userId: string, commentId: string): Promise<string> => {
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
export type Like_Unlike_Comment = Awaited<ReturnType<typeof likeAndUnlikeComment>>

export const deleteSingleComment = async(commentId: string) => {
  const comment = await getCommentById(commentId)
  await StoryModel.findByIdAndUpdate({_id: comment.storyId}, { $pull: {commentIds: comment?._id}})
  await CommentModel.findByIdAndDelete({ _id: commentId })
  await CommentResponseModel.deleteMany({ commentId })
}

export const deleteAllUserComments = async(userId: string) => {
  const userComments = await getUserComments(userId)
  await Promise.all(userComments.map(comment => {
    StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
    CommentResponseModel.deleteMany({ commentId: comment._id, userId })
  }))
  await CommentModel.deleteMany({ userId })
}

export const deleteAllUserCommentsInStory = async(userId: string, storyId: string) => {
  const userComments = await getUserComments(userId)
  await Promise.all(userComments.map(comment => {
    StoryModel.findByIdAndUpdate({_id: comment.storyId}, {$pull: { commentIds: comment._id }})
    CommentResponseModel.deleteMany({ commentId: comment._id, userId })
  }))
  await CommentModel.deleteMany({ userId, storyId })
}


{/* ---------------------------------------------- COMMENT RESPONSE ------------------------------------------------- */}

export const getAllCommentsResponse = async(commentId: string) => await CommentResponseModel.find({ commentId }).lean();

export const getResponseById = async(responseId: string) => await CommentResponseModel.findById(responseId).exec();

export const getResponseByCommentId = async(commentId: string) => await CommentResponseModel.findById(commentId).lean();

export const getUserResponses = async(userId: string, commentId: string) => await CommentResponseModel.find({ userId, commentId }).lean()

export const createResponse = async(response: Partial<CommentResponseProps>) => {
  const newResponse = await CommentResponseModel.create({ ...response })
  await CommentModel.findByIdAndUpdate({_id: response.commentId}, { $push: {commentResponse: newResponse?._id}})
  return newResponse
}

export const editResponse = async(userId: string, responseId: string, editedResponse: CommentResponseProps) => await CommentResponseModel.findByIdAndUpdate({ userId, _id: responseId }, {...editedResponse, edited: true})

export const likeAndUnlikeResponse = async(userId: string, responseId: string): Promise<string> => {
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
export type Like_Unlike_Response = Awaited<ReturnType<typeof likeAndUnlikeResponse>>

export const deleteSingleResponse = async(responseId: string) => {
  const response = await getResponseById(responseId)
  await CommentResponseModel.findByIdAndDelete({ _id: responseId })
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