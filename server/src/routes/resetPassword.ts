import { Router } from "express";
import AuthenticationInstance from "../controller/authController.js";

const passwordResetRouter: Router = Router()
// RESET PASSWORD
passwordResetRouter.post('/forgot_password', AuthenticationInstance.forgetPassword);
passwordResetRouter.get('/password_reset', AuthenticationInstance.passwordResetRedirectLink);
passwordResetRouter.post('/new_password', AuthenticationInstance.passwordReset);

export default passwordResetRouter