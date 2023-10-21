import fsPromises from 'fs/promises';
import UserService from './userService.js';
import { StoryModel } from "../models/Story.js";
import { CommentService } from './commentService.js';
import { CommentModel } from "../models/CommentModel.js";
import { SharedStoryService } from './SharedStoryService.js';
import { LikeNotificationType, StoryProps, SubUser } from "../../types.js";
import NotificationController from '../controller/notificationController.js';

export class StoryService {

  private commentService: CommentService = new CommentService()
  private sharedStoryService: SharedStoryService = new SharedStoryService()

  constructor(){}
  public async getAllStories(){
    return await StoryModel.find().lean();
  }

  public async getStoryById(id: string){
    return await StoryModel.findById(id).exec();
  }

  public async getUserStories(userId: string){
    return await StoryModel.find({ userId }).lean()
  }

  public async getStoriesWithUserIdInIt(userId: string){
    const allStories = await this.getAllStories()
    const allSharedStories = await this.sharedStoryService.getAllSharedStories()
    const allUserStoryWithId = allStories.filter(story => story?.userId.toString() === userId || story?.likes?.includes(userId) || story?.commentIds?.includes(userId))
    const allUserSharedStoryWithId = allSharedStories.filter(story => story?.sharerId === userId || story?.sharedLikes?.includes(userId))
    const reMoulded = allUserSharedStoryWithId.map(share => {
      const object = {
        ...share.sharedStory, sharedId: share?._id, sharedLikes: share?.sharedLikes,
        sharerId: share?.sharerId,
        sharedDate: share?.createdAt 
      }
      return object
    })
    return [...allUserStoryWithId, ...reMoulded]
  }

  public async createUserStory(story: StoryProps){
    try{
      const {category, ...rest} = story;
      const newStory = new StoryModel({ ...rest })
      await Promise.allSettled(category.map(catVal => {
        newStory.category.push(catVal)
        }
      ))
      await newStory.save();
      return newStory;
    }
    catch(error){
      return error.messages as string
    }
  }

  public updateUserStory(storyId: string, updateStory: StoryProps){
    return (
      StoryModel.findByIdAndUpdate({ _id: storyId }, {...updateStory, edited: true}, {new: true})
      .then((data) => data)
      .catch(error => error.messages as string)
    )
  }

  public async likeAndUnlikeStory(userId: string, storyId: string): Promise<string>{
    try{
      const story = await StoryModel.findById(storyId).exec();
      const { displayPicture: { photo }, firstName, lastName, email } = await UserService.getUserById(userId)
      const notiLike = {
        userId, fullName: `${firstName} ${lastName}`, email,
        displayPicture: photo, storyId: story?._id, title: story?.title
      } as LikeNotificationType
      if(!story?.likes?.includes(userId)) {
        await story?.updateOne({ $push: {likes: userId} })       
        await NotificationController.addToNotification(story?.userId as unknown as string, notiLike, 'Likes')
        return 'You liked this post'
      }
      else {
        await story?.updateOne({ $pull: {likes: userId} })
        await NotificationController.removeSingleNotification(story?.userId as unknown as string, notiLike, 'Likes')
        return 'You unliked this post'
      }
    }
    catch(error){
      return error.messages as string
    }
  }

  public async deleteUserStory(storyId: string){
    const story = await this.getStoryById(storyId)
    try{
      await StoryModel.findByIdAndDelete({ _id: storyId })
      const commentInStory = await CommentModel.find({ storyId }).lean()
      await Promise.all(commentInStory.map(comment => {
        this.commentService.deleteSingleComment(comment._id, false)
      }))
      const picturesArray = story.picture
      await Promise.all(picturesArray.map(async(pictureLink) => {
        const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5)
        const pathname = process.cwd()+`\\fileUpload\\${imageName}`
        fsPromises.unlink(pathname)
        .then(() => 'success')
        .catch(error => error.message as string)
      }))
    }
    catch(error){
      return error.messages as string
    }
  }

  public async deleteAllUserStories(userId: string){
    const stories = await this.getUserStories(userId)
    try{
      await StoryModel.deleteMany({ userId })
      const userComments = await CommentModel.find({ userId }).lean()
      await Promise.all(userComments.map(comment => {
        this.commentService.deleteSingleComment(comment._id, false)
      }))
      await Promise.all(stories.map(async(story) => {
        const picturesArray = story.picture
        await Promise.all(picturesArray.map(async(pictureLink) => {
          const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5)
          const pathname = process.cwd()+`\\fileUpload\\${imageName}`
          await fsPromises.unlink(pathname)
        }))
      }))
    }
    catch(error){
      return error.messages as string
    }
  }
}
export default new StoryService()
