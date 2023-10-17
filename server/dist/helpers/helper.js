var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import { sub } from 'date-fns';
import { TaskBinModel } from '../models/TaskManager.js';
export const dateTime = sub(new Date, { minutes: 0 }).toISOString();
/**
 * @description function to sign tokens
 * @param claim user data to attach to token
 * @param expires expiration date
 * @param secret token secret
 * @returns
 */
export function signToken(claim, expires, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = jwt.sign({
            "userInfo": {
                roles: claim === null || claim === void 0 ? void 0 : claim.roles, email: claim === null || claim === void 0 ? void 0 : claim.email
            }
        }, secret, { expiresIn: expires });
        return token;
    });
}
/**
 * @description function to verify jwt tokens
 * @param token
 * @param secret
 * @returns
 */
export function verifyToken(token, secret) {
    return __awaiter(this, void 0, void 0, function* () {
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
}
/**
 * @description general response body
 * @param param0
 * @returns
 */
export const responseType = ({ res, status = 200, count = 0, message = 'success', data = {}, pages = {} }) => {
    return (data ?
        res.status(status).json({ pages, meta: { status, count, message }, data })
        : res.status(status).json({ meta: { status, message } }));
};
/**
 * @class an object to keep track of the request methods to enable effect caching
 */
class UrlsObj {
    constructor() {
        this.req = { mtd: '', url: '' };
        this.urls = [];
    }
    isPresent(reqUrl) {
        let present = this.urls.map(url => reqUrl.includes(url.mtd)).find(seen => seen == true);
        if (!present) {
            const cumtomUrls = ['POST', 'PUT', 'PATCH', 'DELETE'];
            present = cumtomUrls.map(cumtomUrl => reqUrl.includes(cumtomUrl)).find(seen => seen == true);
        }
        return present ? true : false;
    }
    pushIn(reqs) {
        this.req = reqs;
        const others = this.urls.filter(url => url.url !== this.req.url);
        this.urls = others;
        this.urls.push(this.req);
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
        this.req = { mtd: '', url: '' };
    }
}
export const objInstance = new UrlsObj();
/**
 * @description general reusable async function
 * @param res the responseBody
 * @param callback callback function
 */
export const asyncFunc = (res, callback) => {
    try {
        callback();
    }
    catch (error) {
        res.sendStatus(500);
    }
};
export const pagination = ({ page, limit, Models, callback, query = 'nil' }) => __awaiter(void 0, void 0, void 0, function* () {
    const count = limit;
    const currentPage = page;
    const startIndex = (currentPage * count) - count;
    const resultLength = yield Models.find().count();
    const data = yield callback();
    // const data = await Models.find().skip(startIndex).limit(count)
    // {skip: startIndex, limit: count, query}
    const total = Math.ceil(resultLength / count);
    const pageable = {
        pages: {
            previous: (currentPage === 1 || currentPage > total || currentPage < 1) ? 'Non' : currentPage - 1,
            currentPage,
            next: (currentPage === total || currentPage > total || currentPage < 1) ? 'Non' : currentPage + 1,
        },
        count: data === null || data === void 0 ? void 0 : data.length,
        pagesLeft: (currentPage > total || currentPage < 1) ? 'Non' : total - currentPage,
        numberOfPages: total,
    };
    // if(currentPage > total || currentPage < 1) 
    // return { message: currentPage < 1 ? 'Pages starts from 1' : 'Pages exceeded', pageable }
    return { pageable, data };
});
function timeConverterInMillis() {
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    return { minute, hour, day };
}
/**
 * @description function to autodelete a taskbin when expired
 * @param userId
 * @returns null
 */
export function autoDeleteOnExpire(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { day } = timeConverterInMillis();
        const expireAfterThirtyDays = day * 30;
        const currentTime = new Date();
        if (!userId)
            return;
        else {
            const task = yield TaskBinModel.findOne({ userId });
            if (!(task === null || task === void 0 ? void 0 : task.updatedAt))
                return;
            const elaspedTime = +currentTime - +(task === null || task === void 0 ? void 0 : task.updatedAt);
            if (elaspedTime > expireAfterThirtyDays) {
                yield TaskBinModel.findOneAndUpdate({ userId }, { $set: { taskBin: [] } });
                return;
            }
            return;
        }
    });
}
/**
 * @description function to generate otp
 * @param MAXLENGTH size of otp
 * @returns otp
 */
export function generateOTP(MAXLENGTH = 6) {
    let generatedOTP = '';
    const numberOriginator = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < MAXLENGTH; i++) {
        const randomIndex = Math.ceil(Math.random() * (numberOriginator === null || numberOriginator === void 0 ? void 0 : numberOriginator.length) - 1);
        generatedOTP += numberOriginator[randomIndex];
    }
    return generatedOTP;
}
/**
  * @description checks token expiration time
  * @param req - createdTime
 */
export function checksExpiration(createdTime) {
    const EXPIRES_IN_30_MINUTES = 30 * 60 * 1000; // 30 minutes
    const presentTime = new Date();
    if (!createdTime)
        return;
    const elaspedTime = +presentTime - +createdTime;
    return elaspedTime > EXPIRES_IN_30_MINUTES ? true : false;
}
export function mongooseError(cb) {
    try {
        const data = cb();
        return data;
    }
    catch (error) {
        console.log('An error occurred');
    }
}
//# sourceMappingURL=helper.js.map