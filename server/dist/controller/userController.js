var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { deleteAccount, followOrUnFollow, getAllUsers, getUserById, updateUser } from "../helpers/userHelpers.js";
import { getCachedResponse } from "../helpers/redis.js";
import { ROLES } from "../config/allowedRoles.js";
import bcrypt from 'bcrypt';
export const getUsers = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield getCachedResponse({ key: `allUsers`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const allUsers = yield getAllUsers();
                if (!(allUsers === null || allUsers === void 0 ? void 0 : allUsers.length))
                    return responseType({ res, status: 404, message: 'No users available' });
                return allUsers;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        return responseType({ res, status: 200, count: users === null || users === void 0 ? void 0 : users.length, data: users });
    }));
};
export const getUser = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const user = yield getCachedResponse({ key: `user:${userId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const current = yield getUserById(userId);
                yield autoDeleteOnExpire(userId);
                if (!current)
                    return responseType({ res, status: 404, message: 'User not found' });
                return current;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        return responseType({ res, status: 200, count: 1, data: user });
    }));
};
export const followUnFollowUser = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { followerId, followingId } = req.params;
        if (!followerId || !followingId)
            return res.sendStatus(400);
        const user = yield getUserById(followingId);
        yield autoDeleteOnExpire(followerId);
        if (!user)
            return responseType({ res, status: 404, message: 'user not found' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield followOrUnFollow(followerId, followingId);
        result != 'duplicate' ?
            responseType({ res, status: 201, message: result })
            : responseType({ res, status: 409, message: 'You cannot follow yourself' });
    }));
};
export const updateUserInfo = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const { userId } = req.params;
        const userInfo = req.body;
        if (!userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if ((_a = userInfo === null || userInfo === void 0 ? void 0 : userInfo.authentication) === null || _a === void 0 ? void 0 : _a.password) {
            const newPassword = (_b = userInfo === null || userInfo === void 0 ? void 0 : userInfo.authentication) === null || _b === void 0 ? void 0 : _b.password;
            const conflictingPassword = yield bcrypt.compare(newPassword, (_c = user === null || user === void 0 ? void 0 : user.authentication) === null || _c === void 0 ? void 0 : _c.password);
            if (conflictingPassword)
                return responseType({ res, status: 409, message: 'same as old password' });
            const hashedPassword = yield bcrypt.hash(newPassword, 10);
            yield user.updateOne({ $set: { authentication: { password: hashedPassword } } })
                .then(() => responseType({ res, status: 201, message: 'password reset successful' }))
                .catch(() => res.sendStatus(500));
        }
        else {
            yield updateUser(userId, userInfo)
                .then(updatedInfo => {
                return responseType({ res, status: 201, message: 'success', data: updatedInfo });
            })
                .catch(error => responseType({ res, status: 400, message: error.message }));
        }
    }));
};
export const deleteUserAccount = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const { adminId } = req.query;
        if (!userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const admin = yield getUserById(adminId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if (user || admin.roles.includes(ROLES.ADMIN)) {
            yield deleteAccount(userId);
            return responseType({ res, status: 204 });
        }
        return responseType({ res, status: 401, message: 'unauthorized' });
    }));
};
//# sourceMappingURL=userController.js.map