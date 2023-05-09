var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserModel } from "../models/User.js";
export const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.find().lean(); });
export const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findById(id).exec(); });
export const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findOne({ email }).exec(); });
export const getUserByToken = (token) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findOne({ verificationToken: token }).exec(); });
export const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.create(user); });
export const updateUser = (userId, updatedUser) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findByIdAndUpdate({ _id: userId }, Object.assign({}, updatedUser)); });
export const followOrUnFollow = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield UserModel.findById({ _id: followingId }).exec();
    if (!((_a = user === null || user === void 0 ? void 0 : user.followers) === null || _a === void 0 ? void 0 : _a.includes(followerId))) {
        yield (user === null || user === void 0 ? void 0 : user.updateOne({ $push: { likes: followerId } }));
        return 'You followed this user';
    }
    else {
        yield (user === null || user === void 0 ? void 0 : user.updateOne({ $pull: { likes: followerId } }));
        return 'You unfollowed this user';
    }
});
export const deleteUserAccount = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findByIdAndDelete({ _id: userId }); });
//# sourceMappingURL=userHelpers.js.map