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
import { RedisClientService } from "../helpers/redis.js";
import { UserService } from "../services/userService.js";
import { StoryService } from "../services/StoryService.js";
import NotificationController from "./notificationController.js";
import { SharedStoryService } from "../services/SharedStoryService.js";
import { asyncFunc, autoDeleteOnExpire, pagination, responseType } from "../helpers/helper.js";
class StoryController {
    constructor() {
        this.userService = new UserService();
        this.storyService = new StoryService();
        this.sharedStoryService = new SharedStoryService();
        this.redisClientService = new RedisClientService();
        /**
         * @description fetches users that likes a story
         * @param req - story id
        */
        this.getStoryLikes = (req, res) => {
            asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
                const { storyId } = req.params;
                if (!storyId)
                    return res.sendStatus(400);
                const story = yield this.storyService.getStoryById(storyId);
                if (!story)
                    return responseType({ res, status: 404, message: 'You do not have an account' });
                yield autoDeleteOnExpire(storyId);
                this.redisClientService.getCachedResponse({ key: `usersStoryLikes:${storyId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const users = yield Promise.all((_a = story === null || story === void 0 ? void 0 : story.likes) === null || _a === void 0 ? void 0 : _a.map((id) => __awaiter(this, void 0, void 0, function* () {
                            const { _id, email, firstName, lastName, followers, followings } = yield this.userService.getUserById(id);
                            return { _id, email, firstName, lastName, followers, followings };
                        })));
                        return users;
                    }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                    .then((allUsers) => {
                    if (!(allUsers === null || allUsers === void 0 ? void 0 : allUsers.length))
                        return responseType({ res, status: 404, message: 'You have no likes' });
                    return responseType({ res, status: 200, message: 'success', count: allUsers === null || allUsers === void 0 ? void 0 : allUsers.length, data: allUsers });
                }).catch((error) => responseType({ res, status: 400, message: error === null || error === void 0 ? void 0 : error.message }));
            }));
        };
    }
    /**
    * @description creates a new user story
    * @param req - userid
    */
    createNewStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            let newStory = req.body;
            if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            newStory = Object.assign(Object.assign({}, newStory), { userId, author: user === null || user === void 0 ? void 0 : user.username });
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            this.storyService.createUserStory(Object.assign({}, newStory))
                .then((story) => __awaiter(this, void 0, void 0, function* () {
                const { _id, title, body, picture, category, commentIds, likes, author } = story;
                const notiStory = {
                    _id, title, body: body === null || body === void 0 ? void 0 : body.slice(0, 40), picture: picture[0],
                    category, commentIds, likes, author
                };
                yield NotificationController.addToNotification(userId, notiStory, 'NewStory');
                return responseType({ res, status: 201, count: 1, data: story });
            }))
                .catch((error) => responseType({ res, status: 404, message: `DB ERROR: ${error.message}` }));
        }));
    }
    /**
    * @description updates user story
    * @param req - userid and storyId
   */
    updateStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            const editedStory = req.body;
            if (!userId || !storyId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.storyService.updateUserStory(storyId, editedStory)
                .then((updatedStory) => {
                if (!updatedStory)
                    return responseType({ res, status: 404, message: 'Story not found' });
                return responseType({ res, status: 201, count: 1, data: updatedStory });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
     * @description deletes story by user
     * @param req - userid
    */
    deleteStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'You do not have an account' });
            yield autoDeleteOnExpire(userId);
            const story = yield this.storyService.getStoryById(storyId);
            if (!story)
                return responseType({ res, status: 404, message: 'story not found' });
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                this.storyService.deleteUserStory(storyId)
                    .then(() => res.sendStatus(204))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            else if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
                return res.sendStatus(401);
            this.storyService.deleteUserStory(storyId)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const { _id, title, body, picture, category, commentIds, likes, author } = story;
                const notiStory = {
                    _id, title, body: body === null || body === void 0 ? void 0 : body.slice(0, 40), picture: picture[0],
                    category, commentIds, likes, author
                };
                yield NotificationController.removeSingleNotification(userId, notiStory, 'NewStory');
                return res.sendStatus(204);
            }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    // Delete user story by admin
    /**
     * @description deletes a story by admin user
     * @param req - adminId, userId, storyId
    */
    deleteStoryByAdmin(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { adminId, userId, storyId } = req.params;
            if (!adminId || !userId || !storyId)
                return res.sendStatus(400);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'user not found' });
            yield autoDeleteOnExpire(userId);
            const story = yield this.storyService.getUserStories(userId);
            if (!story.length)
                return responseType({ res, status: 404, message: 'user does not have a story' });
            if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
                this.storyService.deleteAllUserStories(userId)
                    .then(() => responseType({ res, status: 201, message: 'All user stories deleted' }))
                    .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
            }
            return responseType({ res, status: 401, message: 'unauthorized' });
        }));
    }
    /**
    * @description fetches a single story
    * @param req - storyid
    */
    getStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { storyId } = req.params;
            if (!storyId)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `singleStory:${storyId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const story = yield this.storyService.getStoryById(storyId);
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
    /**
    * @description fetches all user stories
    * @param req - userid
   */
    getUserStory(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!userId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return res.sendStatus(404);
            // if(user?.isAccountLocked) return res.sendStatus(401)
            this.redisClientService.getCachedResponse({ key: `userStory:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const userStory = yield this.storyService.getUserStories(userId);
                    return userStory;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userStories) => {
                if (!(userStories === null || userStories === void 0 ? void 0 : userStories.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return responseType({ res, status: 200, count: userStories === null || userStories === void 0 ? void 0 : userStories.length, data: userStories });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
    * @description fetches all stories by category
    * @param req - category
   */
    getStoryByCategory(req, res) {
        asyncFunc(res, () => {
            const { category, page, limit } = req.query;
            if (!category)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `story:${category}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const categoryStory = yield StoryModel.find({ category: { $in: [category] } });
                    const sharedCategoryStory = yield this.sharedStoryService.getAllSharedByCategories(category);
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
    get_test_Story_By_Category(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { category, page, limit } = req.query;
            if (!category)
                return res.sendStatus(400);
            const pageNum = Number(page), limitNum = Number(limit);
            pagination({ page: pageNum, limit: limitNum, Models: StoryModel, callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.redisClientService.getCachedResponse({ key: `story:${category}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                            const categoryStory = yield StoryModel.find({ category: { $in: [category] } });
                            const sharedCategoryStory = yield this.sharedStoryService.getAllSharedByCategories(category);
                            const reMouldedSharedStory = sharedCategoryStory.map(share => {
                                const storyObject = Object.assign(Object.assign({}, share.sharedStory), { sharedId: share === null || share === void 0 ? void 0 : share._id, sharedLikes: share === null || share === void 0 ? void 0 : share.sharedLikes, sharerId: share === null || share === void 0 ? void 0 : share.sharerId, sharedDate: share === null || share === void 0 ? void 0 : share.createdAt, sharedAuthor: share === null || share === void 0 ? void 0 : share.sharedAuthor });
                                return storyObject;
                            });
                            const refactoredModel = [...categoryStory, ...reMouldedSharedStory];
                            return refactoredModel;
                        }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
                }), query: 'hello' })
                .then((result) => {
                var _a;
                if (!((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.length))
                    return responseType({ res, status: 404, message: 'You have no stories' });
                return responseType({ res, status: 200, pages: result === null || result === void 0 ? void 0 : result.pageable, data: result === null || result === void 0 ? void 0 : result.data });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    /**
    * @description fetches all stories
    */
    getStories(req, res) {
        asyncFunc(res, () => {
            this.redisClientService.getCachedResponse({ key: 'allStories', cb: () => __awaiter(this, void 0, void 0, function* () {
                    const stories = yield this.storyService.getAllStories();
                    const sharedStories = yield this.sharedStoryService.getAllSharedStories();
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
    /**
     * @description fetches all stories with userid in it
     * @param req - userid
    */
    getStoriesWithUserId(req, res) {
        asyncFunc(res, () => {
            const { userId } = req.params;
            if (!userId)
                return res.sendStatus(400);
            this.redisClientService.getCachedResponse({ key: `allStoriesWithUserId:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const stories = yield this.storyService.getStoriesWithUserIdInIt(userId);
                    return stories;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((allStoriesWithUserId) => {
                if (!(allStoriesWithUserId === null || allStoriesWithUserId === void 0 ? void 0 : allStoriesWithUserId.length))
                    return responseType({ res, status: 404, message: 'No stories available' });
                return responseType({ res, status: 200, count: allStoriesWithUserId === null || allStoriesWithUserId === void 0 ? void 0 : allStoriesWithUserId.length, data: allStoriesWithUserId });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    /**
     * @description likes or unlikes a story
     * @param req - story id and userId
    */
    like_Unlike_Story(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, storyId } = req.params;
            if (!userId || !storyId)
                return res.sendStatus(400);
            yield autoDeleteOnExpire(userId);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.storyService.likeAndUnlikeStory(userId, storyId)
                .then((result) => responseType({ res, status: 201, message: result }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new StoryController();
//# sourceMappingURL=storyController.js.map