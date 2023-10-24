import { RequestProp } from "../../types.js";
import { ROLES } from "../config/allowedRoles.js";
import { Request, Response, Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import CommentController from "../controller/commentController.js";

const commentRouter: Router = Router();

commentRouter.post('/:userId/:storyId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => CommentController.createNewComment(req, res))
commentRouter.get('/admin/:adminId/:userId', verifyRoles([ROLES.ADMIN]), (req: Request, res: Response) => CommentController.userComments(req, res));
commentRouter.put('/:userId/:commentId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => CommentController.updateComment(req, res));
commentRouter.patch('/:userId/:commentId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => CommentController.like_Unlike_Comment(req, res));
commentRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => CommentController.getUserCommentStory(req, res))
commentRouter.delete('/:userId/:commentId/:authorId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req: RequestProp, res: Response) => CommentController.deleteComment(req, res));
commentRouter.delete('/admin/:adminId/:userId/:commentId', verifyRoles([ROLES.ADMIN]), (req: RequestProp, res: Response) => CommentController.deleteUserComments(req, res));

export default commentRouter;