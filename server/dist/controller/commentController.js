var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getUserById } from "../helpers/userHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { getCachedResponse } from "../helpers/redis.js";
import { createComment, deleteAllUserComments, deleteAllUserCommentsInStory, deleteSingleComment, editComment, getAllCommentsInStory, getCommentById, getUserComments, getUserCommentsInStory, likeAndUnlikeComment } from "../helpers/commentHelper.js";
;
export const createNewComment = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        const newComment = req.body;
        if (!userId || storyId || !(newComment === null || newComment === void 0 ? void 0 : newComment.comment))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const comment = yield createComment(Object.assign({}, newComment));
        return responseType({ res, status: 201, count: 1, data: comment });
    }));
};
export const updateComment = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, commentId } = req.params;
        const editedComment = req.body;
        if (!userId || !commentId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const comment = yield editComment(userId, commentId, editedComment);
        return responseType({ res, status: 201, count: 1, data: comment });
    }));
};
export const deleteComment = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, commentId } = req.params;
        if (!userId || !commentId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const comment = yield getCommentById(commentId);
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            yield deleteSingleComment(commentId);
            return res.sendStatus(204);
        }
        if (!(comment === null || comment === void 0 ? void 0 : comment.userId.toString()) == (user === null || user === void 0 ? void 0 : user._id.toString()))
            return res.sendStatus(401);
        yield deleteSingleComment(commentId);
        return res.sendStatus(204);
    }));
};
// ADMIN USER
export const deleteUserComments = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId, commentId } = req.params;
        const { option } = req.query;
        if (!userId || !commentId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const adminUser = yield getUserById(adminId);
        if (!user || !adminUser)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.roles.includes(ROLES.ADMIN)) {
            if ((option === null || option === void 0 ? void 0 : option.command) == 'onlyInStory') {
                yield deleteAllUserCommentsInStory(userId, option === null || option === void 0 ? void 0 : option.storyId);
                return responseType({ res, status: 201, message: 'All user comments in story deleted' });
            }
            else if ((option === null || option === void 0 ? void 0 : option.command) == 'allUserComment') {
                yield deleteAllUserComments(userId);
                return responseType({ res, status: 201, message: 'All user comments in story deleted' });
            }
        }
        return responseType({ res, status: 401, message: 'unauthorized' });
    }));
};
export const getComment = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { commentId } = req.params;
        if (!commentId)
            return res.sendStatus(400);
        const userComment = yield getCachedResponse({ key: `singleComment:${commentId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const comment = yield getCommentById(commentId);
                return comment;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userComment)
            return responseType({ res, status: 404, message: 'comment not found' });
        responseType({ res, status: 200, count: 1, data: userComment });
    }));
};
// FOR ADMIN PAGE
export const userComments = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId } = req.params;
        if (!adminId || !userId)
            return res.sendStatus(400);
        if (!getUserById(adminId))
            return res.sendStatus(401);
        if (!getUserById(userId))
            return res.sendStatus(401);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const admin = yield getUserById(adminId);
        if (!admin.roles.includes(ROLES.ADMIN))
            return res.sendStatus(401);
        const userComments = yield getCachedResponse({ key: `userComments:${userId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const userComment = yield getUserComments(userId);
                return userComment;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(userComments === null || userComments === void 0 ? void 0 : userComments.length))
            return responseType({ res, status: 404, message: 'You have no comments' });
        return responseType({ res, status: 200, count: userComments === null || userComments === void 0 ? void 0 : userComments.length, data: userComments });
    }));
};
export const getUserCommentStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || storyId)
            return res.sendStatus(400);
        const commentsInStories = yield getCachedResponse({ key: 'allStories', cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const comments = yield getUserCommentsInStory(userId, storyId);
                return comments;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(commentsInStories === null || commentsInStories === void 0 ? void 0 : commentsInStories.length))
            return responseType({ res, status: 404, message: 'No comments available' });
        return responseType({ res, status: 200, count: commentsInStories === null || commentsInStories === void 0 ? void 0 : commentsInStories.length, data: commentsInStories });
    }));
};
///////////////////////////////////////////
export const getStoryComments = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { storyId } = req.query;
        if (!storyId)
            return res.sendStatus(400);
        const storyComments = yield getCachedResponse({ key: `storyComments:${storyId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const storyComment = yield getAllCommentsInStory(storyId);
                return storyComment;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(storyComments === null || storyComments === void 0 ? void 0 : storyComments.length))
            return responseType({ res, status: 404, message: 'No comments' });
        return responseType({ res, status: 200, count: storyComments === null || storyComments === void 0 ? void 0 : storyComments.length, data: storyComments });
    }));
};
export const like_Unlike_Comment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, commentId } = req.params;
        if (!userId || !commentId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield likeAndUnlikeComment(userId, commentId);
        responseType({ res, status: 201, message: result });
    }));
});
//# sourceMappingURL=commentController.js.map