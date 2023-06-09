import { Router } from "express";
import { accountConfirmation, loginHandler, registerUser, toggleAdminRole } from "../controller/authController.js";
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const authRouter = Router();
authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);
authRouter.patch('/toggle_role/:adminId/:userId', verifyAccessToken, verifyRoles([ROLES.ADMIN]), toggleAdminRole);
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
export default authRouter;
//# sourceMappingURL=authRoutes.js.map