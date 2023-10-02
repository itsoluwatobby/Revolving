import { Request, Response, Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import NotificationController from "../controller/notificationController.js";

const notificationRouter: Router = Router()

notificationRouter.put('/open_notification', verifyRoles([ROLES.USER]), (req: Request, res: Response) => NotificationController.openOrCloseNotification(req, res))
notificationRouter.delete('/remove_notification/:notificationId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => NotificationController.removeNotification(req, res))
notificationRouter.get('/get_notification/:userId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => NotificationController.getNotification(req, res))

export default notificationRouter