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
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { UserService } from "../services/userService.js";
import { CommentService } from "../services/commentService.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";
class ResponseController {
    constructor() {
        this.userService = new UserService();
        this.responseService = new CommentService();
        this.redisClientService = new KV_Redis_ClientService();
    }
    createNewResponse(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, commentId } = req.params;
            let newResponse = req.body;
            if (!userId || !commentId || !(newResponse === null || newResponse === void 0 ? void 0 : newResponse.response))
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            newResponse = Object.assign(Object.assign({}, newResponse), { author: user === null || user === void 0 ? void 0 : user.username });
            const comment = yield this.responseService.getCommentById(commentId);
            if (!comment)
                return responseType({ res, status: 404, message: 'Comment not found' });
            // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
            this.responseService.createResponse(Object.assign({}, newResponse))
                .then((response) => responseType({ res, status: 201, count: 1, data: response }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    updateResponse(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, responseId } = req.params;
            const editedResponse = req.body;
            if (!userId || !responseId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
            const responseExist = yield this.responseService.getResponseById(responseId);
            if (!responseExist)
                return responseType({ res, status: 404, message: 'Response not found' });
            this.responseService.editResponse(userId, responseId, editedResponse)
                .then((response) => responseType({ res, status: 201, count: 1, data: response }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    deleteResponse(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, responseId } = req.params;
            if (!userId || !responseId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
            const response = yield this.responseService.getResponseById(responseId);
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                this.responseService.deleteSingleResponse(responseId)
                    .then(() => res.sendStatus(204))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            if ((response === null || response === void 0 ? void 0 : response.userId.toString()) != (user === null || user === void 0 ? void 0 : user._id.toString()))
                return res.sendStatus(401);
            this.responseService.deleteSingleResponse(responseId)
                .then(() => res.sendStatus(204))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    // ADMIN USER
    deleteUserResponses(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId, responseId } = req.params;
            const option = req.query;
            if (!userId || !responseId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            const adminUser = yield this.userService.getUserById(adminId);
            yield autoDeleteOnExpire(userId);
            if (!user || !adminUser)
                return responseType({ res, status: 404, message: 'You do not have an account' });
            if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.isAccountLocked)
                return responseType({ res, status: 423, message: 'Account locked' });
            if (adminUser === null || adminUser === void 0 ? void 0 : adminUser.roles.includes(ROLES.ADMIN)) {
                if ((option === null || option === void 0 ? void 0 : option.command) == 'onlyInComment') {
                    this.responseService.deleteAllUserResponseInComment(userId, option === null || option === void 0 ? void 0 : option.commentId)
                        .then(() => responseType({ res, status: 201, message: 'All user responses in comment deleted' }))
                        .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
                }
                else if ((option === null || option === void 0 ? void 0 : option.command) == 'allUserResponse') {
                    this.responseService.deleteAllUserResponses(userId)
                        .then(() => responseType({ res, status: 201, message: 'All user responses deleted' }))
                        .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
                }
            }
            else
                return responseType({ res, status: 401, message: 'unauthorized' });
        }));
    }
    getResponse(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { responseId } = req.params;
            if (!responseId)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `singleResponse:${responseId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield this.responseService.getResponseById(responseId);
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
    userResponses(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId, responseId } = req.params;
            if (!userId || !adminId || !responseId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return res.sendStatus(404);
            yield autoDeleteOnExpire(userId);
            // if(user?.isAccountLocked) return res.sendStatus(401)
            const admin = yield this.userService.getUserById(adminId);
            if (!admin.roles.includes(ROLES.ADMIN))
                return res.sendStatus(401);
            this.redisClientService.getCachedResponse({ key: `userResponses:${userId}/${responseId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const userResponse = yield this.responseService.getUserResponses(userId, responseId);
                    return userResponse;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userResponses) => {
                if (!(userResponses === null || userResponses === void 0 ? void 0 : userResponses.length))
                    return responseType({ res, status: 404, message: 'User have no response' });
                return responseType({ res, status: 200, count: userResponses === null || userResponses === void 0 ? void 0 : userResponses.length, data: userResponses });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    getResponseByComment(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { commentId } = req.params;
            if (!commentId)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `responseInComment:${commentId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const responses = yield this.responseService.getAllCommentsResponse(commentId);
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
    like_Unlike_Response(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, responseId } = req.params;
            if (!userId || !responseId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            // if(user?.isAccountLocked) return responseType({res, status: 423, message: 'Account locked'});
            this.responseService.likeAndUnlikeResponse(userId, responseId)
                .then((result) => responseType({ res, status: 201, message: result }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new ResponseController();
//# sourceMappingURL=responseController.js.map