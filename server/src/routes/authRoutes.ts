import { ROLES } from "../config/allowedRoles.js";
import { Request, Response, Router } from "express";
import { EmailProps, NewUserProp } from "../../types.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import AuthenticationController from '../controller/authController.js'
import { getNewTokens, verifyAccessToken } from "../middleware/verifyTokens.js";


const authRouter: Router = Router()

authRouter.post('/registration', (req: NewUserProp, res: Response) => AuthenticationController.registerUser(req, res));
authRouter.post('/login', (req: NewUserProp, res: Response) => AuthenticationController.loginHandler(req, res));
authRouter.get('/verify_account', (req: Request, res: Response) => AuthenticationController.accountConfirmation(req, res));

authRouter.post('/confirm_password', (req: EmailProps, res: Response) => AuthenticationController.confirmUserByPassword(req, res));
authRouter.post('/otp_verification', (req: Request, res: Response) => AuthenticationController.confirmOTPToken(req, res));
authRouter.post('/otp_generator', (req: Request, res: Response) => AuthenticationController.ExtraOTPGenerator(req, res));

authRouter.patch('/toggle_role/:adminId/:userId', verifyAccessToken, verifyRoles([ROLES.ADMIN]), (req: Request, res: Response) => AuthenticationController.toggleAdminRole(req, res));

authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])

export default authRouter