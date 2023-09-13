import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import AuthenticationInstance from "../controller/authController.js";
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";
const authRouter = Router();
authRouter.post('/registration', AuthenticationInstance.registerUser);
authRouter.post('/login', AuthenticationInstance.loginHandler);
authRouter.get('/verify_account', AuthenticationInstance.accountConfirmation);
authRouter.post('/confirm_password', AuthenticationInstance.confirmUserByPassword);
authRouter.post('/otp_verification', AuthenticationInstance.confirmOTPToken);
authRouter.post('/otp_generator', AuthenticationInstance.ExtraOTPGenerator);
authRouter.patch('/toggle_role/:adminId/:userId', verifyAccessToken, verifyRoles([ROLES.ADMIN]), AuthenticationInstance.toggleAdminRole);
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
export default authRouter;
//# sourceMappingURL=authRoutes.js.map