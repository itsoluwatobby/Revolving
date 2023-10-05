import { ROLES } from "../config/allowedRoles.js";
import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import userController from "../controller/userController.js";
const userRouter = Router();
userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), (req, res) => userController.updateUserInfo(req, res));
userRouter.get('/user_follows/:userId', verifyRoles([ROLES.USER]), (req, res) => userController.getUserFollows(req, res));
userRouter.get('/user_friends/:userId', verifyRoles([ROLES.USER]), (req, res) => userController.getUserFriends(req, res));
userRouter.get('/user_subscriptions/:userId', verifyRoles([ROLES.USER]), (req, res) => userController.getSubscriptions(req, res));
userRouter.patch('/islocked/:userId', verifyRoles([ROLES.ADMIN]), (req, res) => userController.lockAndUnlockUserAccount(req, res));
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), (req, res) => userController.deleteUserAccount(req, res));
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), (req, res) => userController.followUnFollowUser(req, res));
userRouter.put('/subscribe/:subscribeId/:subscriberId', verifyRoles([ROLES.USER]), (req, res) => userController.subscribeToNotification(req, res));
export default userRouter;
//# sourceMappingURL=usersRoutes.js.map