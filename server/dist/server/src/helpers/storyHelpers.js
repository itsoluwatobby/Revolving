var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { StoryModel } from "../models/Story.js";
import { CommentResponseModel } from "../models/CommentResponse.js";
import { CommentModel } from "../models/CommentModel.js";
export const getAllStories = () => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find().lean(); });
export const getStoryById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.findById(id).exec(); });
export const getUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find({ userId }).lean(); });
export const createUserStory = (story) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = story, rest = __rest(story, ["category"]);
    const newStory = new StoryModel(Object.assign({}, rest));
    yield Promise.allSettled(category.map(catVal => {
        newStory.category.push(catVal);
    }));
    yield newStory.save();
    return newStory;
});
export const updateUserStory = (userId, storyId, updateStory) => __awaiter(void 0, void 0, void 0, function* () {
    yield StoryModel.findByIdAndUpdate({ userId, _id: storyId }, Object.assign(Object.assign({}, updateStory), { edited: true }))
        .then((data) => {
        return data;
    })
        .catch(error => {
        console.log(error.message);
    });
});
export const likeAndUnlikeStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const story = yield StoryModel.findById(storyId).exec();
    if (!((_a = story === null || story === void 0 ? void 0 : story.likes) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
        yield (story === null || story === void 0 ? void 0 : story.updateOne({ $push: { likes: userId } }));
        return 'You liked this post';
    }
    else {
        yield (story === null || story === void 0 ? void 0 : story.updateOne({ $pull: { likes: userId } }));
        return 'You unliked this post';
    }
});
export const deleteUserStory = (storyId) => __awaiter(void 0, void 0, void 0, function* () {
    yield StoryModel.findByIdAndDelete({ _id: storyId });
    const commentInStory = yield CommentModel.find({ storyId }).lean();
    yield Promise.all(commentInStory.map(comment => {
        CommentResponseModel.deleteMany({ commentId: comment._id });
    }));
    yield CommentModel.deleteMany({ storyId });
});
export const deleteAllUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield StoryModel.deleteMany({ userId });
    const userComments = yield CommentModel.find({ userId }).lean();
    yield Promise.all(userComments.map(comment => {
        CommentResponseModel.deleteMany({ commentId: comment._id });
    }));
    yield CommentModel.deleteMany({ userId });
});
//# sourceMappingURL=storyHelpers.js.map