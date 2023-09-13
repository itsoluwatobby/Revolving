import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import ResponseControllerInstance from "../controller/responseController.js";
const responseRouter = Router();
responseRouter.post('/:userId/:commentId', verifyRoles([ROLES.USER]), ResponseControllerInstance.createNewResponse);
// responseRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), ResponseControllerInstance.getUserCommentStory)
responseRouter.put('/:userId/:responseId', verifyRoles([ROLES.USER]), ResponseControllerInstance.updateResponse);
responseRouter.patch('/:userId/:responseId', verifyRoles([ROLES.USER]), ResponseControllerInstance.like_Unlike_Response);
responseRouter.delete('/:userId/:responseId', verifyRoles([ROLES.USER, ROLES.ADMIN]), ResponseControllerInstance.deleteResponse);
responseRouter.delete('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), ResponseControllerInstance.deleteUserResponses);
responseRouter.get('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), ResponseControllerInstance.userResponses);
export default responseRouter;
//# sourceMappingURL=responseRoutes.js.map