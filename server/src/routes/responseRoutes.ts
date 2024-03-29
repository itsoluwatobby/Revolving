import { Response, Router } from "express";
import { RequestProp } from "../../types.js";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import ResponseController from "../controller/responseController.js";

const responseRouter: Router = Router();

responseRouter.post('/:userId/:commentId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => ResponseController.createNewResponse(req, res));
// responseRouter.get('/user/:userId/:storyId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => ResponseController.getUserCommentStory)
responseRouter.put('/:userId/:responseId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => ResponseController.updateResponse(req, res));
responseRouter.patch('/:userId/:responseId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => ResponseController.like_Unlike_Response(req, res));
responseRouter.delete('/:userId/:responseId/:authorId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req: RequestProp, res: Response) => ResponseController.deleteResponse(req, res));
responseRouter.delete('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), (req: RequestProp, res: Response) => ResponseController.deleteUserResponses(req, res));
responseRouter.get('/admin/:adminId/:userId/:responseId', verifyRoles([ROLES.ADMIN]), (req: RequestProp, res: Response) => ResponseController.userResponses(req, res));

export default responseRouter;
