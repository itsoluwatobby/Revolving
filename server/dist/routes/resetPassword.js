import { Router } from "express";
// import { forgetPassword, passwordReset, passwordResetRedirectLink } from "../controller/authController.js";
import AuthenticationController from "../controller/authController.js";
const passwordResetRouter = Router();
// RESET PASSWORD
passwordResetRouter.post('/forgot_password', (req, res) => AuthenticationController.forgetPassword(req, res));
passwordResetRouter.get('/password_reset', (req, res) => AuthenticationController.passwordResetRedirectLink(req, res));
passwordResetRouter.post('/new_password', (req, res) => AuthenticationController.passwordReset(req, res));
export default passwordResetRouter;
//# sourceMappingURL=resetPassword.js.map