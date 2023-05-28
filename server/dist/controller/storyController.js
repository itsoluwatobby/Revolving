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
import { createUserStory, getAllStories, getStoryById, getUserStories, likeAndUnlikeStory } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { StoryModel } from "../models/Story.js";
import { createShareStory, getAllSharedStories, getSharedStoryById, getUserSharedStories, likeAndUnlikeSharedStory, unShareStory } from "../helpers/sharedHelper.js";
import { getCachedResponse } from "../helpers/redis.js";
;
export const createNewStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        let newStory = req.body;
        newStory = Object.assign(Object.assign({}, newStory), { userId });
        if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.title) || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const story = yield createUserStory(Object.assign({}, newStory));
        return responseType({ res, status: 201, count: 1, data: story });
    }));
};
export const updateStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        const editedStory = req.body;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const story = yield getStoryById(storyId);
        if (!story)
            return res.sendStatus(404);
        yield story.updateOne({ $set: Object.assign(Object.assign({}, editedStory), { edited: true }) });
        const edited = yield getStoryById(storyId);
        return responseType({ res, status: 201, count: 1, data: edited });
    }));
};
export const deleteStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const story = yield getStoryById(storyId);
        if (!story)
            return responseType({ res, status: 404, message: 'story not found' });
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            yield story.deleteOne();
            return res.sendStatus(204);
        }
        if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
            return res.sendStatus(401);
        yield story.deleteOne();
        return res.sendStatus(204);
    }));
};
export const getStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { storyId } = req.params;
        if (!storyId)
            return res.sendStatus(400);
        const userStory = yield getCachedResponse({ key: `singleStory:${storyId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const story = yield getStoryById(storyId);
                if (!story)
                    return responseType({ res, status: 404, message: 'story not found' });
                return story;
            }) });
        responseType({ res, status: 200, count: 1, data: userStory });
    }));
};
// HANDLE GETTING A USER STORIES
export const getUserStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        if (!getUserById(userId))
            return res.sendStatus(401);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const userStories = yield getCachedResponse({ key: `userStory:${userId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const userStory = yield getUserStories(userId);
                if (!(userStory === null || userStory === void 0 ? void 0 : userStory.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return userStory;
            }) });
        return responseType({ res, status: 200, count: userStories === null || userStories === void 0 ? void 0 : userStories.length, data: userStories });
    }));
};
export const getStoryByCategory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { category } = req.query;
        if (!category)
            return res.sendStatus(400);
        const storyCategory = yield getCachedResponse({ key: `story:${category}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const categoryStory = yield StoryModel.find({ category: { $in: [category] } });
                if (!(categoryStory === null || categoryStory === void 0 ? void 0 : categoryStory.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return categoryStory;
            }) });
        return responseType({ res, status: 200, count: storyCategory === null || storyCategory === void 0 ? void 0 : storyCategory.length, data: storyCategory });
    }));
};
export const getStories = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const allStories = yield getCachedResponse({ key: 'allStories', cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const stories = yield getAllStories();
                const sharedStories = yield getAllSharedStories();
                const everyStories = [...stories, ...sharedStories];
                if (!(everyStories === null || everyStories === void 0 ? void 0 : everyStories.length))
                    return 'empty';
                return everyStories;
            }) });
        return typeof allStories == 'string' ? responseType({ res, status: 404, message: 'No stories available' }) : responseType({ res, status: 200, count: allStories === null || allStories === void 0 ? void 0 : allStories.length, data: allStories });
    }));
};
export const like_Unlike_Story = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const result = yield likeAndUnlikeStory(userId, storyId);
        responseType({ res, status: 201, message: result });
    }));
});
// SHARED STORIES ROUTE
export const getSharedStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { sharedId } = req.params;
        if (!sharedId)
            return res.sendStatus(400);
        const sharedStory = yield getCachedResponse({ key: `sharedStory:${sharedId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const shared = yield getSharedStoryById(sharedId);
                if (!shared)
                    return responseType({ res, status: 404, message: 'story not found' });
                return shared;
            }) });
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
        return result == 'not found' ? responseType({ res, status: 404, count: 0, message: result }) : result == 'unauthorized' ? responseType({ res, status: 401, count: 0, message: result }) : responseType({ res, status: 201, count: 1, message: 'story unshared' });
    }));
};
export const getSharedStoriesByUser = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        const sharedStories = yield getCachedResponse({ key: `userSharedStories:${userId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const sharedStory = yield getUserSharedStories(userId);
                if (!(sharedStory === null || sharedStory === void 0 ? void 0 : sharedStory.length))
                    return responseType({ res, status: 404, message: 'No shared stories available' });
                return sharedStory;
            }) });
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
//# sourceMappingURL=storyController.js.map