import { Router } from "express";
import { 
  createNewStory, deleteStory, deleteStoryByAdmin, 
  getUserStory, like_Unlike_Story, updateStory 
} from "../controller/storyController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
import { 
  getSharedStoriesByUser, like_Unlike_SharedStory, 
  shareStory, unShareUserStory 
} from "../controller/sharedStoryController.js";

const storyRouter: Router = Router();

storyRouter.post('/:userId', verifyRoles([ROLES.USER]), createNewStory)
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), getUserStory)
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), updateStory);
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), like_Unlike_Story);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteStory);
storyRouter.delete('/:adminId/:userId/:storyId', verifyRoles([ROLES.ADMIN]), deleteStoryByAdmin);

// SHARE STORY
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), getSharedStoriesByUser)
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), shareStory)
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), like_Unlike_SharedStory)
storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), unShareUserStory)

export default storyRouter;
