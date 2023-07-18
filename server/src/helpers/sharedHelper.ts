import { UserProps } from "../../types.js";
import { SharedStoryModel } from "../models/SharedStory.js";
import { dateTime } from "./helper.js";
import { getStoryById } from "./storyHelpers.js";

export const getSharedStoryById = async(sharedId: string) => await SharedStoryModel.findById(sharedId).select('-sharedStory.isShared');

export const getUserSharedStories = async(sharerId: string) => await SharedStoryModel.find({ sharerId }).lean();

export const getAllSharedStories = async() => await SharedStoryModel.find().lean();

export const getAllSharedByCategories = async(category: string) => await SharedStoryModel.find({'sharedStory.category': [category]});

export const createShareStory = async(user: UserProps, storyId: string) => {
  const story = await getStoryById(storyId)
  const newSharedStory = new SharedStoryModel({
    sharerId: user?._id, storyId: story?._id, sharedDate: dateTime, author: user?.username, sharedStory: {...story}
  })
  await newSharedStory.save();
  await story?.updateOne({$push: { isShared: { userId: user?._id, sharedId: newSharedStory?._id.toString() } }});
  return newSharedStory;
}

export const unShareStory = async(userId: string, sharedId: string) => {
  const sharedStory = await getSharedStoryById(sharedId)
  if(!sharedStory) return 'not found'
  const story = await getStoryById(sharedStory?.storyId)
  const verifyUser = story?.isShared.map(targetShare => targetShare?.userId === userId && targetShare?.sharedId === sharedId).find(res => res = true)
  if(!verifyUser) return 'unauthorized'
  await sharedStory.deleteOne()
  await story?.updateOne({ $pull: { isShared: { userId, sharedId } } });
}

export const likeAndUnlikeSharedStory = async(userId: string, sharedId: string): Promise<string> => {
  const sharedStory = await SharedStoryModel.findById(sharedId).exec();
  if(!sharedStory?.sharedLikes.includes(userId)) {
    await sharedStory?.updateOne({ $push: {sharedLikes: userId} })
    return 'You liked this post'
  }
  else {
    await sharedStory?.updateOne({ $pull: {sharedLikes: userId} })
    return 'You unliked this post'
  }
}
export type Like_Unlike_Shared = Awaited<ReturnType<typeof likeAndUnlikeSharedStory>>


