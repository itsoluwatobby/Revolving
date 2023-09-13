import fsPromises from 'fs/promises';
import { StoryProps } from "../../types.js";
import { StoryModel } from "../models/Story.js";
import { CommentModel } from "../models/CommentModel.js";
import commentServiceInstance from "../services/commentService.js";
import sharedStoryServiceInstance from "./SharedStoryService.js";

class StoryService{


  async getAllStories(){
    return await StoryModel.find().lean();
  }

  async getStoryById(id: string){
    return await StoryModel.findById(id).exec();
  }

  async getUserStories(userId: string){
    return await StoryModel.find({ userId }).lean()
  }

  async getStoriesWithUserIdInIt(userId: string){
    const allStories = await this.getAllStories()
    const allSharedStories = await sharedStoryServiceInstance.getAllSharedStories()
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

  async createUserStory(story: StoryProps){
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
      console.log(error.messages)
    }
  }

  async updateUserStory(storyId: string, updateStory: StoryProps){
    try{
      const res = await StoryModel.findByIdAndUpdate({ _id: storyId }, {...updateStory, edited: true})
      return res
    }
    catch(error){
      console.log(error.messages)
    }
  }

  async likeAndUnlikeStory(userId: string, storyId: string): Promise<string>{
    try{
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
    catch(error){
      console.log(error.messages)
    }
  }

  async deleteUserStory(storyId: string){
    const story = await this.getStoryById(storyId)
    try{
      await StoryModel.findByIdAndDelete({ _id: storyId })
      const commentInStory = await CommentModel.find({ storyId }).lean()
      await Promise.all(commentInStory.map(comment => {
        commentServiceInstance.deleteSingleComment(comment._id, false)
      }))
      const picturesArray = story.picture
      await Promise.all(picturesArray.map(async(pictureLink) => {
        const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5)
        const pathname = process.cwd()+`\\fileUpload\\${imageName}`
        fsPromises.unlink(pathname)
        .then(() => 'success')
        .catch(error => console.log(error.message))
      }))
    }
    catch(error){
      console.log(error.messages)
    }
  }

  async deleteAllUserStories(userId: string){
    const stories = await this.getUserStories(userId)
    try{
      await StoryModel.deleteMany({ userId })
      const userComments = await CommentModel.find({ userId }).lean()
      await Promise.all(userComments.map(comment => {
        commentServiceInstance.deleteSingleComment(comment._id, false)
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
      console.log(error.messages)
    }
  }
}

export default new StoryService()