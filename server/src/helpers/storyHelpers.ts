import { ObjectId } from "mongoose";
import { Categories, StoryProps } from "../../types.js";
import { StoryModel } from "../models/Story.js";

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

export const updateUserStory = async(userId: string, storyId: string, updateStory: StoryProps) => await StoryModel.findByIdAndUpdate({ userId, _id: storyId }, {...updateStory, edited: true})

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

export const deleteUserStory = async(storyId: string) => await StoryModel.findByIdAndDelete({ _id: storyId })

export const deleteAllUserStories = async(userId: string) => await StoryModel.deleteMany({ userId })