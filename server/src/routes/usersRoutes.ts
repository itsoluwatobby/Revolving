import { Router } from "express";
import { deleteUserAccount, followUnFollowUser, lockAndUnlockUserAccount, updateUserInfo } from "../controller/userController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const userRouter: Router = Router()

userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), updateUserInfo);
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), followUnFollowUser);
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteUserAccount);
userRouter.patch('/islocked/:userId', verifyRoles([ROLES.ADMIN]), lockAndUnlockUserAccount);

export default userRouter;
