import { ROLES } from "../config/allowedRoles.js";
import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import StoryController from "../controller/storyController.js";
import SharedStoryController from "../controller/sharedStoryController.js";
const storyRouter = Router();
storyRouter.post('/:userId', verifyRoles([ROLES.USER]), (req, res) => StoryController.createNewStory(req, res));
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), (req, res) => StoryController.getUserStory(req, res));
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), (req, res) => StoryController.updateStory(req, res));
storyRouter.get('/user/likesUsersInStory/:storyId', (req, res) => StoryController.getStoryLikes(req, res));
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), (req, res) => StoryController.like_Unlike_Story(req, res));
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req, res) => StoryController.deleteStory(req, res));
storyRouter.delete('/:adminId/:userId/:storyId', verifyRoles([ROLES.ADMIN]), (req, res) => StoryController.deleteStoryByAdmin(req, res));
// SHARE STORY
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), (req, res) => SharedStoryController.shareStory(req, res));
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), (req, res) => SharedStoryController.getSharedStoriesByUser(req, res));
storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), (req, res) => SharedStoryController.unShareUserStory(req, res));
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), (req, res) => SharedStoryController.like_Unlike_SharedStory(req, res));
export default storyRouter;
//# sourceMappingURL=storyRoutes.js.map