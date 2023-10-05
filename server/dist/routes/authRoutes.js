import { ROLES } from "../config/allowedRoles.js";
import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import AuthenticationController from '../controller/authController.js';
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";
const authRouter = Router();
authRouter.post('/registration', (req, res) => AuthenticationController.registerUser(req, res));
authRouter.post('/login', (req, res) => AuthenticationController.loginHandler(req, res));
authRouter.get('/verify_account', (req, res) => AuthenticationController.accountConfirmation(req, res));
authRouter.post('/confirm_password', (req, res) => AuthenticationController.confirmUserByPassword(req, res));
authRouter.post('/otp_verification', (req, res) => AuthenticationController.confirmOTPToken(req, res));
authRouter.post('/otp_generator', (req, res) => AuthenticationController.ExtraOTPGenerator(req, res));
authRouter.patch('/toggle_role/:adminId/:userId', verifyAccessToken, verifyRoles([ROLES.ADMIN]), (req, res) => AuthenticationController.toggleAdminRole(req, res));
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
export default authRouter;
//# sourceMappingURL=authRoutes.js.map