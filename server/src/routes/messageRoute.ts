import { RequestProp } from "../../types.js";
import { ROLES } from "../config/allowedRoles.js";
import { Request, Response, Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import messageController from "../controller/messageController.js";


const messageRouter: Router = Router();

// conversations
messageRouter.post('/create_conversation/:userId/:partnerId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.createConversation(req, res))
messageRouter.delete('/delete_conversation/:conversationId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => messageController.deleteConversation(req, res));
messageRouter.get('/conversations/:userId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.getConversations(req, res));
messageRouter.get('/single_conversation/:userId/:conversationId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => messageController.getConversation(req, res));
messageRouter.patch('/close_conversation/:conversationId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => messageController.close_current_conversation(req, res));

// messages
messageRouter.delete('/delete_message/:userId/:messageId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.deleteMessage(req, res));
messageRouter.get('/get_messages/:conversationId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.getMessages(req, res))
messageRouter.put('/edit_message/:userId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.editMessage(req, res))

messageRouter.post('/create_message', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.createMessage(req, res))
messageRouter.patch('/message_status', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.message_read_or_deleted(req, res));
messageRouter.get('/:messageId', verifyRoles([ROLES.USER]), (req: RequestProp, res: Response) => messageController.getMessage(req, res));

export default messageRouter;