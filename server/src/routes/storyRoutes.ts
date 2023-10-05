import { RequestStoryProp } from "../../types.js";
import { ROLES } from "../config/allowedRoles.js";
import { Request, Response, Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import StoryController from "../controller/storyController.js";
import SharedStoryController from "../controller/sharedStoryController.js";

const storyRouter: Router = Router();

storyRouter.post('/:userId', verifyRoles([ROLES.USER]), (req: RequestStoryProp, res: Response) => StoryController.createNewStory(req, res));
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => StoryController.getUserStory(req, res));
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), (req: RequestStoryProp, res: Response) => StoryController.updateStory(req, res));

storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => StoryController.like_Unlike_Story(req, res));
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req: RequestStoryProp, res: Response) => StoryController.deleteStory(req, res));
storyRouter.delete('/:adminId/:userId/:storyId', verifyRoles([ROLES.ADMIN]), (req: RequestStoryProp, res: Response) => StoryController.deleteStoryByAdmin(req, res));

// SHARE STORY
storyRouter.post('/share/:userId/:storyId', verifyRoles([ROLES.USER]), (req: RequestStoryProp, res: Response) => SharedStoryController.shareStory(req, res));
storyRouter.get('/share/user/:userId', verifyRoles([ROLES.USER]), (req: RequestStoryProp, res: Response) => SharedStoryController.getSharedStoriesByUser(req, res));

storyRouter.put('/unshare/:userId/:sharedId', verifyRoles([ROLES.USER]), (req: RequestStoryProp, res: Response) => SharedStoryController.unShareUserStory(req, res));
storyRouter.patch('/share/:userId/:sharedId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => SharedStoryController.like_Unlike_SharedStory(req, res));

export default storyRouter;
