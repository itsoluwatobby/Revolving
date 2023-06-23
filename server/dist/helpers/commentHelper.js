var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommentModel } from "../models/CommentModel.js";
import { CommentResponseModel } from "../models/CommentResponse.js";
import { StoryModel } from "../models/Story.js";
export const getAllCommentsInStory = (storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ storyId }).lean(); });
export const getCommentById = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.findById(commentId).exec(); });
export const getUserComments = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ userId }).lean(); });
export const getUserCommentsInStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ userId, storyId }).lean(); });
export const createComment = (comment) => __awaiter(void 0, void 0, void 0, function* () {
    const newComment = yield CommentModel.create(Object.assign({}, comment));
    yield StoryModel.findByIdAndUpdate({ _id: comment.storyId }, { $push: { commentIds: newComment === null || newComment === void 0 ? void 0 : newComment._id } });
    return newComment;
});
export const editComment = (userId, commentId, editedComment) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.findByIdAndUpdate({ userId, _id: commentId }, Object.assign(Object.assign({}, editedComment), { edited: true })); });
export const likeAndUnlikeComment = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield CommentModel.findById(commentId).exec();
    if (!(comment === null || comment === void 0 ? void 0 : comment.likes.includes(userId))) {
        yield (comment === null || comment === void 0 ? void 0 : comment.updateOne({ $push: { likes: userId } }));
        return 'You liked this comment';
    }
    else {
        yield (comment === null || comment === void 0 ? void 0 : comment.updateOne({ $pull: { likes: userId } }));
        return 'You unliked this comment';
    }
});
export const deleteSingleComment = (commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield getCommentById(commentId);
    yield StoryModel.findByIdAndUpdate({ _id: comment.storyId }, { $pull: { commentIds: comment === null || comment === void 0 ? void 0 : comment._id } });
    yield CommentModel.findByIdAndDelete({ _id: commentId });
    yield CommentResponseModel.deleteMany({ commentId });
});
export const deleteAllUserComments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userComments = yield getUserComments(userId);
    yield Promise.all(userComments.map(comment => {
        StoryModel.findByIdAndUpdate({ _id: comment.storyId }, { $pull: { commentIds: comment._id } });
        CommentResponseModel.deleteMany({ commentId: comment._id, userId });
    }));
    yield CommentModel.deleteMany({ userId });
});
export const deleteAllUserCommentsInStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () {
    const userComments = yield getUserComments(userId);
    yield Promise.all(userComments.map(comment => {
        StoryModel.findByIdAndUpdate({ _id: comment.storyId }, { $pull: { commentIds: comment._id } });
        CommentResponseModel.deleteMany({ commentId: comment._id, userId });
    }));
    yield CommentModel.deleteMany({ userId, storyId });
});
{ /* ---------------------------------------------- COMMENT RESPONSE ------------------------------------------------- */ }
export const getAllCommentsResponse = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.find({ commentId }).lean(); });
export const getResponseById = (responseId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findById(responseId).exec(); });
export const getResponseByCommentId = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findById(commentId).lean(); });
export const getUserResponses = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.find({ userId, commentId }).lean(); });
export const createResponse = (response) => __awaiter(void 0, void 0, void 0, function* () {
    const newResponse = yield CommentResponseModel.create(Object.assign({}, response));
    yield CommentModel.findByIdAndUpdate({ _id: response.commentId }, { $push: { commentResponse: newResponse === null || newResponse === void 0 ? void 0 : newResponse._id } });
    return newResponse;
});
export const editResponse = (userId, responseId, editedResponse) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findByIdAndUpdate({ userId, _id: responseId }, Object.assign(Object.assign({}, editedResponse), { edited: true })); });
export const likeAndUnlikeResponse = (userId, responseId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield CommentResponseModel.findById(responseId).exec();
    if (!(response === null || response === void 0 ? void 0 : response.likes.includes(userId))) {
        yield (response === null || response === void 0 ? void 0 : response.updateOne({ $push: { likes: userId } }));
        return 'You liked this response';
    }
    else {
        yield (response === null || response === void 0 ? void 0 : response.updateOne({ $pull: { likes: userId } }));
        return 'You unliked this response';
    }
});
export const deleteSingleResponse = (responseId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield getResponseById(responseId);
    yield CommentResponseModel.findByIdAndDelete({ _id: responseId });
    yield CommentModel.findByIdAndUpdate({ _id: response.commentId }, { $pull: { commentResponse: response === null || response === void 0 ? void 0 : response._id } });
});
export const deleteAllUserResponses = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield getUserComments(userId);
    yield Promise.all(comments.map((comment) => __awaiter(void 0, void 0, void 0, function* () {
        const userResponse = yield getUserResponses(userId, comment._id);
        yield Promise.all(userResponse.map(response => {
            CommentModel.findByIdAndUpdate({ _id: comment._id }, { $pull: { commentResponse: response._id } });
        }));
    })));
    yield CommentResponseModel.deleteMany({ userId });
});
export const deleteAllUserResponseInComment = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const userResponse = yield getUserResponses(userId, commentId);
    yield Promise.all(userResponse.map(response => {
        CommentModel.findByIdAndUpdate({ _id: response.commentId }, { $pull: { commentResponse: response._id } });
    }));
    yield CommentResponseModel.deleteMany({ userId, commentId });
});
//# sourceMappingURL=commentHelper.js.map