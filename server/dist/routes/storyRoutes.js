import { Router } from "express";
import { createNewStory, deleteStory, deleteStoryByAdmin, getStoriesWithUserId, getUserStory, like_Unlike_Story, updateStory } from "../controller/storyController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
import { getSharedStoriesByUser, like_Unlike_SharedStory, shareStory, unShareUserStory } from "../controller/sharedStoryController.js";
const storyRouter = Router();
storyRouter.post('/:userId', verifyRoles([ROLES.USER]), createNewStory);
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), getUserStory);
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), updateStory);
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), like_Unlike_Story);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteStory);
storyRouter.delete('/:adminId/:userId/:storyId', verifyRoles([ROLES.ADMIN]), deleteStoryByAdmin);
storyRouter.get('/user/storyWithUserId/:userId', verifyRoles([ROLES.USER]), getStoriesWithUserId);
// SHARE STORY
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), shareStory);
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), getSharedStoriesByUser);
storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), unShareUserStory);
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), like_Unlike_SharedStory);
export default storyRouter;
//# sourceMappingURL=storyRoutes.js.map