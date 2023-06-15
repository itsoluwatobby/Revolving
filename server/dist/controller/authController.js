var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createUser, getUserByEmail, getUserByToken, getUserByVerificationToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { sub } from "date-fns";
import { asyncFunc, mailOptions, responseType, signToken, transporter, objInstance, verifyToken } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";
import { redisClient } from "../helpers/redis.js";
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.sendStatus(400);
        const duplicateEmail = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (duplicateEmail) {
            if (duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.isAccountActivated) {
                const matchingPassword = yield brcypt.compare(password, (_a = duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.authentication) === null || _a === void 0 ? void 0 : _a.password);
                if (!matchingPassword)
                    return responseType({ res, status: 409, message: 'Email taken' });
                return (duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.isAccountLocked)
                    ? responseType({ res, status: 423, message: 'Account Locked' })
                    : responseType({ res, status: 200, message: 'You already have an account, Please login' });
            }
            else
                return responseType({ res, status: 200, message: 'Please check your email to activate your account' });
        }
        const hashedPassword = yield brcypt.hash(password, 10);
        const dateTime = sub(new Date, { minutes: 0 }).toISOString();
        const user = {
            username, email,
            authentication: { password: hashedPassword },
            registrationDate: dateTime
        };
        const newUser = yield createUser(Object.assign({}, user));
        const roles = Object.values(newUser === null || newUser === void 0 ? void 0 : newUser.roles);
        const token = yield signToken({ roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
        const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`;
        const options = mailOptions(email, username, verificationLink);
        yield newUser.updateOne({ $set: { verificationToken: token } });
        transporter.sendMail(options, (err) => {
            if (err)
                return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
        });
        return responseType({ res, status: 201, message: 'Please check your email to activate your account' });
    }));
});
export const accountConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.query;
        if (!token)
            return res.sendStatus(400);
        const user = yield getUserByVerificationToken(token);
        if (!user) {
            const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
            if (!(verify === null || verify === void 0 ? void 0 : verify.email))
                return res.sendStatus(400);
            const user = yield getUserByEmail(verify === null || verify === void 0 ? void 0 : verify.email);
            if (user.isAccountActivated)
                return responseType({ res, status: 200, message: 'Your account has already been activated' });
        }
        const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
        if (!(verify === null || verify === void 0 ? void 0 : verify.email))
            return res.sendStatus(400);
        if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
            return res.sendStatus(400);
        if (user.isAccountActivated)
            return responseType({ res, status: 200, message: 'Your account has already been activated' });
        yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: '' } });
        return res.status(307).redirect(`${process.env.REDIRECTLINK}/signIn`);
    }));
});
export const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const { email, password } = req.body;
        if (!email || !password)
            return res.sendStatus(400);
        const user = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (!user)
            return responseType({ res, status: 404, message: 'You do not have an account' });
        const matchingPassword = yield brcypt.compare(password, (_b = user === null || user === void 0 ? void 0 : user.authentication) === null || _b === void 0 ? void 0 : _b.password);
        if (!matchingPassword)
            return responseType({ res, status: 401, message: 'Bad credentials' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if (!(user === null || user === void 0 ? void 0 : user.isAccountActivated)) {
            const verify = yield verifyToken(user === null || user === void 0 ? void 0 : user.verificationToken, process.env.ACCOUNT_VERIFICATION_SECRET);
            if (!(verify === null || verify === void 0 ? void 0 : verify.email)) {
                const token = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
                const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`;
                const options = mailOptions(email, user === null || user === void 0 ? void 0 : user.username, verificationLink);
                yield user.updateOne({ $set: { verificationToken: token } });
                transporter.sendMail(options, (err) => {
                    if (err)
                        return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
                });
                return responseType({ res, status: 403, message: 'Please check your email' });
            }
            else if (verify === null || verify === void 0 ? void 0 : verify.email)
                return responseType({ res, status: 403, message: 'Please check your email to activate your account' });
        }
        const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
        const accessToken = yield signToken({ roles, email }, '30m', process.env.ACCESSTOKEN_STORY_SECRET);
        const refreshToken = yield signToken({ roles, email }, '1d', process.env.REFRESHTOKEN_STORY_SECRET);
        const { _id } = user, rest = __rest(user, ["_id"]);
        yield user.updateOne({ $set: { status: 'online', refreshToken, isResetPassword: false } });
        //authentication: { sessionID: req?.sessionID },
        res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 }); //secure: true
        return responseType({ res, status: 200, count: 1, data: { _id, roles, accessToken } });
    }));
});
export const logoutHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        if (!(cookies === null || cookies === void 0 ? void 0 : cookies.revolving)) {
            res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
            redisFunc();
            return res.sendStatus(204);
        }
        const token = cookies === null || cookies === void 0 ? void 0 : cookies.revolving;
        const user = yield getUserByToken(token);
        if (!user) {
            res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
            redisFunc();
            return res.sendStatus(204);
        }
        user.updateOne({ $set: { status: 'offline', authentication: { sessionID: '' }, refreshToken: '' } });
        redisFunc();
        res.clearCookie('revolving', { httpOnly: true, sameSite: "none", secure: true }); //secure: true
        return res.sendStatus(204);
    }
    catch (error) {
        res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
        redisFunc();
        return res.sendStatus(500);
    }
});
export const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.query;
        if (!email)
            return res.sendStatus(400);
        const user = yield getUserByEmail(email);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const passwordResetToken = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email: user === null || user === void 0 ? void 0 : user.email }, '25m', process.env.PASSWORD_RESET_TOKEN_SECRET);
        const verificationLink = `${process.env.ROUTELINK}/password_reset?token=${passwordResetToken}`;
        const options = mailOptions(email, user.username, verificationLink, 'password');
        yield transporter.sendMail(options, (err) => {
            if (err)
                return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
        });
        yield user.updateOne({ $set: { isResetPassword: true, verificationToken: passwordResetToken } });
        return responseType({ res, status: 201, message: 'Please check your email' });
    }));
});
export const passwordResetRedirectLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.query;
        if (!token)
            return res.sendStatus(400);
        const user = yield getUserByVerificationToken(token);
        if (!user)
            return res.sendStatus(401);
        if (!user.isResetPassword)
            return res.sendStatus(401);
        const verify = yield verifyToken(token, process.env.PASSWORD_RESET_TOKEN_SECRET);
        if (!(verify === null || verify === void 0 ? void 0 : verify.email))
            return res.sendStatus(400);
        if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
            return res.sendStatus(400);
        yield user.updateOne({ $set: { verificationToken: '' } });
        res.status(307).redirect(`${process.env.REDIRECTLINK}/new_password?email=${user.email}`);
    }));
});
export const passwordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const { resetPass, email } = req.body;
        if (!email || !resetPass)
            return res.sendStatus(400);
        const user = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (!user)
            return responseType({ res, status: 401, message: 'Bad credentials' });
        if (user.isResetPassword) {
            const conflictingPassword = yield brcypt.compare(resetPass, (_c = user === null || user === void 0 ? void 0 : user.authentication) === null || _c === void 0 ? void 0 : _c.password);
            if (conflictingPassword)
                return responseType({ res, status: 409, message: 'same as old password' });
            const hashedPassword = yield brcypt.hash(resetPass, 10);
            yield user.updateOne({ $set: { authentication: { password: hashedPassword }, isResetPassword: false } })
                .then(() => responseType({ res, status: 201, message: 'password reset successful, please login' }))
                .catch(() => res.sendStatus(500));
        }
        else
            return responseType({ res, status: 401, message: 'unauthorised' });
    }));
});
function redisFunc() {
    return __awaiter(this, void 0, void 0, function* () {
        objInstance.reset();
        if (redisClient.isOpen) {
            yield redisClient.flushAll();
            yield redisClient.quit();
        }
        return;
    });
}
//# sourceMappingURL=authController.js.map