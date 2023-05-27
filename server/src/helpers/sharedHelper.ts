import { SharedStoryModel } from "../models/SharedStory.js";
import { dateTime } from "./helper.js";
import { getStoryById } from "./storyHelpers.js";

export const getSharedStoryById = async(sharedId: string) => await SharedStoryModel.findById(sharedId).exec();

export const getUserSharedStories = async(sharerId: string) => await SharedStoryModel.find({ sharerId }).lean();

export const createShareStory = async(userId: string, storyId: string) => {
  const story = await getStoryById(storyId)
  const newSharedStory = new SharedStoryModel({
    sharerId: userId, storyId: story?._id, sharedDate: dateTime, sharedStory: {...story}
  })
  await newSharedStory.save();
  await story?.updateOne({$push: { isShared: { userId, sharedId: newSharedStory?._id } }});
  return newSharedStory;
}

export const unShareStory = async(userId: string, sharedId: string) => {
  const sharedStory = await getSharedStoryById(sharedId)
  const story = await getStoryById(sharedStory?.storyId)
  await sharedStory?.deleteOne();
  await story?.updateOne({ $pull: { isShared: { userId, sharedId } } });
}

export const likeAndUnlikeSharedStory = async(userId: string, sharedId: string): Promise<string> => {
  const sharedStory = await SharedStoryModel.findById(sharedId).exec();
  if(!sharedStory?.likes.includes(userId)) {
    await sharedStory?.updateOne({ $push: {likes: userId} })
    return 'You liked this post'
  }
  else {
    await sharedStory?.updateOne({ $pull: {likes: userId} })
    return 'You unliked this post'
  }
}
export type Like_Unlike_Shared = Awaited<ReturnType<typeof likeAndUnlikeSharedStory>>


