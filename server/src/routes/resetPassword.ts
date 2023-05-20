import { Router } from "express";
import { forgetPassword, passwordReset, passwordResetRedirectLink } from "../controller/authController.js";

const passwordResetRouter: Router = Router()
// RESET PASSWORD
passwordResetRouter.post('/forgot_password', forgetPassword);
passwordResetRouter.get('/password_reset', passwordResetRedirectLink);
passwordResetRouter.post('/new_password', passwordReset);

export default passwordResetRouter