var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
import { getUserById } from "../helpers/userHelpers.js";
import { createNewTask, deleteTask, emptyTaskBin, getTaskById, getTaskInBin, getUserTasks, updateTask } from "../helpers/tasksHelper.js";
import { getCachedResponse } from "../helpers/redis.js";
export const createTask = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const task = req.body;
        yield autoDeleteOnExpire(userId);
        if (!userId)
            return responseType({ res, status: 400, message: 'userId required' });
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        const newTask = yield createNewTask(userId, task);
        return responseType({ res, count: 1, data: newTask });
    }));
};
export const updateTasks = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const task = req.body;
        if (!task || !userId)
            return responseType({ res, status: 404, message: 'task or userId required' });
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 401, message: 'unauthorized' });
        const updatedTask = yield updateTask(task);
        return responseType({ res, status: 201, count: 1, data: updatedTask });
    }));
};
export const deleteUserTask = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, taskId } = req.params;
        if (!userId || !taskId)
            return responseType({ res, status: 400, message: 'userId or taskId required' });
        yield autoDeleteOnExpire(userId);
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        const task = yield getTaskById(taskId);
        if (!task)
            return responseType({ res, status: 404, message: 'task not found' });
        yield deleteTask(userId, taskId);
        return responseType({ res, status: 204, message: 'task deleted' });
    }));
};
export const emptyBin = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return responseType({ res, status: 400, message: 'userId required' });
        const user = yield getUserById(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        const task = yield getTaskInBin(userId);
        if (!task)
            return responseType({ res, status: 404, message: 'bin not found' });
        yield emptyTaskBin(userId);
        return responseType({ res, status: 201, message: 'task bin emptied' });
    }));
};
export const getUserTask = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return responseType({ res, status: 400, message: 'userId required' });
        const user = yield getUserById(userId);
        yield autoDeleteOnExpire(userId);
        if (!user)
            return responseType({ res, status: 403, message: 'You do not have an account' });
        const userTasks = yield getCachedResponse({ key: `tasks:${userId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const tasks = yield getUserTasks(userId);
                return tasks;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userTasks.length)
            return responseType({ res, status: 404, message: 'no tasks found' });
        return responseType({ res, count: userTasks === null || userTasks === void 0 ? void 0 : userTasks.length, data: userTasks });
    }));
};
export const getTask = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { taskId } = req.params;
        if (!taskId)
            return responseType({ res, status: 400, message: 'taskId required' });
        const userTask = yield getCachedResponse({ key: `singleTask:${taskId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const task = yield getTaskById(taskId);
                return task;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userTask)
            return responseType({ res, status: 404, message: 'task not found' });
        return responseType({ res, count: 1, data: userTask });
    }));
};
export const getTasksInBin = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        if (!userId)
            return responseType({ res, status: 400, message: 'userId required' });
        const userTask = yield getCachedResponse({ key: `taskInBin:${userId}`, timeTaken: 1800, cb: () => __awaiter(void 0, void 0, void 0, function* () {
                const task = yield getTaskInBin(userId);
                return task;
            }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] });
        if (!userTask)
            return responseType({ res, status: 404, message: 'task not found' });
        return responseType({ res, count: 1, data: userTask });
    }));
};
//# sourceMappingURL=taskManagerController.js.map