import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import CommentControllerInstance from "../controller/commentController.js";
const commentRouter = Router();
commentRouter.post('/:userId/:storyId', verifyRoles([ROLES.USER]), CommentControllerInstance.createNewComment);
commentRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), CommentControllerInstance.getUserCommentStory);
commentRouter.put('/:userId/:commentId', verifyRoles([ROLES.USER]), CommentControllerInstance.updateComment);
commentRouter.patch('/:userId/:commentId', verifyRoles([ROLES.USER]), CommentControllerInstance.like_Unlike_Comment);
commentRouter.delete('/:userId/:commentId', verifyRoles([ROLES.USER, ROLES.ADMIN]), CommentControllerInstance.deleteComment);
commentRouter.delete('/admin/:adminId/:userId/:commentId', verifyRoles([ROLES.ADMIN]), CommentControllerInstance.deleteUserComments);
commentRouter.get('/admin/:adminId/:userId', verifyRoles([ROLES.ADMIN]), CommentControllerInstance.userComments);
export default commentRouter;
//# sourceMappingURL=commentRoutes.js.map