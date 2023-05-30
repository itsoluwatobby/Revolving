import { Router } from "express";
import { createNewStory, deleteStory, getSharedStoriesByUser, getUserStory, like_Unlike_SharedStory, like_Unlike_Story, shareStory, unShareUserStory, updateStory } from "../controller/storyController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const storyRouter = Router();
storyRouter.post('/:userId', verifyRoles([ROLES.USER]), createNewStory);
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), getUserStory);
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), updateStory);
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), like_Unlike_Story);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteStory);
// SHARE STORY
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), getSharedStoriesByUser);
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), shareStory);
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), like_Unlike_SharedStory);
storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), unShareUserStory);
export default storyRouter;
//# sourceMappingURL=storyRoutes.js.map