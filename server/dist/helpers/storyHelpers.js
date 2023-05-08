var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StoryModel } from "../models/Story.js";
export const getAllStories = () => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find().lean(); });
export const getStoryById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.findById(id).exec(); });
export const getUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find({ userId }).lean(); });
export const createUserStory = (story) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.create(Object.assign({}, story)); });
export const updateUserStory = (userId, storyId, updateStory) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.findByIdAndUpdate({ userId, _id: storyId }, Object.assign({}, updateStory)); });
export const LikeAndUnlikeStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    const story = yield StoryModel.findById({ _id: storyId }).exec();
    if (!(story === null || story === void 0 ? void 0 : story.likes.includes(userId))) {
        yield (story === null || story === void 0 ? void 0 : story.updateOne({ $push: { likes: userId } }));
        return 'You like this post';
    }
    else {
        yield (story === null || story === void 0 ? void 0 : story.updateOne({ $pull: { likes: userId } }));
        return 'You unliked this post';
    }
});
export const deleteUserStory = (storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.findByIdAndDelete({ _id: storyId }); });
export const deleteAllUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.deleteMany({ userId }); });
//# sourceMappingURL=storyHelpers.js.map