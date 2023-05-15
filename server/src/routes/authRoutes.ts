import { Router } from "express";
import { accountConfirmation, forgetPassword, loginHandler, logoutHandler, passwordReset, passwordResetRedirectLink, registerUser } from "../controller/authController.js";
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const authRouter: Router = Router()

authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);

authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
authRouter.get('/logout', logoutHandler);

// RESET PASSWORD
authRouter.post('/forgot_password', forgetPassword);
authRouter.post('/password_reset', passwordResetRedirectLink);
authRouter.post('/new_password', passwordReset);

export default authRouter