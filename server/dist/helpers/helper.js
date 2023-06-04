var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { sub } from 'date-fns';
import jwt from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
export const dateTime = sub(new Date, { minutes: 0 }).toISOString();
export const signToken = (claim, expires, secret) => __awaiter(void 0, void 0, void 0, function* () {
    const token = jwt.sign({
        "userInfo": {
            roles: claim === null || claim === void 0 ? void 0 : claim.roles, email: claim === null || claim === void 0 ? void 0 : claim.email
        }
    }, secret, { expiresIn: expires });
    return token;
});
export const verifyToken = (token, secret) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    jwt.verify(token, secret, (err, decoded) => {
        var _a, _b;
        if ((err === null || err === void 0 ? void 0 : err.name) == 'TokenExpiredError')
            response = 'Expired Token';
        else if ((err === null || err === void 0 ? void 0 : err.name) == 'JsonWebTokenError')
            response = 'Bad Token';
        else {
            response = {
                roles: (_a = decoded === null || decoded === void 0 ? void 0 : decoded.userInfo) === null || _a === void 0 ? void 0 : _a.roles,
                email: (_b = decoded === null || decoded === void 0 ? void 0 : decoded.userInfo) === null || _b === void 0 ? void 0 : _b.email
            };
        }
    });
    return response;
});
// type ResMessage = {
//   res: Response,
//   status: number,
//   message: string,
//   data?: object
// }
export const responseType = ({ res, status = 200, count = 0, message = 'success', data = {}, pages = {} }) => {
    return (data ?
        res.status(status).json({ pages, meta: { status, count, message }, data })
        : res.status(status).json({ meta: { status, message }, data }));
};
class UrlsObj {
    constructor() {
        this.req = { mtd: '', url: '' };
        this.urls = [];
    }
    isPresent(reqUrl) {
        const present = this.urls.find(url => reqUrl.includes(url.mtd));
        return present ? true : false;
    }
    pushIn(reqs) {
        this.req = reqs;
        const conflict = this.urls.filter(url => url.url == this.req.url);
        !conflict.length ? this.urls.push(this.req) : null;
    }
    pullIt(reqUrl) {
        const otherUrls = this.urls.filter(url => !reqUrl.includes(url.mtd));
        this.urls = [...otherUrls];
    }
    getUrl() {
        return this.urls;
    }
    reset() {
        this.urls = [];
    }
}
export const objInstance = new UrlsObj();
export const transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
        user: process.env.REVOLVING_MAIL,
        pass: process.env.REVOLVING_PASS,
    }
});
export const mailOptions = (receiver, username, verificationLink) => {
    return {
        to: receiver,
        from: process.env.REVOLVING_MAIL,
        subject: `ACCOUNT CONFIRMATION FOR ${username}`,
        html: `<h2>Tap the Link below To Activate Your Account</h2><br/>
                <p>Link expires in 30 minutes, please confirm now!!</p>
                <a href=${verificationLink} target=_blank style='text-decoration:none;'>
                   <button style='padding:1rem; padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: teal; border:none; border-radius:10px; font-size: 18px'>
                      Account Verification
                   </button>
                </a>
                <p>Or copy the link below to your browser</p>
                <p>${verificationLink}</p><br/>
                <span>Please keep link private, it contains some sensitive information about you.</span>`
    };
};
export const asyncFunc = (res, callback) => {
    try {
        callback();
    }
    catch (error) {
        res.sendStatus(500);
    }
};
export const pagination = ({ startIndex = 1, endIndex = 1, page = 1, limit = 1, cb }) => __awaiter(void 0, void 0, void 0, function* () {
    const pages = {};
    try {
        const parsedObject = yield cb();
        if (parsedObject === null || parsedObject === void 0 ? void 0 : parsedObject.length) {
            if (endIndex < (parsedObject === null || parsedObject === void 0 ? void 0 : parsedObject.length)) {
                pages.next = {
                    page: +page + 1,
                    limit: +limit
                };
            }
            if (startIndex > 0) {
                pages.previous = {
                    page: +page - 1,
                    limit: +limit
                };
            }
            const result = parsedObject;
            return { pages, result };
        }
        const result = parsedObject;
        return result;
    }
    catch (error) {
        console.log(error);
    }
});
//# sourceMappingURL=helper.js.map