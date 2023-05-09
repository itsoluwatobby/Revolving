import { Router } from "express";
import { accountConfirmation, loginHandler, logoutHandler, registerUser } from "../controller/authController.js";
const authRouter = Router();
authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);
authRouter.get('/logout', logoutHandler);
export default authRouter;
//# sourceMappingURL=authRoutes.js.map