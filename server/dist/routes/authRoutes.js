import { Router } from "express";
import { accountConfirmation, forgetPassword, loginHandler, logoutHandler, passwordReset, passwordResetRedirectLink, registerUser } from "../controller/authController.js";
import { getNewTokens } from "../middleware/verifyTokens.js";
const authRouter = Router();
authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
authRouter.get('/logout/:userId', logoutHandler);
// RESET PASSWORD
authRouter.post('/forgot_password', forgetPassword);
authRouter.post('/password_reset', passwordResetRedirectLink);
authRouter.post('/new_password', passwordReset);
export default authRouter;
//# sourceMappingURL=authRoutes.js.map