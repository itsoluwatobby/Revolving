var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { UserModel } from "../models/User.js";
import { deleteAllUserStories } from "./storyHelpers.js";
export const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.find().lean(); });
export const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findById(id).exec(); });
export const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findOne({ email }).exec(); });
export const getUserByToken = (token) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findOne({ refreshToken: token }).exec(); });
export const getUserByVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findOne({ verificationToken: token }).exec(); });
export const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield UserModel.create(user);
    yield TaskBinModel.create({
        userId: newUser === null || newUser === void 0 ? void 0 : newUser._id, taskBin: []
    });
    return newUser;
});
export const updateUser = (userId, updatedUser) => __awaiter(void 0, void 0, void 0, function* () { return yield UserModel.findByIdAndUpdate({ _id: userId }, Object.assign({}, updatedUser)); });
export const followOrUnFollow = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield UserModel.findById(followerId).exec();
    const following = yield UserModel.findById(followingId).exec();
    if ((user === null || user === void 0 ? void 0 : user._id.toString()) == followingId)
        return 'duplicate';
    if (!((_a = user === null || user === void 0 ? void 0 : user.followings) === null || _a === void 0 ? void 0 : _a.includes(followingId))) {
        yield (user === null || user === void 0 ? void 0 : user.updateOne({ $push: { followings: followingId } }));
        yield (following === null || following === void 0 ? void 0 : following.updateOne({ $push: { followers: followerId } }));
        return 'You followed this user';
    }
    else {
        yield (user === null || user === void 0 ? void 0 : user.updateOne({ $pull: { followings: followingId } }));
        yield (following === null || following === void 0 ? void 0 : following.updateOne({ $pull: { followers: followerId } }));
        return 'You unfollowed this user';
    }
});
export const deleteAccount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield UserModel.findByIdAndDelete({ _id: userId });
    yield deleteAllUserStories(userId);
    yield TaskManagerModel.deleteMany({ userId });
});
//# sourceMappingURL=userHelpers.js.map