import { LikeNotificationType, NewStoryNotificationType, UserProps } from "../../types.js";
import NotificationController from "../controller/notificationController.js";
import { SharedStoryModel } from "../models/SharedStory.js";
import storyService from "./StoryService.js";
import UserService from "./userService.js";


export class SharedStoryService {

  public dateTime: string

  constructor(){
    this.dateTime = new Date().toString()
  }

  public async getSharedStoryById(sharedId: string){
    return await SharedStoryModel.findById(sharedId).select('-sharedStory.isShared');
  }

  public async getUserSharedStories(sharerId: string){
    return await SharedStoryModel.find({ sharerId }).lean();
  }

  public async getAllSharedStories(){
    return await SharedStoryModel.find().lean();
  }

  public async getAllSharedByCategories(category: string){
    return await SharedStoryModel.find({'sharedStory.category': [category]});
  }

  public async createShareStory(user: UserProps, storyId: string){
    const story = await storyService.getStoryById(storyId)
    const { title, body, picture, category, commentIds, likes, author } = story
    const newSharedStory = new SharedStoryModel({
      sharerId: user?._id, storyId: story?._id, sharedDate: this.dateTime, sharedAuthor: user?.username, sharedStory: {...story}
    })
    await newSharedStory.save();
    await story?.updateOne({$push: { isShared: { userId: user?._id, sharedId: newSharedStory?._id.toString() } }});
    const notiStory = { 
      _id: newSharedStory?._id, title, body: body?.slice(0, 40), picture: picture[0], 
      category, commentIds, likes, author
    } as NewStoryNotificationType
    await NotificationController.addToNotification(user?._id, notiStory, 'SharedStory')
    return newSharedStory;
  }

  public async unShareStory(userId: string, sharedId: string){
    const sharedStory = await this.getSharedStoryById(sharedId)
    if(!sharedStory) return 'not found'
    const story = await storyService.getStoryById(sharedStory?.storyId)
    const { title, body, picture, category, commentIds, likes, author } = story
    const verifyUser = story?.isShared?.map(targetShare => targetShare?.userId?.toString() === userId && targetShare?.sharedId === sharedId).find(res => res = true)
    if(!verifyUser) return 'unauthorized'
    await sharedStory.deleteOne()
    const notiStory = { 
      _id: sharedStory?._id, title, body: body?.slice(0, 40), picture: picture[0], 
      category, commentIds, likes, author
    } as NewStoryNotificationType
    await NotificationController.removeSingleNotification(userId, notiStory, 'SharedStory')
    await story?.updateOne({ $pull: { isShared: { sharedId } } });
  }

  public async likeAndUnlikeSharedStory(userId: string, sharedId: string): Promise<string>{
    const sharedStory = await SharedStoryModel.findById(sharedId).exec();
    const { displayPicture: { photo }, firstName, lastName } = await UserService.getUserById(userId)
    const notiLike = {
      userId, fullName: `${firstName} ${lastName}`,
      displayPicture: photo, storyId: sharedStory?._id, title: sharedStory?.sharedStory?.title
    } as LikeNotificationType
    if(!sharedStory?.sharedLikes.includes(userId)) {
      await sharedStory?.updateOne({ $push: {sharedLikes: userId} })
      await NotificationController.addToNotification(sharedStory?.sharerId, notiLike, 'Likes')
      return 'You liked this post'
    }
    else {
      await sharedStory?.updateOne({ $pull: {sharedLikes: userId} })
      await NotificationController.removeSingleNotification(sharedStory?.sharerId, notiLike, 'Likes')
      return 'You unliked this post'
    }
  }
}
