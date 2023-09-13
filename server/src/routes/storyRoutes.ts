import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import StoryControllerInstance from "../controller/storyController.js";
import SharedStoryControllerInstance from "../controller/sharedStoryController.js";

const storyRouter: Router = Router();

storyRouter.post('/:userId', verifyRoles([ROLES.USER]), StoryControllerInstance.createNewStory)
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), StoryControllerInstance.getUserStory)
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), StoryControllerInstance.updateStory);
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), StoryControllerInstance.like_Unlike_Story);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), StoryControllerInstance.deleteStory);
storyRouter.delete('/:adminId/:userId/:storyId', verifyRoles([ROLES.ADMIN]), StoryControllerInstance.deleteStoryByAdmin);
storyRouter.get('/user/storyWithUserId/:userId', verifyRoles([ROLES.USER]), StoryControllerInstance.getStoriesWithUserId)

// SHARE STORY
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), SharedStoryControllerInstance.shareStory)
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), SharedStoryControllerInstance.getSharedStoriesByUser)
storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), SharedStoryControllerInstance.unShareUserStory)
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), SharedStoryControllerInstance.like_Unlike_SharedStory)

export default storyRouter;
