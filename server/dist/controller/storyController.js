var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StoryModel } from "../models/Story.js";
import { ROLES } from "../config/allowedRoles.js";
import { getCachedResponse } from "../helpers/redis.js";
import userServiceInstance from "../services/userService.js";
import StoryServiceInstance from "../services/StoryService.js";
import SharedStoryServiceInstance from "../services/SharedStoryService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
;
class StoryController {
    createNewStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            let newStory = req.body;
            if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            newStory = Object.assign(Object.assign({}, newStory), { userId, author: user === null || user === void 0 ? void 0 : user.username });
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            StoryServiceInstance.createUserStory(Object.assign({}, newStory))
                .then((story) => responseType({ res, status: 201, count: 1, data: story }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    updateStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            const editedStory = req.body;
            yield autoDeleteOnExpire(userId);
            if (!userId || !storyId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            StoryServiceInstance.updateUserStory(storyId, editedStory)
                .then((updatedStory) => {
                if (!updatedStory)
                    return responseType({ res, status: 404, message: 'Story not found' });
                return responseType({ res, status: 201, count: 1, data: updatedStory });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    deleteStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            yield autoDeleteOnExpire(userId);
            const story = yield StoryServiceInstance.getStoryById(storyId);
            if (!story)
                return responseType({ res, status: 404, message: 'story not found' });
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                StoryServiceInstance.deleteUserStory(storyId)
                    .then(() => res.sendStatus(204))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            else if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
                return res.sendStatus(401);
            StoryServiceInstance.deleteUserStory(storyId)
                .then(() => res.sendStatus(204))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    // Delete user story by admin
    deleteStoryByAdmin(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId, storyId } = req.params;
            if (!adminId || !userId || !storyId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'user not found' });
            yield autoDeleteOnExpire(userId);
            const story = yield StoryServiceInstance.getUserStories(userId);
            if (!story.length)
                return responseType({ res, status: 404, message: 'user does not have a story' });
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                StoryServiceInstance.deleteAllUserStories(userId)
                    .then(() => responseType({ res, status: 201, message: 'All user stories deleted' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            return responseType({ res, status: 401, message: 'unauthorized' });
        }));
    }
    getStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { storyId } = req.params;
            if (!storyId)
                return res.sendStatus(400);
            getCachedResponse({ key: `singleStory:${storyId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const story = yield StoryServiceInstance.getStoryById(storyId);
                    return story;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userStory) => {
                if (!userStory)
                    return responseType({ res, status: 404, message: 'story not found' });
                return responseType({ res, status: 200, count: 1, data: userStory });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    // HANDLE GETTING A USER STORIES
    getUserStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            yield autoDeleteOnExpire(userId);
            if (!userId)
                return res.sendStatus(400);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return res.sendStatus(404);
            // if(user?.isAccountLocked) return res.sendStatus(401)
            getCachedResponse({ key: `userStory:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const userStory = yield StoryServiceInstance.getUserStories(userId);
                    return userStory;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userStories) => {
                if (!(userStories === null || userStories === void 0 ? void 0 : userStories.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return responseType({ res, status: 200, count: userStories === null || userStories === void 0 ? void 0 : userStories.length, data: userStories });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    getStoryByCategory(req, res) {
        asyncFunc(res, () => {
            const { category } = req.query;
            if (!category)
                return res.sendStatus(400);
            getCachedResponse({ key: `story:${category}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const categoryStory = yield StoryModel.find({ category: { $in: [category] } });
                    const sharedCategoryStory = yield SharedStoryServiceInstance.getAllSharedByCategories(category);
                    const reMouldedSharedStory = sharedCategoryStory.map(share => {
                        const storyObject = Object.assign(Object.assign({}, share.sharedStory), { sharedId: share === null || share === void 0 ? void 0 : share._id, sharedLikes: share === null || share === void 0 ? void 0 : share.sharedLikes, sharerId: share === null || share === void 0 ? void 0 : share.sharerId, sharedDate: share === null || share === void 0 ? void 0 : share.createdAt, sharedAuthor: share === null || share === void 0 ? void 0 : share.sharedAuthor });
                        return storyObject;
                    });
                    const refactoredModel = [...categoryStory, ...reMouldedSharedStory];
                    return refactoredModel;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((storyCategory) => {
                if (!(storyCategory === null || storyCategory === void 0 ? void 0 : storyCategory.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return responseType({ res, status: 200, count: storyCategory === null || storyCategory === void 0 ? void 0 : storyCategory.length, data: storyCategory });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    getStories(req, res) {
        asyncFunc(res, () => {
            getCachedResponse({ key: 'allStories', cb: () => __awaiter(this, void 0, void 0, function* () {
                    const stories = yield StoryServiceInstance.getAllStories();
                    const sharedStories = yield SharedStoryServiceInstance.getAllSharedStories();
                    const reMoulded = sharedStories.map(share => {
                        const object = Object.assign(Object.assign({}, share.sharedStory), { sharedId: share === null || share === void 0 ? void 0 : share._id, sharedLikes: share === null || share === void 0 ? void 0 : share.sharedLikes, sharerId: share === null || share === void 0 ? void 0 : share.sharerId, sharedDate: share === null || share === void 0 ? void 0 : share.createdAt });
                        return object;
                    });
                    const everyStories = [...stories, ...reMoulded];
                    return everyStories;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((allStories) => {
                if (!(allStories === null || allStories === void 0 ? void 0 : allStories.length))
                    return responseType({ res, status: 404, message: 'No stories available' });
                return responseType({ res, status: 200, count: allStories === null || allStories === void 0 ? void 0 : allStories.length, data: allStories });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    getStoriesWithUserId(req, res) {
        asyncFunc(res, () => {
            const { userId } = req.params;
            if (!userId)
                return res.sendStatus(400);
            getCachedResponse({ key: `allStoriesWithUserId:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const stories = yield StoryServiceInstance.getStoriesWithUserIdInIt(userId);
                    return stories;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((allStoriesWithUserId) => {
                if (!(allStoriesWithUserId === null || allStoriesWithUserId === void 0 ? void 0 : allStoriesWithUserId.length))
                    return responseType({ res, status: 404, message: 'No stories available' });
                return responseType({ res, status: 200, count: allStoriesWithUserId === null || allStoriesWithUserId === void 0 ? void 0 : allStoriesWithUserId.length, data: allStoriesWithUserId });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    like_Unlike_Story(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const user = yield userServiceInstance.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            StoryServiceInstance.likeAndUnlikeStory(userId, storyId)
                .then((result) => responseType({ res, status: 201, message: result }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new StoryController();
//# sourceMappingURL=storyController.js.map