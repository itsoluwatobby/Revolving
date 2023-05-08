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
export const getSharedStoryById = (sharedId) => __awaiter(void 0, void 0, void 0, function* () { return yield SharedStoryModel.findById(sharedId).exec(); });
export const shareStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    const story = yield getStoryById(storyId);
    yield SharedStoryModel.create({
        sharerId: userId, storyId: story === null || story === void 0 ? void 0 : story._id, sharedDate: dateTime, sharedStory: Object.assign({}, story)
    });
    yield (story === null || story === void 0 ? void 0 : story.updateOne({ $push: { isShared: userId } }));
});
export const unShareStory = (userId, sharedId) => __awaiter(void 0, void 0, void 0, function* () {
    const story = yield getStoryById(sharedId);
    const sharedStory = yield getSharedStoryById(sharedId);
    yield (sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.deleteOne());
    yield (story === null || story === void 0 ? void 0 : story.updateOne({ $pull: { isShared: userId } }));
});
//# sourceMappingURL=sharedHelper.js.map