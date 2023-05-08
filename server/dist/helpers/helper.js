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
import { sign, verify } from 'jsonwebtoken';
export const dateTime = sub(new Date, { minutes: 0 }).toISOString();
export const signToken = (claim, expires, secret) => __awaiter(void 0, void 0, void 0, function* () {
    const token = sign({
        "userInfo": {
            username: claim === null || claim === void 0 ? void 0 : claim.username, email: claim === null || claim === void 0 ? void 0 : claim.email
        }
    }, secret, { algorithm: 'RS512', expiresIn: expires });
    return token;
});
export const verifyToken = (token, secret) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    verify(token, secret, (err, decoded) => {
        if ((err === null || err === void 0 ? void 0 : err.name) == 'TokenExpiredError')
            response = 'Expired Token';
        else if ((err === null || err === void 0 ? void 0 : err.name) == 'JsonWebTokenError')
            response = 'Bad Token';
        else {
            response = {
                username: decoded === null || decoded === void 0 ? void 0 : decoded.username,
                email: decoded === null || decoded === void 0 ? void 0 : decoded.email
            };
        }
    });
    return response;
});
export const mailOptions = (receiver, sender, subject) => {
    return {
        to: receiver,
        from: sender,
        subject,
        html: ``
    };
};
//# sourceMappingURL=helper.js.map