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
import { createUserStory, getAllStories, getStoryById, getUserStories } from "../helpers/storyHelpers.js";
import { ROLES } from "../config/allowedRoles.js";
;
export const createNewStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const newStory = req.body;
        if (!userId || !(newStory === null || newStory === void 0 ? void 0 : newStory.title) || !(newStory === null || newStory === void 0 ? void 0 : newStory.body))
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.status(401).json('You do not have an account');
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return res.sendStatus(401);
        const story = yield createUserStory(Object.assign(Object.assign({}, newStory), { userId }));
        return res.status(200).json(story);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
export const updateStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, storyId } = req.params;
        const editedStory = req.body;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.status(403).json('You do not have an account');
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return res.sendStatus(401);
        const story = yield getStoryById(storyId);
        if (!story)
            return res.sendStatus(404);
        yield story.updateOne({ $set: Object.assign(Object.assign({}, editedStory), { edited: true }) });
        const edited = yield getStoryById(storyId);
        return res.status(200).json(edited);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
export const deleteStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, storyId } = req.params;
        if (!userId || !storyId)
            return res.sendStatus(400);
        const user = yield getUserById(userId);
        if (!user)
            return res.status(401).json('You do not have an account');
        if (user === null || user === void 0 ? void 0 : user.isAccountLocked)
            return res.sendStatus(401);
        const story = yield getStoryById(storyId);
        if (!story)
            return res.status(404).json('story not found');
        if (user === null || user === void 0 ? void 0 : user.roles.includes(ROLES.ADMIN)) {
            yield story.deleteOne();
            return res.sendStatus(204);
        }
        if (!(story === null || story === void 0 ? void 0 : story.userId.equals(user === null || user === void 0 ? void 0 : user._id)))
            return res.sendStatus(401);
        yield story.deleteOne();
        return res.sendStatus(204);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
export const getStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { storyId } = req.params;
        if (!storyId)
            return res.sendStatus(400);
        const userStory = yield getStoryById(storyId);
        if (!userStory)
            return res.status(404).json('story not found');
        return res.status(200).json(userStory);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
export const getUserStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.sendStatus(400);
        if (!getUserById(userId))
            return res.sendStatus(401);
        // if(user?.isAccountLocked) return res.sendStatus(401)
        const userStories = yield getUserStories(userId);
        if (!(userStories === null || userStories === void 0 ? void 0 : userStories.length))
            return res.status(404).json('You have no story');
        return res.status(200).json(userStories);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
export const getStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stories = yield getAllStories();
        if (!(stories === null || stories === void 0 ? void 0 : stories.length))
            return res.status(404).json('No stories available');
        return res.status(200).json(stories);
    }
    catch (error) {
        return res.sendStatus(500);
    }
});
//# sourceMappingURL=storyController.js.map