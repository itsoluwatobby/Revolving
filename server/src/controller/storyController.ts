import { Request, Response } from "express";
import { getUserById } from "../helpers/userHelpers.js";
import { Like_Unlike, createUserStory, getAllStories, getStoryById, getUserStories, likeAndUnlikeStory } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { StoryModel } from "../models/Story.js";
import { Like_Unlike_Shared, createShareStory, getSharedStoryById, getUserSharedStories, likeAndUnlikeSharedStory, unShareStory } from "../helpers/sharedHelper.js";
import { Categories } from "../../types.js";

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};

export const createNewStory = (req: RequestProp, res: Response) => {
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

export const updateStory = (req: RequestProp, res: Response) => {
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

export const deleteStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const { userId, storyId } = req.params;
    if(!userId || !storyId) return res.sendStatus(400)
    const user = await getUserById(userId)
    if(!user) return responseType({res, status: 401, message: 'You do not have an account'})
    
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const story = await getStoryById(storyId)
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

export const getStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {storyId} = req.params
    if(!storyId) return res.sendStatus(400);
    const userStory = await getStoryById(storyId);
    if(!userStory) return responseType({res, status: 404, message: 'story not found'})
    responseType({res, status: 200, count:1, data: userStory})
  })
}

// HANDLE GETTING A USER STORIES
export const getUserStory = (req: Request, res: Response) => {
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

export const getStoryByCategory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const {category} = req.query
    if(!category) return res.sendStatus(400);
    const storyCategory = await StoryModel.find({ category }).lean();
    if(!storyCategory?.length) return responseType({res, status: 404, message: 'You have no stories'});
    return responseType({res, status: 200, count: storyCategory?.length, data: storyCategory})
  })
}

export const getStories = (req: Request, res: Response) => {
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

// SHARED STORIES ROUTE
export const getSharedStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async () => {
    const {sharedId} = req.params
    if(!sharedId) return res.sendStatus(400);
    const sharedStory = await getSharedStoryById(sharedId);
    if(!sharedStory) return responseType({res, status: 404, message: 'story not found'})
    responseType({res, status: 200, count:1, data: sharedStory})
  })
}


export const shareUserStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, storyId } = req.params
    if (!userId || !storyId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const newShare = await createShareStory(userId, storyId)
    return responseType({res, status: 201, count:1, data: newShare})
  })
}

export const unShareUserStory = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, sharedId } = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    const user = await getUserById(userId)
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    await unShareStory(userId, sharedId)
    return responseType({res, status: 204, count:1, message: 'story unshared'})
  })
}

export const getSharedStoriesByUser = (req: RequestProp, res: Response) => {
  asyncFunc(res, async() => {
    const {userId} = req.params
    if (!userId) return res.sendStatus(400);
    const sharedStories = await getUserSharedStories(userId)
    if(!sharedStories?.length) return responseType({res, status: 404, message: 'No shared stories available'})
    return responseType({res, status: 200, count: sharedStories?.length, data: sharedStories})
  })
}

export const like_Unlike_SharedStory = async(req: Request, res: Response) => {
  asyncFunc(res, async () => {
    const {userId, sharedId} = req.params
    if (!userId || !sharedId) return res.sendStatus(400);
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
    const result = await likeAndUnlikeSharedStory(userId, sharedId) as Like_Unlike_Shared;
    responseType({res, status: 201, message: result})
  })
}



