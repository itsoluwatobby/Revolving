var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import userServiceInstance from "../services/userService.js";
import StoryServiceInstance from "../services/StoryService.js";
import commentServiceInstance from "../services/commentService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
;
class CommentsController {
    constructor() { }
    createNewComment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            let newComment = req.body;
            if (!userId || !storyId || !(newComment === null || newComment === void 0 ? void 0 : newComment.comment))
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            newComment = Object.assign(Object.assign({}, newComment), { author: user === null || user === void 0 ? void 0 : user.username });
            const story = yield StoryServiceInstance.getStoryById(storyId);
            if (!story)
                return responseType({ res, status: 404, message: 'Story not found' });
            commentServiceInstance.createComment(Object.assign({}, newComment))
                .then((comment) => responseType({ res, status: 201, count: 1, data: comment }))
                .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    updateComment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, commentId } = req.params;
            const editedComment = req.body;
            if (!userId || !commentId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            yield commentServiceInstance.editComment(userId, commentId, editedComment)
                .then((comment) => responseType({ res, status: 201, count: 1, data: comment }))
                .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    deleteComment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, commentId } = req.params;
            if (!userId || !commentId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            const comment = yield commentServiceInstance.getCommentById(commentId);
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                commentServiceInstance.deleteSingleComment(commentId)
                    .then(() => res.sendStatus(204))
                    .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
            }
            if ((comment === null || comment === void 0 ? void 0 : comment.userId.toString()) != (user === null || user === void 0 ? void 0 : user._id.toString()))
                return res.sendStatus(401);
            commentServiceInstance.deleteSingleComment(commentId)
                .then(() => res.sendStatus(204))
                .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    // ADMIN USER
    deleteUserComments(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId, commentId } = req.params;
            const option = req.query;
            if (!userId || !commentId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            const adminUser = yield userServiceInstance.getUserById(adminId);
            if (!user || !adminUser)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.isAccountLocked)
                return responseType({ res, status: 423, message: 'Account locked' });
            if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.roles.includes(ROLES.ADMIN)) {
                if ((option === null || option === void 0 ? void 0 : option.command) == 'onlyInStory') {
                    commentServiceInstance.deleteAllUserCommentsInStory(userId, option === null || option === void 0 ? void 0 : option.storyId)
                        .then(() => responseType({ res, status: 201, message: 'All user comments in story deleted' }))
                        .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
                }
                else if ((option === null || option === void 0 ? void 0 : option.command) == 'allUserComment') {
                    commentServiceInstance.deleteAllUserComments(userId)
                        .then(() => responseType({ res, status: 201, message: 'All user comments deleted' }))
                        .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
                }
            }
            else
                return responseType({ res, status: 401, message: 'unauthorized' });
        }));
    }
    getComment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { commentId } = req.params;
            if (!commentId)
                return res.sendStatus(400);
            getCachedResponse({ key: `singleComment:${commentId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const comment = yield commentServiceInstance.getCommentById(commentId);
                    return comment;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userComment) => {
                if (!userComment)
                    return responseType({ res, status: 404, message: 'comment not found' });
                return responseType({ res, status: 200, count: 1, data: userComment });
            }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    // FOR ADMIN PAGE
    userComments(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId } = req.params;
            if (!adminId || !userId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return res.sendStatus(404);
            yield autoDeleteOnExpire(userId);
            // if(user?.isAccountLocked) return res.sendStatus(401)
            const admin = yield userServiceInstance.getUserById(adminId);
            if (!admin.roles.includes(ROLES.ADMIN))
                return res.sendStatus(401);
            getCachedResponse({ key: `userComments:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const userComment = yield commentServiceInstance.getUserComments(userId);
                    return userComment;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userComments) => {
                if (!(userComments === null || userComments === void 0 ? void 0 : userComments.length))
                    return responseType({ res, status: 404, message: 'User have no comments' });
                return responseType({ res, status: 200, count: userComments === null || userComments === void 0 ? void 0 : userComments.length, data: userComments });
            }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    getUserCommentStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            getCachedResponse({ key: `userCommentsInStories:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const comments = yield commentServiceInstance.getUserCommentsInStory(userId, storyId);
                    return comments;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((commentsInStories) => {
                if (!(commentsInStories === null || commentsInStories === void 0 ? void 0 : commentsInStories.length))
                    return responseType({ res, status: 404, message: 'No comments by you' });
                return responseType({ res, status: 200, count: commentsInStories === null || commentsInStories === void 0 ? void 0 : commentsInStories.length, data: commentsInStories });
            }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    getStoryComments(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { storyId } = req.params;
            if (!storyId)
                return res.sendStatus(400);
            getCachedResponse({ key: `storyComments:${storyId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const storyComment = yield commentServiceInstance.getAllCommentsInStory(storyId);
                    return storyComment;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((storyComments) => {
                if (!(storyComments === null || storyComments === void 0 ? void 0 : storyComments.length))
                    return responseType({ res, status: 404, message: 'No comments' });
                return responseType({ res, status: 200, count: storyComments === null || storyComments === void 0 ? void 0 : storyComments.length, data: storyComments });
            }).catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
    like_Unlike_Comment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, commentId } = req.params;
            if (!userId || !commentId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
                return responseType({ res, status: 423, message: 'Account locked' });
            commentServiceInstance.likeAndUnlikeComment(userId, commentId)
                .then((result) => responseType({ res, status: 201, message: result }))
                .catch((error) => responseType({ res, status: 400, message: `${error.message}` }));
        }));
    }
}
export default new CommentsController;
//# sourceMappingURL=commentController.js.map