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
import fsPromises from 'fs/promises';
import { CommentModel } from "../models/CommentModel.js";
import { deleteSingleComment } from "./commentHelper.js";
export const getAllStories = () => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find().lean(); });
export const getStoryById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.findById(id).exec(); });
export const getUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield StoryModel.find({ userId }).lean(); });
export const createUserStory = (story) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = story, rest = __rest(story, ["category"]);
        const newStory = new StoryModel(Object.assign({}, rest));
        yield Promise.allSettled(category.map(catVal => {
            newStory.category.push(catVal);
        }));
        yield newStory.save();
        return newStory;
    }
    catch (error) {
        console.log(error.messages);
    }
});
export const updateUserStory = (storyId, updateStory) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield StoryModel.findByIdAndUpdate({ _id: storyId }, Object.assign(Object.assign({}, updateStory), { edited: true }));
        return res;
    }
    catch (error) {
        console.log(error.messages);
    }
});
export const likeAndUnlikeStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const story = yield StoryModel.findById(storyId).exec();
        if (!((_a = story === null || story === void 0 ? void 0 : story.likes) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
            yield (story === null || story === void 0 ? void 0 : story.updateOne({ $push: { likes: userId } }));
            return 'You liked this post';
        }
        else {
            yield (story === null || story === void 0 ? void 0 : story.updateOne({ $pull: { likes: userId } }));
            return 'You unliked this post';
        }
    }
    catch (error) {
        console.log(error.messages);
    }
});
export const deleteUserStory = (storyId) => __awaiter(void 0, void 0, void 0, function* () {
    const story = yield getStoryById(storyId);
    try {
        yield StoryModel.findByIdAndDelete({ _id: storyId });
        const commentInStory = yield CommentModel.find({ storyId }).lean();
        yield Promise.all(commentInStory.map(comment => {
            deleteSingleComment(comment._id, false);
        }));
        const picturesArray = story.picture;
        yield Promise.all(picturesArray.map((pictureLink) => __awaiter(void 0, void 0, void 0, function* () {
            const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5);
            const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
            yield fsPromises.unlink(pathname)
                .then(() => console.log('DELETED'))
                .catch(error => console.log(error.message));
        })));
    }
    catch (error) {
        console.log(error.messages);
    }
});
export const deleteAllUserStories = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const stories = yield getUserStories(userId);
    try {
        yield StoryModel.deleteMany({ userId });
        const userComments = yield CommentModel.find({ userId }).lean();
        yield Promise.all(userComments.map(comment => {
            deleteSingleComment(comment._id, false);
        }));
        yield Promise.all(stories.map((story) => __awaiter(void 0, void 0, void 0, function* () {
            const picturesArray = story.picture;
            yield Promise.all(picturesArray.map((pictureLink) => __awaiter(void 0, void 0, void 0, function* () {
                const imageName = pictureLink.substring(pictureLink.indexOf('4000/') + 5);
                const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
                yield fsPromises.unlink(pathname);
            })));
        })));
    }
    catch (error) {
        console.log(error.messages);
    }
});
//# sourceMappingURL=storyHelpers.js.map