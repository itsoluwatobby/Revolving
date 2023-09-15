import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { deleteUserAccount, followUnFollowUser, lockAndUnlockUserAccount, subscribeToNotification, updateUserInfo } from "../controller/userController.js";
const userRouter = Router();
userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), updateUserInfo);
userRouter.patch('/islocked/:userId', verifyRoles([ROLES.ADMIN]), lockAndUnlockUserAccount);
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteUserAccount);
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), followUnFollowUser);
userRouter.put('/subscribe/:subscribeId/:subscriberId', verifyRoles([ROLES.USER]), subscribeToNotification);
export default userRouter;
//# sourceMappingURL=usersRoutes.js.map