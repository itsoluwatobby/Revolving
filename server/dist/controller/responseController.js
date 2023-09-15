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
import { getUserById } from "../services/userService.js";
import { createResponse, deleteAllUserResponseInComment, deleteAllUserResponses, deleteSingleResponse, editResponse, getAllCommentsResponse, getCommentById, getResponseById, getUserResponses, likeAndUnlikeResponse } from "../services/commentService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
;
export function createNewResponse(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, commentId } = req.params;
        let newResponse = req.body;
        if (!userId || !commentId || !(newResponse === null || newResponse === void 0 ? void 0 : newResponse.response))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        newResponse = Object.assign(Object.assign({}, newResponse), { author: user === null || user === void 0 ? void 0 : user.username });
        const comment = yield getCommentById(commentId);
        if (!comment)
            return responseType({ res, status: 404, message: 'Comment not found' });
        // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
        createResponse(Object.assign({}, newResponse))
            .then((response) => responseType({ res, status: 201, count: 1, data: response }))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
export function updateResponse(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        const editedResponse = req.body;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
        const responseExist = yield getResponseById(responseId);
        if (!responseExist)
            return responseType({ res, status: 404, message: 'Response not found' });
        editResponse(userId, responseId, editedResponse)
            .then((response) => responseType({ res, status: 201, count: 1, data: response }))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
export function deleteResponse(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
        const response = yield getResponseById(responseId);
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            deleteSingleResponse(responseId)
                .then(() => res.sendStatus(204))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }
        if ((response === null || response === void 0 ? void 0 : response.userId.toString()) != (user === null || user === void 0 ? void 0 : user._id.toString()))
            return res.sendStatus(401);
        deleteSingleResponse(responseId)
            .then(() => res.sendStatus(204))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
// ADMIN USER
export function deleteUserResponses(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { adminId, userId, responseId } = req.params;
        const option = req.query;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const adminUser = yield getUserById(adminId);
        yield autoDeleteOnExpire(userId);
        if (!user || !adminUser)
            return responseType({ res, status: 404, message: 'You do not have an account' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.roles.includes(ROLES.ADMIN)) {
            if ((option === null || option === void 0 ? void 0 : option.command) == 'onlyInComment') {
                deleteAllUserResponseInComment(userId, option === null || option === void 0 ? void 0 : option.commentId)
                    .then(() => responseType({ res, status: 201, message: 'All user responses in comment deleted' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            else if ((option === null || option === void 0 ? void 0 : option.command) == 'allUserResponse') {
                deleteAllUserResponses(userId)
                    .then(() => responseType({ res, status: 201, message: 'All user responses deleted' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
        }
        else
            return responseType({ res, status: 401, message: 'unauthorized' });
    }));
}
export function getResponse(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { responseId } = req.params;
        if (!responseId)
            return res.sendStatus(400);
        getCachedResponse({ key: `singleResponse:${responseId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                const response = yield getResponseById(responseId);
                return response;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((userResponse) => {
            if (!userResponse)
                return responseType({ res, status: 404, message: 'response not found' });
            return responseType({ res, status: 200, count: 1, data: userResponse });
        }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
// FOR ADMIN PAGE
export function userResponses(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { adminId, userId, responseId } = req.params;
        if (!userId || !adminId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.sendStatus(404);
        yield autoDeleteOnExpire(userId);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const admin = yield getUserById(adminId);
        if (!admin.roles.includes(ROLES.ADMIN))
            return res.sendStatus(401);
        getCachedResponse({ key: `userResponses:${userId}/${responseId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const userResponse = yield getUserResponses(userId, responseId);
                return userResponse;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((userResponses) => {
            if (!(userResponses === null || userResponses === void 0 ? void 0 : userResponses.length))
                return responseType({ res, status: 404, message: 'User have no response' });
            return responseType({ res, status: 200, count: userResponses === null || userResponses === void 0 ? void 0 : userResponses.length, data: userResponses });
        }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
export function getResponseByComment(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { commentId } = req.params;
        if (!commentId)
            return res.sendStatus(400);
        getCachedResponse({ key: `responseInComment:${commentId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const responses = yield getAllCommentsResponse(commentId);
                return responses;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
            .then((responsesInStories) => {
            if (!(responsesInStories === null || responsesInStories === void 0 ? void 0 : responsesInStories.length))
                return responseType({ res, status: 404, message: 'No responses available' });
            return responseType({ res, status: 200, count: responsesInStories === null || responsesInStories === void 0 ? void 0 : responsesInStories.length, data: responsesInStories });
        }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
///////////////////////////////////////////
// getStoryComments = (req: RequestProp, res: Response) => {
//   asyncFunc(res, async() => {
//     const { storyId } = req.query
//     if(!storyId) return res.sendStatus(400);
//     const storyComments = await getCachedResponse({key:`storyComments:${storyId}`, cb: async() => {
//       const storyComment = await getAllCommentsInStory(storyId as string)
//       return storyComment
//     }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as (CommentProps[] | string)
//     if(!storyComments?.length) return responseType({res, status: 404, message: 'No comments'});
//     return responseType({res, status: 200, count: storyComments?.length, data: storyComments})
//   })
// }
export function like_Unlike_Response(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
        likeAndUnlikeResponse(userId, responseId)
            .then((result) => responseType({ res, status: 201, message: result }))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
//# sourceMappingURL=responseController.js.map