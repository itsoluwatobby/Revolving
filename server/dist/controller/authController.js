var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import brcypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel } from "../models/User.js";
import { ROLES } from "../config/allowedRoles.js";
import { transporter } from '../config/mailConfig.js';
import { TaskBinModel } from "../models/TaskManager.js";
import { KV_Redis_ClientService } from '../helpers/redis.js';
import { UserService } from '../services/userService.js';
import { mailOptions } from '../templates/registration.js';
import { NotificationModel } from '../models/Notifications.js';
import { asyncFunc, responseType, signToken, objInstance, verifyToken, autoDeleteOnExpire, generateOTP, checksExpiration } from "../helpers/helper.js";
dotenv.config();
/**
 * @description Authentication controller
 */
class AuthenticationController {
    // private redisClientService = new RedisClientService()
    constructor() {
        this.serverUrl = process.env.NODE_ENV === 'production'
            ? process.env.PRODUCTIONLINK : process.env.DEVELOPMENTLINK;
        this.clientUrl = process.env.NODE_ENV === 'production'
            ? process.env.PUBLISHEDREDIRECTLINK : process.env.REDIRECTLINK;
        this.userService = new UserService();
        this.redisClientService = new KV_Redis_ClientService();
        this.emailRegex = /^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/;
        this.passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;
        this.dateTime = new Date().toString();
    }
    /**
     * @description signs up a new user
     * @param body - username, email, password, type= 'LINK' | 'OTP'
    */
    registerUser(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, type } = req.body;
            if (!username || !email || !password)
                return res.sendStatus(400);
            if (!this.emailRegex.test(email) || !this.passwordRegex.test(password))
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
            const duplicateEmail = yield UserModel.findOne({ email }).select('+password').exec();
            if (duplicateEmail) {
                if (duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.isAccountActivated) {
                    const matchingPassword = yield brcypt.compare(password, duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.password);
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
            const user = {
                username, email,
                password: hashedPassword,
                registrationDate: this.dateTime
            };
            const newUser = yield this.userService.createUser(Object.assign({}, user));
            if (type === 'LINK') {
                const roles = Object.values(newUser === null || newUser === void 0 ? void 0 : newUser.roles);
                const token = yield signToken({ roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
                const verificationLink = `${this.serverUrl}/revolving/auth/verify_account?token=${token}`;
                const options = mailOptions(email, username, verificationLink);
                yield newUser.updateOne({ $set: { verificationToken: { type: 'LINK', token: verificationLink, createdAt: this.dateTime } } });
                transporter.sendMail(options, (err) => {
                    if (err)
                        return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
                    else
                        return responseType({ res, status: 201, message: 'Please check your email to activate your account' });
                });
            }
            else if (type === 'OTP') {
                this.OTPGenerator(res, newUser);
            }
        }));
    }
    /**
     * @description account confirmation by link
     * @param query - token
    */
    accountConfirmation(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { token } = req.query;
            if (!token)
                return res.sendStatus(400);
            const user = yield this.userService.getUserByVerificationToken(token);
            if (!user) {
                const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
                if (!(verify === null || verify === void 0 ? void 0 : verify.email))
                    return res.sendStatus(400);
                const user = yield this.userService.getUserByEmail(verify === null || verify === void 0 ? void 0 : verify.email);
                if (user.isAccountActivated)
                    return responseType({ res, status: 200, message: 'Your account has already been activated' });
                yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: { type: 'LINK', token: '', createdAt: '' } } });
                return res.status(307).redirect(`${this.serverUrl}/revolving/auth/signIn`);
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
                return res.status(307).redirect(`${this.clientUrl}/signIn`);
            }
        }));
    }
    /**
    * @descriptionconfirms OTP sent by user
    * @body body - email, otp, purpose='ACCOUNT' | 'PASSWORD' | 'OTHERS
   */
    confirmOTPToken(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const { email, otp, purpose = 'ACCOUNT' } = req.body;
            if (!email || !otp)
                return responseType({ res, status: 400, message: 'OTP or Email required' });
            const user = yield this.userService.getUserByEmail(email);
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
            else if (purpose === 'PASSWORD') {
                if (!user.isResetPassword)
                    return responseType({ res, status: 403, message: 'You need to request for a password reset' });
                const OTPMatch = ((_c = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _c === void 0 ? void 0 : _c.token) === otp;
                if (!OTPMatch)
                    return responseType({ res, status: 403, message: 'Bad Token' });
                if (!checksExpiration((_d = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _d === void 0 ? void 0 : _d.createdAt)) {
                    yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: '', createdAt: '' } } });
                    return responseType({ res, status: 200, message: 'SUCCESSFUL', data: { _id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, roles: user === null || user === void 0 ? void 0 : user.roles } });
                }
                else
                    return responseType({ res, status: 403, message: 'OTP expired pls login to request for a new one' });
            }
            else {
                const OTPMatch = ((_e = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _e === void 0 ? void 0 : _e.token) === otp;
                if (!OTPMatch)
                    return responseType({ res, status: 403, message: 'Bad Token' });
                if (!checksExpiration((_f = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _f === void 0 ? void 0 : _f.createdAt)) {
                    yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: '', createdAt: '' } } });
                    return responseType({ res, status: 200, message: 'Token verified', data: { _id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, roles: user === null || user === void 0 ? void 0 : user.roles } });
                }
                else
                    return responseType({ res, status: 403, message: 'OTP expired pls request for a new one' });
            }
        }));
    }
    /**
    * @description generates OTP and sends it to user email
    * @param req - response object, user, length(default - 6)
   */
    OTPGenerator(res, user, length = 6, purpose = 'ACCOUNT') {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const OTPToken = generateOTP(length);
            const options = mailOptions(user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.username, OTPToken, 'account', 'OTP');
            if (purpose === 'ACCOUNT') {
                yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } } });
            }
            else if (purpose === 'PASSWORD') {
                yield user.updateOne({ $set: { isResetPassword: true, verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } } });
            }
            transporter.sendMail(options, (err) => {
                if (err)
                    return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
                else
                    return responseType({ res, status: 201, message: 'Please check your email, OTP sent' });
            });
        }));
    }
    /**
     * @description generates a new OTP
     * @param req - email, length(optional), option='EMAIL
    */
    ExtraOTPGenerator(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { email, length, option, purpose } = req.body;
            if (!email)
                return responseType({ res, status: 400, message: 'Email required' });
            const user = yield this.userService.getUserByEmail(email);
            if (option === 'EMAIL') {
                return this.OTPGenerator(res, user, length, purpose);
            }
            else {
                const OTPToken = generateOTP(length);
                yield user.updateOne({ $set: { verificationToken: { type: 'OTP', token: OTPToken, createdAt: this.dateTime } } });
                return responseType({ res, status: 200, message: 'OTP generated', data: { otp: OTPToken, expiresIn: '30 minutes' } });
            }
        }));
    }
    /**
     * @description signs in in a user
     * @param req - email and password
    */
    loginHandler(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { email, password } = req.body;
            if (!email || !password)
                return res.sendStatus(400);
            const user = yield UserModel.findOne({ email }).select('+password').exec();
            if (!user)
                return responseType({ res, status: 404, message: 'You do not have an account' });
            const matchingPassword = yield brcypt.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!matchingPassword)
                return responseType({ res, status: 401, message: 'Bad credentials' });
            if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
                return responseType({ res, status: 423, message: 'Account locked' });
            if (!(user === null || user === void 0 ? void 0 : user.isAccountActivated)) {
                if (((_a = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _a === void 0 ? void 0 : _a.type) === 'LINK') {
                    const verify = yield verifyToken((_b = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _b === void 0 ? void 0 : _b.token, process.env.ACCOUNT_VERIFICATION_SECRET);
                    if (!(verify === null || verify === void 0 ? void 0 : verify.email)) {
                        const token = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
                        const verificationLink = `${this.serverUrl}/revolving/auth/verify_account?token=${token}`;
                        const options = mailOptions(email, user === null || user === void 0 ? void 0 : user.username, verificationLink);
                        yield user.updateOne({ $set: { verificationToken: { type: 'LINK', token, createdAt: this.dateTime } } });
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
                    if (checksExpiration((_c = user === null || user === void 0 ? void 0 : user.verificationToken) === null || _c === void 0 ? void 0 : _c.createdAt))
                        this.OTPGenerator(res, user);
                    else
                        return responseType({ res, status: 406, message: 'Please check your email.' });
                }
            }
            const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
            const accessToken = yield signToken({ roles, email }, '2h', process.env.ACCESSTOKEN_STORY_SECRET);
            const refreshToken = yield signToken({ roles, email }, '1d', process.env.REFRESHTOKEN_STORY_SECRET);
            // create taskBin for user
            if (!Boolean(yield TaskBinModel.exists({ userId: user === null || user === void 0 ? void 0 : user._id }))) {
                yield TaskBinModel.create({ userId: user === null || user === void 0 ? void 0 : user._id, taskBin: [] });
            }
            if (!Boolean(yield NotificationModel.exists({ userId: user === null || user === void 0 ? void 0 : user._id }))) {
                const newNotification = yield NotificationModel.create({ userId: user === null || user === void 0 ? void 0 : user._id, notification: [] });
                yield user.updateOne({ $set: { notificationId: newNotification === null || newNotification === void 0 ? void 0 : newNotification._id } });
            }
            yield autoDeleteOnExpire(user === null || user === void 0 ? void 0 : user._id);
            const { _id, updatedAt } = user;
            //userSession: req?.sessionID,
            user.updateOne({ $set: { status: 'online', refreshToken, isResetPassword: false, verificationToken: { token: '' } } })
                .then(() => {
                res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 }); //secure: true
                return responseType({ res, status: 200, count: 1, data: { _id, roles, accessToken, updatedAt } });
            }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    /**
    * @description logs out a user
    * @param req - userId
   */
    logoutHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!userId) {
                    res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
                    yield this.redisFunc();
                    return res.sendStatus(204);
                }
                const user = yield this.userService.getUserById(userId);
                if (!user) {
                    res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
                    yield this.redisFunc();
                    return res.sendStatus(204);
                }
                yield user.updateOne({ $set: { status: 'offline', userSession: '', lastSeen: this.dateTime, refreshToken: '', verificationToken: { token: '' } } });
                yield this.redisFunc();
                res.clearCookie('revolving', { httpOnly: true, sameSite: "none", secure: true }); //secure: true
                return res.sendStatus(204);
            }
            catch (error) {
                res.clearCookie('revolving', { httpOnly: true, sameSite: 'none', secure: true }); //secure: true
                yield this.redisFunc();
                return res.sendStatus(500);
            }
        });
    }
    /**
    * @description receives a request to reset user password
    * @param query - email
   */
    forgetPassword(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { email, type } = req.query;
            if (!email)
                return res.sendStatus(400);
            const user = yield this.userService.getUserByEmail(email);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
                return responseType({ res, status: 423, message: 'Account locked' });
            if (type === 'LINK') {
                const passwordResetToken = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email: user === null || user === void 0 ? void 0 : user.email }, '25m', process.env.PASSWORD_RESET_TOKEN_SECRET);
                const verificationLink = `${this.serverUrl}/revolving/auth/password_reset?token=${passwordResetToken}`;
                const options = mailOptions(email, user.username, verificationLink, 'password');
                transporter.sendMail(options, (err) => {
                    if (err)
                        return responseType({ res, status: 400, message: 'unable to send mail, please retry' });
                    else {
                        user.updateOne({ $set: { isResetPassword: true, verificationToken: { type: 'LINK', token: passwordResetToken, createdAt: this.dateTime } } })
                            .then(() => responseType({ res, status: 201, message: 'Please check your email' }))
                            .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
                    }
                });
            }
            else if (type === 'OTP')
                this.OTPGenerator(res, user, 6, 'PASSWORD');
        }));
    }
    /**
     * @description confirms password request and sends back a password_reset link
     * @param query - token
    */
    passwordResetRedirectLink(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { token } = req.query;
            if (!token)
                return res.sendStatus(400);
            const user = yield this.userService.getUserByVerificationToken(token);
            if (!user)
                return res.sendStatus(401);
            if (!user.isResetPassword)
                return res.sendStatus(401);
            const verify = yield verifyToken(token, process.env.PASSWORD_RESET_TOKEN_SECRET);
            if (!(verify === null || verify === void 0 ? void 0 : verify.email))
                return res.sendStatus(400);
            if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
                return res.sendStatus(400);
            user.updateOne({ $set: { verificationToken: { type: 'LINK', token: '', createdAt: '' } } })
                .then(() => res.status(307).redirect(`${this.clientUrl}/new_password?email=${user.email}`))
                .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    /**
    * @description resets user password
    * @param boby - email, resetPass
   */
    passwordReset(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { resetPass, email } = req.body;
            if (!email || !resetPass)
                return res.sendStatus(400);
            const user = yield UserModel.findOne({ email }).select('+password').exec();
            if (!user)
                return responseType({ res, status: 401, message: 'Bad credentials' });
            if (user.isResetPassword) {
                const conflictingPassword = yield brcypt.compare(resetPass, user === null || user === void 0 ? void 0 : user.password);
                if (conflictingPassword)
                    return responseType({ res, status: 409, message: 'same as old password' });
                const hashedPassword = yield brcypt.hash(resetPass, 10);
                user.updateOne({ $set: { password: hashedPassword, isResetPassword: false } })
                    .then(() => responseType({ res, status: 201, message: 'password reset successful, please login' }))
                    .catch(() => res.sendStatus(500));
            }
            else
                return responseType({ res, status: 401, message: 'unauthorised' });
        }));
    }
    /**
     * @description confirms user password
     * @param req - email, password
    */
    confirmUserByPassword(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { password, email } = req.body;
            if (!email || !password)
                return res.sendStatus(400);
            const user = yield UserModel.findOne({ email }).select('+password').exec();
            if (!user)
                return responseType({ res, status: 403, message: 'Bad credentials' });
            const isUserValid = yield brcypt.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isUserValid)
                return responseType({ res, status: 403, message: 'Bad credentials' });
            return responseType({ res, status: 200, message: 'authentication successful' });
        }));
    }
    /**
     * @description toggles assigning admin role by admin
     * @param req - adminId and userId
    */
    toggleAdminRole(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId } = req.params;
            if (!adminId || !userId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            const admin = yield this.userService.getUserById(adminId);
            if (!user || !admin)
                return responseType({ res, status: 401, message: 'User not found' });
            if (admin === null || admin === void 0 ? void 0 : admin.roles.includes(ROLES.ADMIN)) {
                if (!(user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN))) {
                    user.roles = [...user.roles, ROLES.ADMIN];
                    yield user.save();
                    this.userService.getUserById(userId)
                        .then((userAd) => responseType({ res, status: 201, count: 1, message: 'admin role assigned', data: userAd }))
                        .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
                }
                else {
                    user.roles = [ROLES.USER];
                    yield user.save();
                    this.userService.getUserById(userId)
                        .then((userAd) => responseType({ res, status: 201, count: 1, message: 'admin role removed', data: userAd }))
                        .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
                }
            }
            else
                return responseType({ res, status: 401, message: 'unauthorised' });
        }));
    }
    /**
     * @description disconnects redis connection
    */
    redisFunc() {
        return __awaiter(this, void 0, void 0, function* () {
            objInstance.reset();
            yield this.redisClientService.redisClient.flushall();
        });
    }
}
export default new AuthenticationController();
//# sourceMappingURL=authController.js.map