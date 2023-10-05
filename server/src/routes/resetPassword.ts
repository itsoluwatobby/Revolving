import { Request, Response, Router } from "express";
import AuthenticationController from "../controller/authController.js";

interface QueryProps extends Request{token: string}
interface EmailProps extends Request{
  email: string,
  resetPass: string
}

const passwordResetRouter: Router = Router()
// RESET PASSWORD
passwordResetRouter.post('/forgot_password', (req: Request, res: Response) => AuthenticationController.forgetPassword(req, res));
passwordResetRouter.get('/password_reset', (req: QueryProps, res: Response) => AuthenticationController.passwordResetRedirectLink(req, res));
passwordResetRouter.post('/new_password', (req: EmailProps, res: Response) => AuthenticationController.passwordReset(req, res));

export default passwordResetRouter