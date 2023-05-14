import { Router } from "express";
import { accountConfirmation, loginHandler, logoutHandler, registerUser } from "../controller/authController.js";
import { getNewTokens } from "../middleware/verifyTokens.js";
const authRouter = Router();
authRouter.post('/registration', registerUser);
authRouter.post('/login', loginHandler);
authRouter.get('/verify_account', accountConfirmation);
authRouter.get('/new_access_token', getNewTokens);
// verifyRoles([ROLES.USER])
authRouter.get('/logout', logoutHandler);
export default authRouter;
//# sourceMappingURL=authRoutes.js.map