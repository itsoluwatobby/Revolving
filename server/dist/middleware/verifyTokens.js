var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getUserByToken } from "../helpers/userHelpers.js";
import { signToken, verifyToken } from "../helpers/helper.js";
export const verifyAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer '))
        return res.sendStatus(403);
    const token = auth === null || auth === void 0 ? void 0 : auth.split(' ')[1];
    const verify = yield verifyToken(token, process.env.ACCESSTOKEN_STORY_SECRET);
    if (!(verify === null || verify === void 0 ? void 0 : verify.email))
        return res.sendStatus(403);
    req.email = verify === null || verify === void 0 ? void 0 : verify.email;
    req.roles = verify === null || verify === void 0 ? void 0 : verify.roles;
    next();
});
export const getNewTokens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = req.cookies;
    if (!(cookie === null || cookie === void 0 ? void 0 : cookie.revolving))
        return res.sendStatus(403);
    const token = cookie === null || cookie === void 0 ? void 0 : cookie.revolving;
    const user = yield getUserByToken(token);
    if (!user)
        return res.sendStatus(403);
    const verify = yield verifyToken(user === null || user === void 0 ? void 0 : user.refreshToken, process.env.REFRESHTOKEN_STORY_SECRET);
    if (!(verify === null || verify === void 0 ? void 0 : verify.email)) {
        res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' }); // secure: true
        user.updateOne({ $set: { refreshToken: '', authentication: { sessionID: '' } } });
        return res.sendStatus(403);
    }
    const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
    const newAccessToken = yield signToken({ roles, email: user === null || user === void 0 ? void 0 : user.email }, '2h', process.env.ACCESSTOKEN_STORY_SECRET);
    const newRefreshToken = yield signToken({ roles, email: user === null || user === void 0 ? void 0 : user.email }, '1d', process.env.REFRESHTOKEN_STORY_SECRET);
    user.updateOne({ $set: { status: 'online', refreshToken: newRefreshToken } });
    //authentication: { sessionID: req?.sessionID },
    res.cookie('revolving', newRefreshToken, { httpOnly: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 }); //secure: true
    return res.status(200).json({ roles, accessToken: newAccessToken });
});
// TODO: add secure option to cookies
//# sourceMappingURL=verifyTokens.js.map