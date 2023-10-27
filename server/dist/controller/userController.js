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
import { UserModel } from '../models/User.js';
import { ROLES } from "../config/allowedRoles.js";
import { UserService } from '../services/userService.js';
import { KV_Redis_ClientService } from '../helpers/redis.js';
import NotificationController from './notificationController.js';
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
class UserController {
    constructor() {
        this.userService = new UserService();
        this.redisClientService = new KV_Redis_ClientService();
        /**
         * @description fetches user subscriptions
         * @param req - userid
        */
        this.getSubscriptions = (req, res) => {
            asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
                const { userId } = req.params;
                if (!userId)
                    return res.sendStatus(400);
                const user = yield this.userService.getUserById(userId);
                if (!user)
                    return responseType({ res, status: 404, message: 'You do not have an account' });
                yield autoDeleteOnExpire(userId);
                this.redisClientService.getCachedResponse({ key: `userSubscriptions:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                        return yield this.userService.getUserSubscriptions(user);
                    }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                    .then((allSubscriptions) => {
                    var _a, _b;
                    if (!((_a = allSubscriptions === null || allSubscriptions === void 0 ? void 0 : allSubscriptions.subscriptions) === null || _a === void 0 ? void 0 : _a.length) && !((_b = allSubscriptions === null || allSubscriptions === void 0 ? void 0 : allSubscriptions.subscribed) === null || _b === void 0 ? void 0 : _b.length))
                        return responseType({ res, status: 404, message: 'You have no subscriptions' });
                    return responseType({ res, status: 200, message: 'success', data: allSubscriptions });
                }).catch((error) => responseType({ res, status: 400, message: error === null || error === void 0 ? void 0 : error.message }));
            }));
        };
        /**
         * @description fetches user followers and followings
         * @param req - userid
        */
        this.getUserFollows = (req, res) => {
            asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
                const { userId } = req.params;
                if (!userId || !(userId === null || userId === void 0 ? void 0 : userId.length))
                    return res.sendStatus(400);
                const user = yield this.userService.getUserById(userId);
                if (!user)
                    return responseType({ res, status: 404, message: 'You do not have an account' });
                yield autoDeleteOnExpire(userId);
                this.redisClientService.getCachedResponse({ key: `userFollows:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                        return yield this.userService.getUserFollowers(user);
                    }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                    .then((allFollows) => {
                    var _a, _b;
                    if (!((_a = allFollows === null || allFollows === void 0 ? void 0 : allFollows.follows) === null || _a === void 0 ? void 0 : _a.length) && !((_b = allFollows === null || allFollows === void 0 ? void 0 : allFollows.followers) === null || _b === void 0 ? void 0 : _b.length))
                        return responseType({ res, status: 404, message: 'You have no follows or followings' });
                    return responseType({ res, status: 200, message: 'success', data: allFollows });
                }).catch((error) => responseType({ res, status: 400, message: error === null || error === void 0 ? void 0 : error.message }));
            }));
        };
        /**
         * @description fetches user friends
         * @param req - userid
        */
        this.getUserFriends = (req, res) => {
            asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
                const { userId } = req.params;
                if (!userId || !(userId === null || userId === void 0 ? void 0 : userId.length))
                    return res.sendStatus(400);
                const user = yield this.userService.getUserById(userId);
                if (!user)
                    return responseType({ res, status: 404, message: 'You do not have an account' });
                yield autoDeleteOnExpire(userId);
                this.redisClientService.getCachedResponse({ key: `userFriends:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                        return yield this.userService.getFriends(user);
                    }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                    .then((allUsers) => {
                    if (!(allUsers === null || allUsers === void 0 ? void 0 : allUsers.length))
                        return responseType({ res, status: 404, message: 'You have no friends' });
                    return responseType({ res, status: 200, message: 'success', count: allUsers === null || allUsers === void 0 ? void 0 : allUsers.length, data: allUsers });
                }).catch((error) => responseType({ res, status: 400, message: error === null || error === void 0 ? void 0 : error.message }));
            }));
        };
        this.dateTime = new Date().toString();
    }
    /**
     * @description fetches all users
    */
    getUsers(req, res) {
        asyncFunc(res, () => {
            this.redisClientService.getCachedResponse({ key: `allUsers`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const allUsers = yield this.userService.getAllUsers();
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
    /**
    * @description fetches a user information
    * @param req - userid
   */
    getUser(req, res) {
        asyncFunc(res, () => {
            const { userId } = req.params;
            if (!userId || userId === 'null')
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `user:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const current = yield this.userService.getUserById(userId);
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
    /**
     * @description follow or unfollow a user
     * @param req - followerId-sender, followingId- receiver
    */
    followUnFollowUser(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { followerId, followingId } = req.params;
            if (!followerId || !followingId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(followingId);
            yield autoDeleteOnExpire(followerId);
            if (!user)
                return responseType({ res, status: 404, message: 'user not found' });
            const result = yield this.userService.followOrUnFollow(followerId, followingId);
            const errorResponse = ['unable to follow', 'unable to unfollow'];
            if (errorResponse === null || errorResponse === void 0 ? void 0 : errorResponse.includes(result))
                return responseType({ res, status: 409, message: result });
            return result !== 'duplicate' ?
                responseType({ res, status: 201, message: result })
                : responseType({ res, status: 409, message: 'You cannot follow yourself' });
        }));
    }
    /**
     * @description upadates user information
     * @param req - userid
     * @body body - updated user information
    */
    updateUserInfo(req, res) {
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
                this.userService.updateUser(userId, userInfo)
                    .then(updatedInfo => responseType({ res, status: 201, message: 'success', data: updatedInfo }))
                    .catch(error => responseType({ res, status: 400, message: error.message }));
            }
        }));
    }
    /**
     * @description deletes user account by admin user
     * @param req - userid
     * @query query - adminId
    */
    deleteUserAccount(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { adminId } = req.query;
            if (!userId || !adminId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            const admin = yield this.userService.getUserById(adminId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            if (admin.roles.includes(ROLES.ADMIN)) {
                this.userService.deleteAccount(userId)
                    .then(() => responseType({ res, status: 204 }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            else
                return responseType({ res, status: 401, message: 'unauthorized' });
        }));
    }
    /**
     * @description lock and unlock user account by admin user
     * @param req - userid
     * @query query - adminId
    */
    lockAndUnlockUserAccount(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { adminId } = req.query;
            if (!userId || !adminId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            const admin = yield this.userService.getUserById(adminId);
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
    /**
     * @description subscribe to user post
     * @param req - subscribeId, subscriberId
    */
    subscribeToNotification(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { subscribeId, subscriberId } = req.params;
            if (!subscribeId || !subscriberId)
                return res.sendStatus(400);
            // subscribeId - recipient, subscriberId - subscriber
            const subscribee = yield this.userService.getUserById(subscriberId);
            const subscribeRecipient = yield this.userService.getUserById(subscribeId);
            if (!subscribeRecipient)
                return responseType({ res, status: 404, message: 'User not found' });
            const { firstName, lastName, displayPicture: { photo }, email } = subscribee;
            const notiSubscribe = {
                userId: subscriberId, fullName: `${firstName} ${lastName}`,
                displayPicture: photo, email
            };
            const duplicate = (_a = subscribeRecipient === null || subscribeRecipient === void 0 ? void 0 : subscribeRecipient.notificationSubscribers) === null || _a === void 0 ? void 0 : _a.find(sub => (sub === null || sub === void 0 ? void 0 : sub.subscriberId) === subscriberId);
            if (duplicate) {
                const targetSubscriberRecipient = (_b = subscribee === null || subscribee === void 0 ? void 0 : subscribee.subscribed) === null || _b === void 0 ? void 0 : _b.find(sub => (sub === null || sub === void 0 ? void 0 : sub.subscribeRecipientId) === subscribeId);
                subscribeRecipient.updateOne({ $pull: { notificationSubscribers: duplicate } })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield subscribee.updateOne({ $pull: { subscribed: targetSubscriberRecipient } });
                    yield NotificationController.removeSingleNotification(subscribeId, notiSubscribe, 'Subcribe');
                    return responseType({ res, status: 201, message: 'SUCCESSFULLY UNSUBSCRIBED' });
                })).catch(() => responseType({ res, status: 400, message: 'unable to unsubscribe' }));
            }
            else {
                subscribeRecipient.updateOne({ $push: { notificationSubscribers: { subscriberId, createdAt: this.dateTime } } })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield subscribee.updateOne({ $push: { subscribed: { subscribeRecipientId: subscribeId, createdAt: this.dateTime } } });
                    yield NotificationController.addToNotification(subscribeId, notiSubscribe, 'Subcribe');
                    return responseType({ res, status: 201, message: 'SUBSCRIPTION SUCCESSFUL' });
                })).catch(() => responseType({ res, status: 400, message: 'unable to subscribe' }));
            }
        }));
    }
}
export default new UserController();
//# sourceMappingURL=userController.js.map