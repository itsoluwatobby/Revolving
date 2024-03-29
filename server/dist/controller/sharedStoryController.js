var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserService } from "../services/userService.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";
import { SharedStoryService } from "../services/SharedStoryService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
class SharedStoryController {
    constructor() {
        this.userService = new UserService();
        this.sharedStoryService = new SharedStoryService();
        this.redisClientService = new KV_Redis_ClientService();
    }
    // Only for admin page
    /**
     * @description fetches all shared stories
    */
    fetchSharedStories(req, res) {
        asyncFunc(res, () => {
            this.redisClientService.getCachedResponse({ key: 'allSharedStoriesCache', cb: () => __awaiter(this, void 0, void 0, function* () {
                    const sharedStories = yield this.sharedStoryService.getAllSharedStories();
                    return sharedStories;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((allSharedStories) => {
                if (!(allSharedStories === null || allSharedStories === void 0 ? void 0 : allSharedStories.length))
                    return responseType({ res, status: 404, message: 'No shared stories available' });
                return responseType({ res, status: 200, count: allSharedStories === null || allSharedStories === void 0 ? void 0 : allSharedStories.length, data: allSharedStories });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    /**
     * @description fetches a single shared story
     * @param req - shared story id
    */
    getSingleShared(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { sharedId } = req.params;
            if (!sharedId)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `sharedStory:${sharedId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const shared = yield this.sharedStoryService.getSharedStoryById(sharedId);
                    return shared;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((sharedStory) => {
                if (!sharedStory)
                    return responseType({ res, status: 404, message: 'story not found' });
                return responseType({ res, status: 200, count: 1, data: sharedStory });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
     * @description shares a story
     * @param req - userId and story id
    */
    shareStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            this.sharedStoryService.createShareStory(user, storyId)
                .then((newShare) => responseType({ res, status: 201, count: 1, data: newShare }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
     * @description unshares a story
     * @param req - userId and shared story id
    */
    unShareUserStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, sharedId } = req.params;
            if (!userId || !sharedId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const result = yield this.sharedStoryService.unShareStory(userId, sharedId);
            this.redisClientService.redisClient.del(`sharedStory:${sharedId}`);
            return result == 'not found'
                ? responseType({ res, status: 404, count: 0, message: result }) : result == 'unauthorized'
                ? responseType({ res, status: 401, count: 0, message: result })
                : responseType({ res, status: 201, count: 1, message: 'story unshared' });
        }));
    }
    /**
     * @description fetches shared stories user
     * @param req - userId
    */
    getSharedStoriesByUser(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!userId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            this.redisClientService.getCachedResponse({ key: `userSharedStories:${userId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const sharedStory = yield this.sharedStoryService.getUserSharedStories(userId);
                    return sharedStory;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((sharedStories) => {
                if (!(sharedStories === null || sharedStories === void 0 ? void 0 : sharedStories.length))
                    return responseType({ res, status: 404, message: 'No shared stories available' });
                return responseType({ res, status: 200, count: sharedStories === null || sharedStories === void 0 ? void 0 : sharedStories.length, data: sharedStories });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
     * @description likes a shared story
     * @param req - userId and shared story id
    */
    like_Unlike_SharedStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, sharedId } = req.params;
            if (!userId || !sharedId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.sharedStoryService.likeAndUnlikeSharedStory(userId, sharedId)
                .then((result) => responseType({ res, status: 201, message: result }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new SharedStoryController();
//# sourceMappingURL=sharedStoryController.js.map