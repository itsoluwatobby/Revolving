import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import UserControllerInstance from "../controller/userController.js";
const userRouter = Router();
userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), UserControllerInstance.updateUserInfo);
userRouter.patch('/islocked/:userId', verifyRoles([ROLES.ADMIN]), UserControllerInstance.lockAndUnlockUserAccount);
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), UserControllerInstance.deleteUserAccount);
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), UserControllerInstance.followUnFollowUser);
userRouter.put('/subscribe/:subscribeId/:subscriberId', verifyRoles([ROLES.USER]), UserControllerInstance.subscribeToNotification);
export default userRouter;
//# sourceMappingURL=usersRoutes.js.map