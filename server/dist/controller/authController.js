var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, getUserByEmail, getUserById, getUserByVerificationToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { asyncFunc, mailOptions, responseType, signToken, transporter, objInstance, verifyToken, autoDeleteOnExpire, generateOTP, checksExpiration } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";
import { redisClient } from "../helpers/redis.js";
import { ROLES } from "../config/allowedRoles.js";
import { TaskBinModel } from "../models/TaskManager.js";
const emailRegex = /^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { username, email, password, type } = req.body;
        if (!username || !email || !password)
            return res.sendStatus(400);
        if (!emailRegex.test(email) || !passwordRegex.test(password))
            return responseType({ res, status: 400, message: 'Invalid email or Password format', data: {
                    requirement: {
                        password: {
                            "a": 'Should atleast contain a symbol and number',
                            "b": 'An uppercase and a lowerCase letter',
                            "c": 'And a minimum of nine characters'
                        },
                        email: {
                            "a": 'Should be a valid email address',
                            "b": 'Verification link will be sent to the provided email for account verification'
                        }
                    }
                } });
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
        const dateTime = new Date().toString();
        const user = {
            username, email,
            authentication: { password: hashedPassword },
            registrationDate: dateTime
        };
        const newUser = yield createUser(Object.assign({}, user));
        if (type === 'LINK') {
            const roles = Object.values(newUser === null || newUser === void 0 ? void 0 : newUser.roles);
            const token = yield signToken({ roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
            const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`;
            const options = mailOptions(email, username, verificationLink);
            yield newUser.updateOne({ $set: { verificationToken: { type: 'LINK', token: verificationLink, createdAt: dateTime } } });
            transporter.sendMail(options, (err) => {
                if (err)
                    return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
            });
            return responseType({ res, status: 201, message: 'Please check your email to activate your account' });
        }
        else if (type === 'OTP') {
            OTPGenerator(res, newUser);
            return responseType({ res, status: 201, message: 'Please check your email, OTP sent' });
        }
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
            yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'LINK', token: '', createdAt: '' } } });
            return res.status(307).redirect(`${process.env.REDIRECTLINK}/signIn`);
        }
        else {
            const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
            if (!(verify === null || verify === void 0 ? void 0 : verify.email))
                return res.sendStatus(400);
            if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
                return res.sendStatus(400);
            if (user.isAccountActivated)
                return responseType({ res, status: 200, message: 'Your account has already been activated' });
            yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'LINK', token: '', createdAt: '' } } });
            return res.status(307).redirect(`${process.env.REDIRECTLINK}/signIn`);
        }
    }));
});
export const confirmOTPToken = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { email, otp, purpose = 'ACCOUNT' } = req.body;
        if (!email || !otp)
            return responseType({ res, status: 400, message: 'OTP required' });
        const user = yield getUserByEmail(email);
        if (!user)
            return responseType({ res, status: 404, message: 'You do not have an account' });
        if (purpose === 'ACCOUNT') {
            if (user.isAccountActivated)
                return responseType({ res, status: 200, message: 'Your account has already been activated' });
            const OTPMatch = ((_a = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _a === void 0 ? void 0 : _a.token) === otp;
            if (!OTPMatch)
                return responseType({ res, status: 403, message: 'Bad Token' });
            if (!checksExpiration((_b = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _b === void 0 ? void 0 : _b.createdAt)) {
                yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'OTP', token: '', createdAt: '' } } });
                return responseType({ res, status: 200, message: 'Welcome, account activated', data: { _id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, roles: user === null || user === void 0 ? void 0 : user.roles } });
            }
            else
                return responseType({ res, status: 403, message: 'OTP expired pls login to request for a new one' });
        }
        else {
            const OTPMatch = ((_c = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _c === void 0 ? void 0 : _c.token) === otp;
            if (!OTPMatch)
                return responseType({ res, status: 403, message: 'Bad Token' });
            if (!checksExpiration((_d = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _d === void 0 ? void 0 : _d.createdAt)) {
                yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: '', createdAt: '' } } });
                return responseType({ res, status: 200, message: 'Token verified', data: { _id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, roles: user === null || user === void 0 ? void 0 : user.roles } });
            }
            else
                return responseType({ res, status: 403, message: 'OTP expired pls request for a new one' });
        }
    }));
};
function OTPGenerator(res, user, length = 6) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const dateTime = new Date().toString();
        const OTPToken = generateOTP(length);
        const options = mailOptions(user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.username, OTPToken, 'account', 'OTP');
        yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: dateTime } } });
        transporter.sendMail(options, (err) => {
            if (err)
                return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
        });
    }));
}
export function ExtraOTPGenerator(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { email, length, option } = req.body;
        const dateTime = new Date().toString();
        const user = yield getUserByEmail(email);
        if (option === 'EMAIL') {
            OTPGenerator(res, user, length);
            return responseType({ res, status: 201, message: 'Please check your email OTP sent' });
        }
        else {
            const OTPToken = generateOTP(length);
            yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: dateTime } } });
            return responseType({ res, status: 200, message: 'OTP generated', data: { otp: OTPToken, expiresIn: '30 minutes' } });
        }
    }));
}
export const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c, _d, _e;
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
            if (((_c = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _c === void 0 ? void 0 : _c.type) === 'LINK') {
                const verify = yield verifyToken((_d = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _d === void 0 ? void 0 : _d.token, process.env.ACCOUNT_VERIFICATION_SECRET);
                console.log(verify);
                if (!(verify === null || verify === void 0 ? void 0 : verify.email)) {
                    const dateTime = new Date().toString();
                    const token = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
                    const verificationLink = `${process.env.ROUTELINK}/verify_account?token=${token}`;
                    const options = mailOptions(email, user === null || user === void 0 ? void 0 : user.username, verificationLink);
                    yield user.updateOne({ $set: { verificationToken: { type: 'LINK', token, createdAt: dateTime } } });
                    transporter.sendMail(options, (err) => {
                        if (err)
                            return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
                    });
                    return responseType({ res, status: 405, message: 'Please check your email' });
                }
                else if (verify === null || verify === void 0 ? void 0 : verify.email)
                    return responseType({ res, status: 406, message: 'Please check your email to activate your account' });
            }
            else {
                if (checksExpiration((_e = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _e === void 0 ? void 0 : _e.createdAt)) {
                    OTPGenerator(res, user);
                    return responseType({ res, status: 201, message: 'Please check your email, OTP sent' });
                }
                else {
                    return responseType({ res, status: 406, message: 'Please check your email.' });
                }
            }
        }
        const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
        const accessToken = yield signToken({ roles, email }, '2h', process.env.ACCESSTOKEN_STORY_SECRET);
        const refreshToken = yield signToken({ roles, email }, '1d', process.env.REFRESHTOKEN_STORY_SECRET);
        // create taskBin for user
        if (!Boolean(yield TaskBinModel.exists({ userId: user === null || user === void 0 ? void 0 : user._id }))) {
            yield TaskBinModel.create({ userId: user === null || user === void 0 ? void 0 : user._id, taskBin: [] });
        }
        yield autoDeleteOnExpire(user === null || user === void 0 ? void 0 : user._id);
        const { _id } = user;
        yield user.updateOne({ $set: { status: 'online', refreshToken, isResetPassword: false } })
            //authentication: { sessionID: req?.sessionID },
            .then(() => {
            res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 }); //secure: true
            return responseType({ res, status: 200, count: 1, data: { _id, roles, accessToken } });
        }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
    }));
});
export const logoutHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
            redisFunc();
            return res.sendStatus(204);
        }
        const user = yield getUserById(userId);
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
        const dateTime = new Date().toString();
        transporter.sendMail(options, (err) => {
            if (err)
                return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
        });
        yield user.updateOne({ $set: { isResetPassword: true, verificationToken: { type: 'LINK', token: passwordResetToken, createdAt: dateTime } } })
            .then(() => responseType({ res, status: 201, message: 'Please check your email' }))
            .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
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
        yield user.updateOne({ $set: { verificationToken: { type: 'LINK', token: '', createdAt: '' } } })
            .then(() => res.status(307).redirect(`${process.env.REDIRECTLINK}/new_password?email=${user.email}`))
            .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
    }));
});
export const passwordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        const { resetPass, email } = req.body;
        if (!email || !resetPass)
            return res.sendStatus(400);
        const user = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (!user)
            return responseType({ res, status: 401, message: 'Bad credentials' });
        if (user.isResetPassword) {
            const conflictingPassword = yield brcypt.compare(resetPass, (_f = user === null || user === void 0 ? void 0 : user.authentication) === null || _f === void 0 ? void 0 : _f.password);
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
export const toggleAdminRole = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId } = req.params;
        if (!adminId || !userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const admin = yield getUserById(adminId);
        if (!user || !admin)
            return responseType({ res, status: 401, message: 'User not found' });
        if (admin === null || admin === void 0 ? void 0 : admin.roles.includes(ROLES.ADMIN)) {
            if (!(user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN))) {
                user.roles = [...user.roles, ROLES.ADMIN];
                yield user.save();
                yield getUserById(userId)
                    .then((userAd) => responseType({ res, status: 201, count: 1, message: 'admin role assigned', data: userAd }))
                    .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
            }
            else {
                user.roles = [ROLES.USER];
                yield user.save();
                yield getUserById(userId)
                    .then((userAd) => responseType({ res, status: 201, count: 1, message: 'admin role removed', data: userAd }))
                    .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
            }
        }
        else
            return responseType({ res, status: 401, message: 'unauthorised' });
    }));
};
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