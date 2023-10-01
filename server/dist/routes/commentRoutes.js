import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
// import { createNewComment, deleteComment, deleteUserComments, getUserCommentStory, like_Unlike_Comment, updateComment, userComments } from "../controller/commentController.js";
import CommentController from "../controller/commentController.js";
const commentRouter = Router();
commentRouter.post('/:userId/:storyId', verifyRoles([ROLES.USER]), (req, res) => CommentController.createNewComment(req, res));
commentRouter.get('/admin/:adminId/:userId', verifyRoles([ROLES.ADMIN]), (req, res) => CommentController.userComments(req, res));
commentRouter.put('/:userId/:commentId', verifyRoles([ROLES.USER]), (req, res) => CommentController.updateComment(req, res));
commentRouter.patch('/:userId/:commentId', verifyRoles([ROLES.USER]), (req, res) => CommentController.like_Unlike_Comment(req, res));
commentRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), (req, res) => CommentController.getUserCommentStory(req, res));
commentRouter.delete('/:userId/:commentId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req, res) => CommentController.deleteComment(req, res));
commentRouter.delete('/admin/:adminId/:userId/:commentId', verifyRoles([ROLES.ADMIN]), (req, res) => CommentController.deleteUserComments(req, res));
export default commentRouter;
//# sourceMappingURL=commentRoutes.js.map