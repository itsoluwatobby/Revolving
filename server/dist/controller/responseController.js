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
import { createResponse, deleteAllUserResponseInComment, deleteAllUserResponses, deleteSingleResponse, editResponse, getAllCommentsResponse, getResponseById, getUserResponses, likeAndUnlikeResponse } from "../helpers/commentHelper.js";
;
export const createNewResponse = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, commentId } = req.params;
        const newResponse = req.body;
        if (!userId || !commentId || !(newResponse === null || newResponse === void 0 ? void 0 : newResponse.response))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const response = yield createResponse(Object.assign({}, newResponse));
        return responseType({ res, status: 201, count: 1, data: response });
    }));
};
export const updateResponse = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        const editedResponse = req.body;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const response = yield editResponse(userId, responseId, editedResponse);
        return responseType({ res, status: 201, count: 1, data: response });
    }));
};
export const deleteResponse = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const response = yield getResponseById(responseId);
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            yield deleteSingleResponse(responseId);
            return res.sendStatus(204);
        }
        if ((response === null || response === void 0 ? void 0 : response.userId.toString()) != (user === null || user === void 0 ? void 0 : user._id.toString()))
            return res.sendStatus(401);
        yield deleteSingleResponse(responseId);
        return res.sendStatus(204);
    }));
};
// ADMIN USER
export const deleteUserResponses = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId, responseId } = req.params;
        const { option } = req.query;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        const adminUser = yield getUserById(adminId);
        if (!user || !adminUser)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.roles.includes(ROLES.ADMIN)) {
            if ((option === null || option === void 0 ? void 0 : option.command) == 'onlyInComment') {
                yield deleteAllUserResponseInComment(userId, option === null || option === void 0 ? void 0 : option.commentId);
                return responseType({ res, status: 201, message: 'All user responses in comment deleted' });
            }
            else if ((option === null || option === void 0 ? void 0 : option.command) == 'allUserResponse') {
                yield deleteAllUserResponses(userId);
                return responseType({ res, status: 201, message: 'All user responses in comment deleted' });
            }
        }
        return responseType({ res, status: 401, message: 'unauthorized' });
    }));
};
export const getResponse = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { responseId } = req.params;
        if (!responseId)
            return res.sendStatus(400);
        const userResponse = yield getCachedResponse({ key: `singleResponse:${responseId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield getResponseById(responseId);
                return response;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userResponse)
            return responseType({ res, status: 404, message: 'response not found' });
        responseType({ res, status: 200, count: 1, data: userResponse });
    }));
};
// FOR ADMIN PAGE
export const userResponses = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId, responseId } = req.params;
        if (!userId || !adminId || !responseId)
            return res.sendStatus(400);
        if (!getUserById(adminId))
            return res.sendStatus(401);
        if (!getUserById(userId))
            return res.sendStatus(401);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const admin = yield getUserById(adminId);
        if (!admin.roles.includes(ROLES.ADMIN))
            return res.sendStatus(401);
        const userResponses = yield getCachedResponse({ key: `userResponses:${userId}/${responseId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const userResponse = yield getUserResponses(userId, responseId);
                return userResponse;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(userResponses === null || userResponses === void 0 ? void 0 : userResponses.length))
            return responseType({ res, status: 404, message: 'You have no response' });
        return responseType({ res, status: 200, count: userResponses === null || userResponses === void 0 ? void 0 : userResponses.length, data: userResponses });
    }));
};
export const getResponseByComment = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { commentId } = req.params;
        if (!commentId)
            return res.sendStatus(400);
        const responsesInStories = yield getCachedResponse({ key: 'allStories', cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const responses = yield getAllCommentsResponse(commentId);
                return responses;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(responsesInStories === null || responsesInStories === void 0 ? void 0 : responsesInStories.length))
            return responseType({ res, status: 404, message: 'No responses available' });
        return responseType({ res, status: 200, count: responsesInStories === null || responsesInStories === void 0 ? void 0 : responsesInStories.length, data: responsesInStories });
    }));
};
///////////////////////////////////////////
// export const getStoryComments = (req: RequestProp, res: Response) => {
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
export const like_Unlike_Response = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, responseId } = req.params;
        if (!userId || !responseId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield likeAndUnlikeResponse(userId, responseId);
        responseType({ res, status: 201, message: result });
    }));
});
//# sourceMappingURL=responseController.js.map