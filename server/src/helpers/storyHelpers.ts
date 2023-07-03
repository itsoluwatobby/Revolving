import { StoryProps } from "../../types.js";
import { StoryModel } from "../models/Story.js";
import { CommentResponseModel } from "../models/CommentResponse.js";
import { CommentModel } from "../models/CommentModel.js";
import { deleteSingleComment } from "./commentHelper.js";

export const getAllStories = async() => await StoryModel.find().lean();

export const getStoryById = async(id: string) => await StoryModel.findById(id).exec();

export const getUserStories = async(userId: string) => await StoryModel.find({ userId }).lean()

export const createUserStory = async(story: StoryProps) => {
  const {category, ...rest} = story;
  const newStory = new StoryModel({ ...rest })
  await Promise.allSettled(category.map(catVal => {
    newStory.category.push(catVal)
    }
  ))
  await newStory.save();
  return newStory;
}

export const updateUserStory = async(storyId: string, updateStory: StoryProps) => await StoryModel.findByIdAndUpdate({ _id: storyId }, {...updateStory, edited: true})

export const likeAndUnlikeStory = async(userId: string, storyId: string): Promise<string> => {
  const story = await StoryModel.findById(storyId).exec();
  if(!story?.likes?.includes(userId)) {
    await story?.updateOne({ $push: {likes: userId} })
    return 'You liked this post'
  }
  else {
    await story?.updateOne({ $pull: {likes: userId} })
    return 'You unliked this post'
  }
}
export type Like_Unlike = Awaited<ReturnType<typeof likeAndUnlikeStory>>

export const deleteUserStory = async(storyId: string) =>{
  await StoryModel.findByIdAndDelete({ _id: storyId })
  const commentInStory = await CommentModel.find({ storyId }).lean()
  await Promise.all(commentInStory.map(comment => {
    deleteSingleComment(comment._id, false)
  }))
}

export const deleteAllUserStories = async(userId: string) => {
  await StoryModel.deleteMany({ userId })
  const userComments = await CommentModel.find({ userId }).lean()
  await Promise.all(userComments.map(comment => {
    deleteSingleComment(comment._id, false)
  }))
}