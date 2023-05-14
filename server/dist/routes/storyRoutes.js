import { Router } from "express";
import { createNewStory, deleteStory, getUserStory, updateStory } from "../controller/storyController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const storyRouter = Router();
storyRouter.route('/user/:userId')
    .post(verifyRoles([ROLES.USER]), createNewStory)
    .get(verifyRoles([ROLES.USER]), getUserStory);
storyRouter.put('/:userId/:storyId', verifyRoles([ROLES.USER]), updateStory);
storyRouter.delete('/:userId/:storyId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteStory);
export default storyRouter;
//# sourceMappingURL=storyRoutes.js.map