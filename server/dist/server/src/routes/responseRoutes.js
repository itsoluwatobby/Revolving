import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
import { createNewResponse, deleteResponse, deleteUserResponses, like_Unlike_Response, updateResponse, userResponses } from "../controller/responseController.js";
const responseRouter = Router();
responseRouter.post('/:userId/:commentId', verifyRoles([ROLES.USER]), createNewResponse);
// responseRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), getUserCommentStory)
responseRouter.put('/:userId/:responseId', verifyRoles([ROLES.USER]), updateResponse);
responseRouter.patch('/:userId/:responseId', verifyRoles([ROLES.USER]), like_Unlike_Response);
responseRouter.delete('/:userId/:responseId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteResponse);
responseRouter.delete('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), deleteUserResponses);
responseRouter.get('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), userResponses);
export default responseRouter;
//# sourceMappingURL=responseRoutes.js.map