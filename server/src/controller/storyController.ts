import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { createUserStory, getAllStories, getStoryById, getUserStories } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { responseType } from "../helpers/helper.js";

interface StoryProps extends Request{};

export const createNewStory = async(req: StoryProps, res: Response) => {
  try{
    const { userId } = req.params
    let newStory = req.body
    newStory = {...newStory, userId}

    if (!userId || !newStory?.title || !newStory?.body) return res.sendStatus(400)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if(user?.isAccountLocked) return res.sendStatus(401);
    const story = await createUserStory({...newStory});
    return responseType({res, status: 201, data: story})
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
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return res.sendStatus(401)

    const story = await getStoryById(storyId)
    if(!story) return res.sendStatus(404)
    await story.updateOne({$set: { ...editedStory, edited: true }})
    const edited = await getStoryById(storyId)
    return responseType({res, status: 201, data: edited})
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
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    
    if(user?.isAccountLocked) return res.sendStatus(401)
    const story = await getStoryById(storyId)
    if(!story) return responseType({res, status: 404, message: 'story not found'})

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
    if(!userStory) return responseType({res, status: 404, message: 'story not found'})
    return responseType({res, status: 200, data: userStory})
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
    if(!userStories?.length) return responseType({res, status: 404, message: 'You have no stories'})
    return responseType({res, status: 200, data: userStories})
  }
  catch(error){
    return res.sendStatus(500)
  }
}

export const getStories = async(req: Request, res: Response) => {
  try{
    const stories = await getAllStories();
    if(!stories?.length) return responseType({res, status: 404, message: 'No stories available'})
    return responseType({res, status: 200, data: stories})
  }
  catch(error){
    return res.sendStatus(500)
  }
}



