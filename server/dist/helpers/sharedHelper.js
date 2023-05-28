var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SharedStoryModel } from "../models/SharedStory.js";
import { dateTime } from "./helper.js";
import { getStoryById } from "./storyHelpers.js";
export const getSharedStoryById = (sharedId) => __awaiter(void 0, void 0, void 0, function* () { return yield SharedStoryModel.findById(sharedId).select('-sharedStory.isShared'); });
export const getUserSharedStories = (sharerId) => __awaiter(void 0, void 0, void 0, function* () { return yield SharedStoryModel.find({ sharerId }).lean(); });
export const getAllSharedStories = () => __awaiter(void 0, void 0, void 0, function* () { return yield SharedStoryModel.find().lean(); });
export const createShareStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    const story = yield getStoryById(storyId);
    const newSharedStory = new SharedStoryModel({
        sharerId: userId, storyId: story === null || story === void 0 ? void 0 : story._id, sharedDate: dateTime, sharedStory: Object.assign({}, story)
    });
    yield newSharedStory.save();
    yield (story === null || story === void 0 ? void 0 : story.updateOne({ $push: { isShared: { userId, sharedId: newSharedStory === null || newSharedStory === void 0 ? void 0 : newSharedStory._id.toString() } } }));
    return newSharedStory;
});
export const unShareStory = (userId, sharedId) => __awaiter(void 0, void 0, void 0, function* () {
    const sharedStory = yield getSharedStoryById(sharedId);
    if (!sharedStory)
        return 'not found';
    const story = yield getStoryById(sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.storyId);
    const verifyUser = yield (story === null || story === void 0 ? void 0 : story.isShared.map(targetShare => (targetShare === null || targetShare === void 0 ? void 0 : targetShare.userId) === userId && (targetShare === null || targetShare === void 0 ? void 0 : targetShare.sharedId) === sharedId).find(res => res = true));
    if (!verifyUser)
        return 'unauthorized';
    yield sharedStory.deleteOne();
    yield (story === null || story === void 0 ? void 0 : story.updateOne({ $pull: { isShared: { userId, sharedId } } }));
});
export const likeAndUnlikeSharedStory = (userId, sharedId) => __awaiter(void 0, void 0, void 0, function* () {
    const sharedStory = yield SharedStoryModel.findById(sharedId).exec();
    if (!(sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.likes.includes(userId))) {
        yield (sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.updateOne({ $push: { likes: userId } }));
        return 'You liked this post';
    }
    else {
        yield (sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.updateOne({ $pull: { likes: userId } }));
        return 'You unliked this post';
    }
});
//# sourceMappingURL=sharedHelper.js.map