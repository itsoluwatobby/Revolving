import { CommentProps } from "../../types.js";
import { CommentModel } from "../models/CommentModel.js";

export const getAllCommentsInStory = async(storyId: string) => await CommentModel.find({ storyId }).lean();

export const getCommentById = async(commentId: string) => await CommentModel.findById(commentId).exec();

export const getUserComments = async(userId: string) => await CommentModel.find({ userId }).lean()

export const getUserCommentsInStory = async(userId: string, storyId: string) => await CommentModel.find({ userId, storyId }).lean()

export const createComment = async(comment: CommentProps) => await CommentModel.create({ ...comment })

export const editComment = async(userId: string, commentId: string, editedComment: CommentProps) => await CommentModel.findByIdAndUpdate({ userId, _id: commentId }, {...editedComment})

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

export const deleteSingleComment = async(commentId: string) => await CommentModel.findByIdAndDelete({ _id: commentId })

export const deleteAllUserComments = async(userId: string) => await CommentModel.deleteMany({ userId })

export const deleteAllUserCommentsInStory = async(userId: string, storyId: string) => await CommentModel.deleteMany({ userId, storyId })