import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { createUserStory, getAllStories, getStoryById, getUserStories } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";

interface StoryProps extends Request{};

export const createNewStory = async(req: StoryProps, res: Response) => {
  try{
    const { userId } = req.params
    const newStory = req.body
    if (!userId || !newStory?.title || !newStory?.body) return res.sendStatus(400)
    const user = await getUserById(userId);
    if(!user) return res.status(401).json('You do not have an account')
    if(user?.isAccountLocked) return res.sendStatus(401);
    const story = await createUserStory({...newStory, userId});
    return res.status(200).json(story)
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const updateStory = async(req: StoryProps, res: Response) => {
  try{
    const { userId, storyId } = req.params;
    const editedStory = req.body
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return res.status(403).json('You do not have an account')
    if(user?.isAccountLocked) return res.sendStatus(401)

    const story = await getStoryById(storyId)
    if(!story) return res.sendStatus(404)
    await story.updateOne({$set: { ...editedStory, edited: true }})
    const edited = await getStoryById(storyId)
    return res.status(200).json(edited)
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const deleteStory = async(req: StoryProps, res: Response) => {
  try{
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return res.status(401).json('You do not have an account')
    
    if(user?.isAccountLocked) return res.sendStatus(401)
    const story = await getStoryById(storyId)
    if(!story) return res.status(404).json('story not found')

    if(user?.roles.includes(ROLES.ADMIN)) {
      await story.deleteOne()
      return res.sendStatus(204)
    }
    if(!story?.userId.equals(user?._id)) return res.sendStatus(401)
    await story.deleteOne()
    return res.sendStatus(204)
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const getStory = async(req: StoryProps, res: Response) => {
  try{
    const {storyId} = req.params
    if(!storyId) return res.sendStatus(400);
    const userStory = await getStoryById(storyId);
    if(!userStory) return res.status(404).json('story not found');
    return res.status(200).json(userStory)
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const getUserStory = async(req: Request, res: Response) => {
  try{
    const {userId} = req.params
    if(!userId) return res.sendStatus(400);
    if(!getUserById(userId)) return res.sendStatus(401)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const userStories = await getUserStories(userId);
    if(!userStories?.length) return res.status(404).json('You have no story');
    return res.status(200).json(userStories)
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const getStories = async(req: Request, res: Response) => {
  try{
    const stories = await getAllStories();
    if(!stories?.length) return res.status(404).json('No stories available');
    return res.status(200).json(stories)
  }
  catch(error){
    return res.sendStatus(500)
  }
}



