import { Router } from "express";
import { createNewStory, deleteStory, getUserStory, like_Unlike_Story, updateStory } from "../controller/storyController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const storyRouter = Router();

storyRouter.post('/:userId', verifyRoles([ROLES.USER]), createNewStory)
storyRouter.get('/user/:userId', verifyRoles([ROLES.USER]), getUserStory)
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), updateStory);
storyRouter.patch('/:userId/:storyId', verifyRoles([ROLES.USER]), like_Unlike_Story);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteStory);

export default storyRouter;
