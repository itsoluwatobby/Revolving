var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import asyncHandler from "express-async-handler";
// import { UserModel } from "../models/User.js";
import { createUser, getUserByEmail, getUserByToken } from "../helpers/userHelpers.js";
import brcypt from 'bcrypt';
import { sub } from "date-fns";
import { mailOptions, signToken, transporter, verifyToken } from "../helpers/helper.js";
import { UserModel } from "../models/User.js";
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.sendStatus(400);
        const duplicateEmail = yield getUserByEmail(email);
        if (duplicateEmail)
            return res.status(409).json('Email taken');
        const hashedPassword = yield brcypt.hash(password, 10);
        const dateTime = sub(new Date, { minutes: 0 }).toISOString();
        const user = {
            username, email,
            authentication: { password: hashedPassword },
            registrationDate: dateTime
        };
        const newUser = yield createUser(Object.assign({}, user));
        const token = yield signToken({ roles: newUser === null || newUser === void 0 ? void 0 : newUser.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
        const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`;
        const options = mailOptions(email, username, verificationLink);
        yield user.updateOne({ $set: { verificationToken: token } });
        console.log(verificationLink);
        transporter.sendMail(options, (err, success) => {
            if (err)
                return res.status(400).json('unable to send mail');
            else
                return res.status(201).json('Please check your email');
        });
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
        const user = yield getUserByToken(token);
        if (!user)
            return res.sendStatus(400);
        const verify = yield verifyToken(token, process.env.ACCOUNT_VERIFICATION_SECRET);
        if (!(verify === null || verify === void 0 ? void 0 : verify.email))
            return res.sendStatus(400);
        if ((verify === null || verify === void 0 ? void 0 : verify.email) != (user === null || user === void 0 ? void 0 : user.email))
            return res.sendStatus(400);
        yield user.updateOne({ $set: { isAccountActive: true, verificationToken: '' } });
        return res.status(302).redirect(`${process.env.ROUTELINK}/revolving_api/login`);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});
export const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.sendStatus(400);
        const user = yield UserModel.findOne({ email }).select('+authentication.password').exec();
        if (!user)
            return res.status(401).json('You do not have an account');
        const matchingPassword = yield brcypt.compare(password, (_a = user === null || user === void 0 ? void 0 : user.authentication) === null || _a === void 0 ? void 0 : _a.password);
        if (!matchingPassword)
            return res === null || res === void 0 ? void 0 : res.status(401).json('Incorrect password');
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return res === null || res === void 0 ? void 0 : res.status(403).json('Your account is locked');
        if (!(user === null || user === void 0 ? void 0 : user.isAccountActive)) {
            const token = yield signToken({ roles: user === null || user === void 0 ? void 0 : user.roles, email }, '30m', process.env.ACCOUNT_VERIFICATION_SECRET);
            const verificationLink = `${process.env.ROUTELINK}/revolving_api/verify_account?token=${token}`;
            const options = mailOptions(email, user === null || user === void 0 ? void 0 : user.username, verificationLink);
            yield user.updateOne({ $set: { verificationToken: token } });
            console.log(verificationLink);
            transporter.sendMail(options, (err) => {
                if (err)
                    return res.status(400).json('unable to send mail');
                // else return res.status(201).json('Please check your email')
            });
            return res.status(201).json('Please check your email');
        }
        const roles = Object.values(user === null || user === void 0 ? void 0 : user.roles);
        const accessToken = yield signToken({ roles, email }, '1h', process.env.ACCESSTOKEN_STORY_SECRET);
        const refreshToken = yield signToken({ roles, email }, '1h', process.env.ACCESSTOKEN_STORY_SECRET);
        user.updateOne({ $set: { status: 'online', refreshToken } });
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