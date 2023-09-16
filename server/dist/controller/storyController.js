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
import { getUserById } from "../services/userService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { getAllSharedByCategories, getAllSharedStories } from "../services/SharedStoryService.js";
import { createUserStory, deleteAllUserStories, deleteUserStory, getAllStories, getStoriesWithUserIdInIt, getStoryById, getUserStories, likeAndUnlikeStory, updateUserStory } from "../services/StoryService.js";
;
/**
* @description creates a new user story
* @param req - userid
*/
export function createNewStory(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        let newStory = req.body;
        if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        newStory = Object.assign(Object.assign({}, newStory), { userId, author: user === null || user === void 0 ? void 0 : user.username });
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        createUserStory(Object.assign({}, newStory))
            .then((story) => responseType({ res, status: 201, count: 1, data: story }))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
/**
* @description updates user story
* @param req - userid and storyId
*/
export function updateStory(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        const editedStory = req.body;
        yield autoDeleteOnExpire(userId);
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        updateUserStory(storyId, editedStory)
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
export function deleteStory(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'You do not have an account' });
        yield autoDeleteOnExpire(userId);
        const story = yield getStoryById(storyId);
        if (!story)
            return responseType({ res, status: 404, message: 'story not found' });
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            deleteUserStory(storyId)
                .then(() => res.sendStatus(204))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }
        else if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
            return res.sendStatus(401);
        deleteUserStory(storyId)
            .then(() => res.sendStatus(204))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
// Delete user story by admin
/**
 * @description deletes a story by admin user
 * @param req - adminId, userId, storyId
*/
export function deleteStoryByAdmin(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { adminId, userId, storyId } = req.params;
        if (!adminId || !userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'user not found' });
        yield autoDeleteOnExpire(userId);
        const story = yield getUserStories(userId);
        if (!story.length)
            return responseType({ res, status: 404, message: 'user does not have a story' });
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            deleteAllUserStories(userId)
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
export function getStory(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { storyId } = req.params;
        if (!storyId)
            return res.sendStatus(400);
        getCachedResponse({ key: `singleStory:${storyId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                const story = yield getStoryById(storyId);
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
export function getUserStory(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        yield autoDeleteOnExpire(userId);
        if (!userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.sendStatus(404);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        getCachedResponse({ key: `userStory:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const userStory = yield getUserStories(userId);
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
export function getStoryByCategory(req, res) {
    asyncFunc(res, () => {
        const { category } = req.query;
        if (!category)
            return res.sendStatus(400);
        getCachedResponse({ key: `story:${category}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const categoryStory = yield StoryModel.find({ category: { $in: [category] } });
                const sharedCategoryStory = yield getAllSharedByCategories(category);
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
/**
* @description fetches all stories
*/
export function getStories(req, res) {
    asyncFunc(res, () => {
        getCachedResponse({ key: 'allStories', cb: () => __awaiter(this, void 0, void 0, function* () {
                const stories = yield getAllStories();
                const sharedStories = yield getAllSharedStories();
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
export function getStoriesWithUserId(req, res) {
    asyncFunc(res, () => {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        getCachedResponse({ key: `allStoriesWithUserId:${userId}`, cb: () => __awaiter(this, void 0, void 0, function* () {
                const stories = yield getStoriesWithUserIdInIt(userId);
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
export function like_Unlike_Story(req, res) {
    asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        yield autoDeleteOnExpire(userId);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        likeAndUnlikeStory(userId, storyId)
            .then((result) => responseType({ res, status: 201, message: result }))
            .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
    }));
}
/**
 * @description fetches users that likes a story
 * @param req - story id
*/
export const getStoryLikes = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { storyId } = req.params;
        if (!storyId)
            return res.sendStatus(400);
        const story = yield getStoryById(storyId);
        if (!story)
            return responseType({ res, status: 404, message: 'You do not have an account' });
        yield autoDeleteOnExpire(storyId);
        getCachedResponse({ key: `usersStoryLikes:${storyId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const users = yield Promise.all((_a = story === null || story === void 0 ? void 0 : story.likes) === null || _a === void 0 ? void 0 : _a.map((id) => __awaiter(void 0, void 0, void 0, function* () {
                    const { _id, email, firstName, lastName, followers, followings } = yield getUserById(id);
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
//# sourceMappingURL=storyController.js.map