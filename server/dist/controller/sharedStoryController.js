var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncFunc, responseType } from "../helpers/helper.js";
import { createShareStory, getAllSharedStories, getSharedStoryById, getUserSharedStories, likeAndUnlikeSharedStory, unShareStory } from "../helpers/sharedHelper.js";
import { getCachedResponse, redisClient } from "../helpers/redis.js";
import { getUserById } from "../helpers/userHelpers.js";
;
// SHARED STORIES ROUTE
export const getSharedStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { sharedId } = req.params;
        if (!sharedId)
            return res.sendStatus(400);
        const sharedStory = yield getCachedResponse({ key: `sharedStory:${sharedId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const shared = yield getSharedStoryById(sharedId);
                return shared;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!sharedStory)
            return responseType({ res, status: 404, message: 'story not found' });
        responseType({ res, status: 200, count: 1, data: sharedStory });
    }));
};
export const shareStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const newShare = yield createShareStory(userId, storyId);
        return responseType({ res, status: 201, count: 1, data: newShare });
    }));
};
export const unShareUserStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, sharedId } = req.params;
        if (!userId || !sharedId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield unShareStory(userId, sharedId);
        redisClient.DEL(`sharedStory:${sharedId}`);
        return result == 'not found'
            ? responseType({ res, status: 404, count: 0, message: result }) : result == 'unauthorized'
            ? responseType({ res, status: 401, count: 0, message: result })
            : responseType({ res, status: 201, count: 1, message: 'story unshared' });
    }));
};
export const getSharedStoriesByUser = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        const sharedStories = yield getCachedResponse({ key: `userSharedStories:${userId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const sharedStory = yield getUserSharedStories(userId);
                return sharedStory;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(sharedStories === null || sharedStories === void 0 ? void 0 : sharedStories.length))
            return responseType({ res, status: 404, message: 'No shared stories available' });
        return responseType({ res, status: 200, count: sharedStories === null || sharedStories === void 0 ? void 0 : sharedStories.length, data: sharedStories });
    }));
};
export const like_Unlike_SharedStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, sharedId } = req.params;
        if (!userId || !sharedId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield likeAndUnlikeSharedStory(userId, sharedId);
        responseType({ res, status: 201, message: result });
    }));
});
// Only for admin page
export const fetchSharedStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const allSharedStories = yield getCachedResponse({ key: 'allSharedStoriesCache', cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const sharedStories = yield getAllSharedStories();
                return sharedStories;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(allSharedStories === null || allSharedStories === void 0 ? void 0 : allSharedStories.length))
            return responseType({ res, status: 404, message: 'No shared stories available' });
        return responseType({ res, status: 200, count: allSharedStories === null || allSharedStories === void 0 ? void 0 : allSharedStories.length, data: allSharedStories });
    }));
};
//# sourceMappingURL=sharedStoryController.js.map