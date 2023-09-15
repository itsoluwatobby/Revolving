import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { createNewComment, deleteComment, deleteUserComments, getUserCommentStory, like_Unlike_Comment, updateComment, userComments } from "../controller/commentController.js";
const commentRouter = Router();
commentRouter.post('/:userId/:storyId', verifyRoles([ROLES.USER]), createNewComment);
commentRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), getUserCommentStory);
commentRouter.put('/:userId/:commentId', verifyRoles([ROLES.USER]), updateComment);
commentRouter.patch('/:userId/:commentId', verifyRoles([ROLES.USER]), like_Unlike_Comment);
commentRouter.delete('/:userId/:commentId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteComment);
commentRouter.delete('/admin/:adminId/:userId/:commentId', verifyRoles([ROLES.ADMIN]), deleteUserComments);
commentRouter.get('/admin/:adminId/:userId', verifyRoles([ROLES.ADMIN]), userComments);
export default commentRouter;
//# sourceMappingURL=commentRoutes.js.map