import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ExtraOTPGenerator, accountConfirmation, confirmOTPToken, confirmUserByPassword, loginHandler, registerUser, toggleAdminRole } from "../controller/authController.js";
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";
const authRouter = Router();
authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);
authRouter.post('/confirm_password', confirmUserByPassword);
authRouter.post('/otp_verification', confirmOTPToken);
authRouter.post('/otp_generator', ExtraOTPGenerator);
authRouter.patch('/toggle_role/:adminId/:userId', verifyAccessToken, verifyRoles([ROLES.ADMIN]), toggleAdminRole);
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
export default authRouter;
//# sourceMappingURL=authRoutes.js.map