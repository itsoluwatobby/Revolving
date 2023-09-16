var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import { deleteAccount, followOrUnFollow, getAllUsers, getUserById, updateUser } from "../services/userService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { UserModel } from '../models/User.js';
export function getUsers(req, res) {
    asyncFunc(res, () => {
        getCachedResponse({ key: `allUsers`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const allUsers = yield getAllUsers();
                return allUsers;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((users) => {
            if (!(users === null || users === void 0 ? void 0 : users.length))
                return responseType({ res, status: 404, message: 'No users available' });
            return responseType({ res, status: 200, count: users === null || users === void 0 ? void 0 : users.length, data: users });
        })
            .catch((error) => responseType({ res, status: 403, message: `${error.message}` }));
    });
}
export function getUser(req, res) {
    asyncFunc(res, () => {
        const { userId } = req.params;
        if (!userId || userId == null)
            return res.sendStatus(400);
        getCachedResponse({ key: `user:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const current = yield getUserById(userId);
                yield autoDeleteOnExpire(userId);
                return current;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((user) => {
            if (!user)
                return responseType({ res, status: 404, message: 'User not found' });
            return responseType({ res, status: 200, count: 1, data: user });
        })
            .catch((error) => responseType({ res, status: 403, message: `${error.message}` }));
    });
}
export function followUnFollowUser(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { followerId, followingId } = req.params;
        if (!followerId || !followingId)
            return res.sendStatus(400);
        const user = yield getUserById(followingId);
        yield autoDeleteOnExpire(followerId);
        if (!user)
            return responseType({ res, status: 404, message: 'user not found' });
        const result = yield followOrUnFollow(followerId, followingId);
        result != 'duplicate' ?
            responseType({ res, status: 201, message: result })
            : responseType({ res, status: 409, message: 'You cannot follow yourself' });
    }));
}
export function updateUserInfo(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        const userInfo = req.body;
        if (!userId)
            return res.sendStatus(400);
        const user = yield UserModel.findById(userId).select('+password').exec();
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (userInfo === null || userInfo === void 0 ? void 0 : userInfo.password) {
            const newPassword = userInfo === null || userInfo === void 0 ? void 0 : userInfo.password;
            const conflictingPassword = yield bcrypt.compare(newPassword, user === null || user === void 0 ? void 0 : user.password);
            if (conflictingPassword)
                return responseType({ res, status: 409, message: 'same as old password' });
            const hashedPassword = yield bcrypt.hash(newPassword, 10);
            user.updateOne({ $set: { password: hashedPassword } })
                .then(() => responseType({ res, status: 201, message: 'password reset successful' }))
                .catch(() => res.sendStatus(500));
        }
        else {
            updateUser(userId, userInfo)
                .then(updatedInfo => responseType({ res, status: 201, message: 'success', data: updatedInfo }))
                .catch(error => responseType({ res, status: 400, message: error.message }));
        }
    }));
}
export function deleteUserAccount(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        const { adminId } = req.query;
        if (!userId || !adminId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const admin = yield getUserById(adminId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (admin.roles.includes(ROLES.ADMIN)) {
            deleteAccount(userId)
                .then(() => responseType({ res, status: 204 }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }
        else
            return responseType({ res, status: 401, message: 'unauthorized' });
    }));
}
export function lockAndUnlockUserAccount(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        const { adminId } = req.query;
        if (!userId || !adminId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const admin = yield getUserById(adminId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (admin === null || admin === void 0 ? void 0 : admin.roles.includes(ROLES.ADMIN)) {
            if (!user.isAccountLocked) {
                user.updateOne({ $set: { isAccountLocked: true } })
                    .then(() => responseType({ res, status: 201, message: 'user account LOCKED successfully' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            else {
                user.updateOne({ $set: { isAccountLocked: false } })
                    .then(() => responseType({ res, status: 201, message: 'user account UNLOCKED successfully' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
        }
        else
            return responseType({ res, status: 401, message: 'unauthorized' });
    }));
}
export function subscribeToNotification(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { subscribeId, subscriberId } = req.params;
        if (!subscribeId || !subscriberId)
            return res.sendStatus(400);
        // subscribeId - recipient, subscriberId - subscriber
        const subscribee = yield getUserById(subscriberId);
        const subscribe = yield getUserById(subscribeId);
        if (!subscribe)
            return responseType({ res, status: 404, message: 'User not found' });
        if ((_a = subscribe === null || subscribe === void 0 ? void 0 : subscribe.notificationSubscribers) === null || _a === void 0 ? void 0 : _a.includes(subscriberId)) {
            subscribe.updateOne({ $pull: { notificationSubscribers: subscriberId } })
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield subscribee.updateOne({ $pull: { subscribed: subscribeId } });
                return responseType({ res, status: 201, message: 'SUCCESSFULLY UNSUBSCRIBED' });
            })).catch(() => responseType({ res, status: 400, message: 'unable to subscribe' }));
        }
        else {
            subscribe.updateOne({ $push: { notificationSubscribers: subscriberId } })
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield subscribee.updateOne({ $push: { subscribed: subscribeId } });
                return responseType({ res, status: 201, message: 'SUBSCRIPTION SUCCESSFUL' });
            })).catch(() => responseType({ res, status: 400, message: 'unable to subscribe' }));
        }
    }));
}
export const getSubscriptions = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 404, message: 'You do not have an account' });
        yield autoDeleteOnExpire(userId);
        getCachedResponse({ key: `userSubscriptions:${userId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const allSubscriptions = yield Promise.all((_a = user === null || user === void 0 ? void 0 : user.notificationSubscribers) === null || _a === void 0 ? void 0 : _a.map(id => {
                    return getUserById(id);
                }));
                return allSubscriptions;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((allSubscriptions) => {
            if (!(allSubscriptions === null || allSubscriptions === void 0 ? void 0 : allSubscriptions.length))
                return responseType({ res, status: 404, message: 'You have no subscriptions' });
            return responseType({ res, status: 200, message: 'success', count: allSubscriptions === null || allSubscriptions === void 0 ? void 0 : allSubscriptions.length, data: allSubscriptions });
        }).catch((error) => responseType({ res, status: 400, message: error === null || error === void 0 ? void 0 : error.message }));
    }));
};
//# sourceMappingURL=userController.js.map