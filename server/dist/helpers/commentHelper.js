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
export const getAllCommentsInStory = (storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ storyId }).lean(); });
export const getCommentById = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.findById(commentId).exec(); });
export const getUserComments = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ userId }).lean(); });
export const getUserCommentsInStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.find({ userId, storyId }).lean(); });
export const createComment = (comment) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.create(Object.assign({}, comment)); });
export const editComment = (userId, commentId, editedComment) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.findByIdAndUpdate({ userId, _id: commentId }, Object.assign({}, editedComment)); });
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
export const deleteSingleComment = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.findByIdAndDelete({ _id: commentId }); });
export const deleteAllUserComments = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.deleteMany({ userId }); });
export const deleteAllUserCommentsInStory = (userId, storyId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.deleteMany({ userId, storyId }); });
{ /* ---------------------------------------------- COMMENT RESPONSE ------------------------------------------------- */ }
export const getAllCommentsResponse = (commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.find({ commentId }).lean(); });
export const getResponseById = (responseId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findById(responseId).exec(); });
export const getUserResponses = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.find({ userId, commentId }).lean(); });
export const createResponse = (response) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.create(Object.assign({}, response)); });
export const editResponse = (userId, responseId, editedResponse) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findByIdAndUpdate({ userId, _id: responseId }, Object.assign({}, editedResponse)); });
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
export const deleteSingleResponse = (responseId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.findByIdAndDelete({ _id: responseId }); });
export const deleteAllUserResponses = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentModel.deleteMany({ userId }); });
export const deleteAllUserResponseInComment = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () { return yield CommentResponseModel.deleteMany({ userId, commentId }); });
//# sourceMappingURL=commentHelper.js.map