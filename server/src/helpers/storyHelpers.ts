import { StoryProps } from "../../types.js";
import { StoryModel } from "../models/Story.js";
import fsPromises from 'fs/promises'
import { CommentModel } from "../models/CommentModel.js";
import { deleteSingleComment } from "./commentHelper.js";

export const getAllStories = async() => await StoryModel.find().lean();

export const getStoryById = async(id: string) => await StoryModel.findById(id).exec();

export const getUserStories = async(userId: string) => await StoryModel.find({ userId }).lean()

export const createUserStory = async(story: StoryProps) => {
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

export const updateUserStory = async(storyId: string, updateStory: StoryProps) => {
  try{
    const res = await StoryModel.findByIdAndUpdate({ _id: storyId }, {...updateStory, edited: true})
    return res
  }
  catch(error){
    console.log(error.messages)
  }
}

export const likeAndUnlikeStory = async(userId: string, storyId: string): Promise<string> => {
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
export type Like_Unlike = Awaited<ReturnType<typeof likeAndUnlikeStory>>

export const deleteUserStory = async(storyId: string) =>{
  const story = await getStoryById(storyId)
  try{
    await StoryModel.findByIdAndDelete({ _id: storyId })
    const commentInStory = await CommentModel.find({ storyId }).lean()
    await Promise.all(commentInStory.map(comment => {
      deleteSingleComment(comment._id, false)
    }))
    const picturesArray = story.picture
    await Promise.all(picturesArray.map(async(pictureLink) => {
      const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5)
      const pathname = process.cwd()+`\\fileUpload\\${imageName}`
      await fsPromises.unlink(pathname)
      .then(() => console.log('DELETED'))
      .catch(error => console.log(error.message))
    }))
  }
  catch(error){
    console.log(error.messages)
  }
}

export const deleteAllUserStories = async(userId: string) => {
  const stories = await getUserStories(userId)
  try{
    await StoryModel.deleteMany({ userId })
    const userComments = await CommentModel.find({ userId }).lean()
    await Promise.all(userComments.map(comment => {
      deleteSingleComment(comment._id, false)
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