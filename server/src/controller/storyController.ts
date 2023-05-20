import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { Like_Unlike, createUserStory, getAllStories, getStoryById, getUserStories, likeAndUnlikeStory } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";

interface StoryProps extends Request{};

export const createNewStory = async(req: StoryProps, res: Response) => {
  asyncFunc(res, async () => {
    const { userId } = req.params
    let newStory = req.body
    newStory = {...newStory, userId}

    if (!userId || !newStory?.title || !newStory?.body) return res.sendStatus(400)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await createUserStory({...newStory});
    return responseType({res, status: 201, count:1, data: story})
  })
}

export const updateStory = async(req: StoryProps, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    const editedStory = req.body
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await getStoryById(storyId)
    if(!story) return res.sendStatus(404)
    await story.updateOne({$set: { ...editedStory, edited: true }})
    const edited = await getStoryById(storyId)
    return responseType({res, status: 201, count:1, data: edited})
  })
}

export const deleteStory = async(req: StoryProps, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});    const story = await getStoryById(storyId)
    if(!story) return responseType({res, status: 404, message: 'story not found'})

    if(user?.roles.includes(ROLES.ADMIN)) {
      await story.deleteOne()
      return res.sendStatus(204)
    }
    if(!story?.userId.equals(user?._id)) return res.sendStatus(401)
    await story.deleteOne()
    return res.sendStatus(204)
  })
}

export const getStory = async(req: StoryProps, res: Response) => {
  asyncFunc(res, async () => {
    const {storyId} = req.params
    if(!storyId) return res.sendStatus(400);
    const userStory = await getStoryById(storyId);
    if(!userStory) return responseType({res, status: 404, message: 'story not found'})
    responseType({res, status: 200, count:1, data: userStory})
  })
}

// HANDLE GETTING A USER STORIES
export const getUserStory = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId} = req.params
    if(!userId) return res.sendStatus(400);
    if(!getUserById(userId)) return res.sendStatus(401)
    // if(user?.isAccountLocked) return res.sendStatus(401)
    const userStories = await getUserStories(userId);
    if(!userStories?.length) return responseType({res, status: 404, message: 'You have no stories'})
    return responseType({res, status: 200, count: userStories?.length, data: userStories})
  })
}

export const getStories = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const stories = await getAllStories();
    if(!stories?.length) return responseType({res, status: 404, message: 'No stories available'})
    return responseType({res, status: 200, count: stories?.length, data: stories})
  })
}

export const like_Unlike_Story = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, storyId} = req.params
    if (!userId || !storyId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeStory(userId, storyId) as Like_Unlike;
    responseType({res, status: 201, message: result})
  })
}



