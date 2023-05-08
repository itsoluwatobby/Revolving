import { SharedStoryModel } from "../models/SharedStory.js";
import { dateTime } from "./helper.js";
import { getStoryById } from "./storyHelpers.js";

export const getSharedStoryById = async(sharedId: string) => await SharedStoryModel.findById(sharedId).exec();

export const shareStory = async(userId: string, storyId: string) => {
  const story = await getStoryById(storyId)
  await SharedStoryModel.create({
    sharerId: userId, storyId: story?._id, sharedDate: dateTime, sharedStory: {...story}
  })
  await story?.updateOne({$push: { isShared: userId }});
}

export const unShareStory = async(userId: string, sharedId: string) => {
  const story = await getStoryById(sharedId)
  const sharedStory = await getSharedStoryById(sharedId)
  await sharedStory?.deleteOne();
  await story?.updateOne({ $pull: { isShared: userId } });
}