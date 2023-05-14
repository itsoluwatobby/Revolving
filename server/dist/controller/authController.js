var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser, getUserByEmail, getUserByVerificationToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { sub } from "date-fns";
import { mailOptions, signToken, transporter, verifyToken } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.sendStatus(400);
        const duplicateEmail = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (duplicateEmail) {
            if (duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.isAccountActivated) {
                const matchingPassword = yield brcypt.compare(password, (_a = duplicateEmail === null || duplicateEmail === void 0 ? void 0 : duplicateEmail.authentication) === null || _a === void 0 ? void 0 : _a.password);
                if (!matchingPassword)
                    return res.status(409).json('Email taken');
                return res.status(200).json('You already have an account, Please login');
            }
            else
                return res.status(200).json('Please check your email to activate your account');
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
        const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`;
        const options = mailOptions(email, username, verificationLink);
        yield newUser.updateOne({ $set: { verificationToken: token } });
        transporter.sendMail(options, (err) => {
            if (err)
                return res.status(400).json('unable to send mail');
        });
        return res.status(201).json('Please check your email to activate your account');
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});
export const accountConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
                return res.status(200).json('Your has already been activated');
        }
        const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
        if (!(verify === null || verify === void 0 ? void 0 : verify.email))
            return res.sendStatus(400);
        if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
            return res.sendStatus(400);
        if (user.isAccountActivated)
            return res.status(200).json('Your has already been activated');
        yield user.updateOne({ $set: { isAccountActivated: true, verificationToken: '' } });
        return res.status(307).redirect(`${process.env.ROUTELINK}/revolving_api/login`);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});
export const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.sendStatus(400);
        const user = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (!user)
            return res.status(401).json('You do not have an account');
        const matchingPassword = yield brcypt.compare(password, (_b = user === null || user === void 0 ? void 0 : user.authentication) === null || _b === void 0 ? void 0 : _b.password);
        if (!matchingPassword)
            return res === null || res === void 0 ? void 0 : res.status(401).json('Incorrect password');
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return res === null || res === void 0 ? void 0 : res.status(403).json('Your account is locked');
        if (!(user === null || user === void 0 ? void 0 : user.isAccountActivated)) {
            const verify = yield verifyToken(user === null || user === void 0 ? void 0 : user.verificationToken, process.env.ACCOUNT_VERIFICATION_SECRET);
            if (!(verify === null || verify === void 0 ? void 0 : verify.email)) {
                const token = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
                const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`;
                const options = mailOptions(email, user === null || user === void 0 ? void 0 : user.username, verificationLink);
                yield user.updateOne({ $set: { verificationToken: token } });
                transporter.sendMail(options, (err) => {
                    if (err)
                        return res.status(400).json('unable to send mail');
                });
                return res.status(201).json('Please check your email');
            }
            else if (verify === null || verify === void 0 ? void 0 : verify.email)
                return res.status(200).json('Please check your email to activate your account');
        }
        const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
        const accessToken = yield signToken({ roles, email }, '1h', process.env.ACCESSTOKEN_STORY_SECRET);
        const refreshToken = yield signToken({ roles, email }, '1d', process.env.REFRESHTOKEN_STORY_SECRET);
        yield user.updateOne({ $set: { status: 'online', refreshToken } });
        //authentication: { sessionID: req?.sessionID },
        res.cookie('revolving', refreshToken, { httpOnly: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 }); //secure: true
        return res.status(200).json({ roles, accessToken });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
export const logoutHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' }); //secure: true
            return res.sendStatus(204);
        }
        const user = yield getUserByEmail(email);
        if (!user) {
            res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' }); //secure: true
            return res.sendStatus(204);
        }
        user.updateOne({ $set: { status: 'offline', authentication: { sessionID: '' }, refreshToken: '' } });
        res.clearCookie('revolving', { httpOnly: true, sameSite: "none" }); //secure: true
        return res.sendStatus(204);
    }
    catch (error) {
        res.clearCookie('revolving', { httpOnly: true, sameSite: 'none' }); //secure: true
        return res.sendStatus(500);
    }
});
//# sourceMappingURL=authController.js.map