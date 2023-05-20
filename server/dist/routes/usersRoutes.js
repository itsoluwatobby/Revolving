import { Router } from "express";
import { followUnFollowUser } from "../controller/userController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const userRouter = Router();
userRouter.put('/follow_unfollow/:followerId/:followingId', verifyRoles([ROLES.USER]), followUnFollowUser);
export default userRouter;
//# sourceMappingURL=usersRoutes.js.map