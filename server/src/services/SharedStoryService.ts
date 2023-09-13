import { UserProps } from "../../types.js";
import StoryServiceInstance from "./StoryService.js";
import { SharedStoryModel } from "../models/SharedStory.js";

class SharedStoryService{

  public dateTime: string

  constructor(){
    this.dateTime = new Date().toString()
  }

  async getSharedStoryById(sharedId: string){
    return await SharedStoryModel.findById(sharedId).select('-sharedStory.isShared');
  }

  async getUserSharedStories(sharerId: string){
    return await SharedStoryModel.find({ sharerId }).lean();
  }

  async getAllSharedStories(){
    return await SharedStoryModel.find().lean();
  }

  async getAllSharedByCategories(category: string){
    return await SharedStoryModel.find({'sharedStory.category': [category]});
  }

  async createShareStory(user: UserProps, storyId: string){
    const story = await StoryServiceInstance.getStoryById(storyId)
    const newSharedStory = new SharedStoryModel({
      sharerId: user?._id, storyId: story?._id, sharedDate: this.dateTime, sharedAuthor: user?.username, sharedStory: {...story}
    })
    await newSharedStory.save();
    await story?.updateOne({$push: { isShared: { userId: user?._id, sharedId: newSharedStory?._id.toString() } }});
    return newSharedStory;
  }

  async unShareStory(userId: string, sharedId: string){
    const sharedStory = await this.getSharedStoryById(sharedId)
    if(!sharedStory) return 'not found'
    const story = await StoryServiceInstance.getStoryById(sharedStory?.storyId)
    const verifyUser = story?.isShared?.map(targetShare => targetShare?.userId?.toString() === userId && targetShare?.sharedId === sharedId).find(res => res = true)
    if(!verifyUser) return 'unauthorized'
    await sharedStory.deleteOne()
    await story?.updateOne({ $pull: { isShared: { sharedId } } });
  }

  async likeAndUnlikeSharedStory(userId: string, sharedId: string): Promise<string>{
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
}

export default new SharedStoryService()