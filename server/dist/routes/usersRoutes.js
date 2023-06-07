import { Router } from "express";
import { deleteUserAccount, followUnFollowUser, updateUserInfo } from "../controller/userController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const userRouter = Router();
userRouter.put('/updateInfo/:userId', verifyRoles([ROLES.USER]), updateUserInfo);
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), followUnFollowUser);
userRouter.delete('/delete/:userId', verifyRoles([ROLES.USER, ROLES.ADMIN]), deleteUserAccount);
export default userRouter;
//# sourceMappingURL=usersRoutes.js.map