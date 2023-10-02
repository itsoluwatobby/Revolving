import { Request, Response, Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
// import { deleteUserAccount, followUnFollowUser, getSubscriptions, getUserFollows, lockAndUnlockUserAccount, subscribeToNotification, updateUserInfo } from "../controller/userController.js";
import userController from "../controller/userController.js";

const userRouter: Router = Router()

userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => userController.updateUserInfo(req, res));
userRouter.get('/user_follows/:userId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => userController.getUserFollows(req, res));
userRouter.get('/user_subscriptions/:userId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => userController.getSubscriptions(req, res));

userRouter.patch('/islocked/:userId', verifyRoles([ROLES.ADMIN]), (req: Request, res: Response) => userController.lockAndUnlockUserAccount(req, res));
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req: Request, res: Response) => userController.deleteUserAccount(req, res));
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => userController.followUnFollowUser(req, res));

userRouter.put('/subscribe/:subscribeId/:subscriberId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => userController.subscribeToNotification(req, res));

export default userRouter;
