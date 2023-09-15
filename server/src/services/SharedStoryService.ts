import { UserProps } from "../../types.js";
import { SharedStoryModel } from "../models/SharedStory.js";
import { getStoryById } from "./StoryService.js";


  const dateTime = new Date().toString()

  export async function getSharedStoryById(sharedId: string){
    return await SharedStoryModel.findById(sharedId).select('-sharedStory.isShared');
  }

  export async function getUserSharedStories(sharerId: string){
    return await SharedStoryModel.find({ sharerId }).lean();
  }

  export async function getAllSharedStories(){
    return await SharedStoryModel.find().lean();
  }

  export async function getAllSharedByCategories(category: string){
    return await SharedStoryModel.find({'sharedStory.category': [category]});
  }

  export async function createShareStory(user: UserProps, storyId: string){
    const story = await getStoryById(storyId)
    const newSharedStory = new SharedStoryModel({
      sharerId: user?._id, storyId: story?._id, sharedDate: dateTime, sharedAuthor: user?.username, sharedStory: {...story}
    })
    await newSharedStory.save();
    await story?.updateOne({$push: { isShared: { userId: user?._id, sharedId: newSharedStory?._id.toString() } }});
    return newSharedStory;
  }

  export async function unShareStory(userId: string, sharedId: string){
    const sharedStory = await getSharedStoryById(sharedId)
    if(!sharedStory) return 'not found'
    const story = await getStoryById(sharedStory?.storyId)
    const verifyUser = story?.isShared?.map(targetShare => targetShare?.userId?.toString() === userId && targetShare?.sharedId === sharedId).find(res => res = true)
    if(!verifyUser) return 'unauthorized'
    await sharedStory.deleteOne()
    await story?.updateOne({ $pull: { isShared: { sharedId } } });
  }

  export async function likeAndUnlikeSharedStory(userId: string, sharedId: string): Promise<string>{
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
