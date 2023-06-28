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
import { createUserStory, deleteAllUserStories, deleteUserStory, getAllStories, getStoryById, getUserStories, likeAndUnlikeStory } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { StoryModel } from "../models/Story.js";
import { getAllSharedByCategories, getAllSharedStories } from "../helpers/sharedHelper.js";
import { getCachedResponse } from "../helpers/redis.js";
import { contentFeedAlgorithm } from "../../../client/src/utils/helperFunc.js";
;
export const createNewStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        let newStory = req.body;
        if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.title) || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        newStory = Object.assign(Object.assign({}, newStory), { userId, author: user === null || user === void 0 ? void 0 : user.username });
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
        yield StoryModel.findByIdAndUpdate({ userId, _id: storyId }, Object.assign(Object.assign({}, editedStory), { edited: true }))
            .then((data) => {
            return responseType({ res, status: 201, count: 1, data });
        })
            .catch((error) => {
            return responseType({ res, status: 404, message: 'Story not found' });
        });
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
            yield deleteUserStory(storyId);
            return res.sendStatus(204);
        }
        if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
            return res.sendStatus(401);
        yield deleteUserStory(storyId);
        return res.sendStatus(204);
    }));
};
// Delete user story by admin
export const deleteStoryByAdmin = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { adminId, userId, storyId } = req.params;
        if (!adminId || !userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'user not found' });
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return responseType({ res, status: 423, message: 'Account locked' });
        const story = yield getUserStories(userId);
        if (!story.length)
            return responseType({ res, status: 404, message: 'user does not have a story' });
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            yield deleteAllUserStories(userId);
            return responseType({ res, status: 201, message: 'All user stories deleted' });
        }
        return responseType({ res, status: 401, message: 'unauthorized' });
    }));
};
export const getStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { storyId } = req.params;
        if (!storyId)
            return res.sendStatus(400);
        const userStory = yield getCachedResponse({ key: `singleStory:${storyId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const story = yield getStoryById(storyId);
                return story;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userStory)
            return responseType({ res, status: 404, message: 'story not found' });
        responseType({ res, status: 200, count: 1, data: userStory });
    }));
};
// HANDLE GETTING A USER STORIES
export const getUserStory = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.sendStatus(404);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const userStories = yield getCachedResponse({ key: `userStory:${userId}`, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const userStory = yield getUserStories(userId);
                return userStory;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(userStories === null || userStories === void 0 ? void 0 : userStories.length))
            return responseType({ res, status: 404, message: 'You have no stories' });
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
                const sharedCategoryStory = yield getAllSharedByCategories(category);
                const reMoulded = sharedCategoryStory.map(share => {
                    const object = Object.assign(Object.assign({}, share.sharedStory), { sharedId: share === null || share === void 0 ? void 0 : share._id, sharedLikes: share === null || share === void 0 ? void 0 : share.sharedLikes, sharerId: share === null || share === void 0 ? void 0 : share.sharerId, sharedDate: share === null || share === void 0 ? void 0 : share.sharedDate });
                    return object;
                });
                const refactoredModel = [...categoryStory, ...reMoulded];
                const filteredFeed = () => {
                    return new Promise(resolve => {
                        resolve(contentFeedAlgorithm(refactoredModel));
                    });
                };
                return filteredFeed;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(storyCategory === null || storyCategory === void 0 ? void 0 : storyCategory.length))
            return responseType({ res, status: 404, message: 'You have no stories' });
        return responseType({ res, status: 200, count: storyCategory === null || storyCategory === void 0 ? void 0 : storyCategory.length, data: storyCategory });
    }));
};
export const getStories = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const allStories = yield getCachedResponse({ key: 'allStories', cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const stories = yield getAllStories();
                const sharedStories = yield getAllSharedStories();
                const reMoulded = sharedStories.map(share => {
                    const object = Object.assign(Object.assign({}, share.sharedStory), { sharedId: share === null || share === void 0 ? void 0 : share._id, sharedLikes: share === null || share === void 0 ? void 0 : share.sharedLikes, sharerId: share === null || share === void 0 ? void 0 : share.sharerId, sharedDate: share === null || share === void 0 ? void 0 : share.sharedDate });
                    return object;
                });
                const everyStories = [...stories, ...reMoulded];
                return everyStories;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!(allStories === null || allStories === void 0 ? void 0 : allStories.length))
            return responseType({ res, status: 404, message: 'No stories available' });
        return responseType({ res, status: 200, count: allStories === null || allStories === void 0 ? void 0 : allStories.length, data: allStories });
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
// async function runN(){
//   const sharedCategoryStory = await getAllSharedByCategories('Node')
//   console.log(sharedCategoryStory)
// }
// runN()
//# sourceMappingURL=storyController.js.map