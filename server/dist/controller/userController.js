var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncFunc, responseType } from "../helpers/helper.js";
import { followOrUnFollow, getAllUsers, getUserById } from "../helpers/userHelpers.js";
export const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield getAllUsers();
        if (!(users === null || users === void 0 ? void 0 : users.length))
            return responseType({ res, status: 404, message: 'No users available' });
        return responseType({ res, status: 200, count: users === null || users === void 0 ? void 0 : users.length, data: users });
    }));
});
export const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 404, message: 'User not found' });
        return responseType({ res, status: 200, count: 1, data: user });
    }));
});
export const followUnFollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { followerId, followingId } = req.params;
        if (!followerId || !followingId)
            return res.sendStatus(400);
        const user = yield getUserById(followingId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield followOrUnFollow(followerId, followingId);
        result != 'duplicate' ?
            responseType({ res, status: 201, message: result })
            : responseType({ res, status: 409, message: 'You cannot follow yourself' });
    }));
});
//# sourceMappingURL=userController.js.map