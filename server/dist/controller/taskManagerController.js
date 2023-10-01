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
import { RedisClientService } from "../helpers/redis.js";
import { TaskManagerService } from "../services/TaskManagerService.js";
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js";
class TaskManagerController {
    constructor() {
        this.userService = new UserService();
        this.taskManagerService = new TaskManagerService();
        this.redisClientService = new RedisClientService();
    }
    createTask(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const task = req.body;
            yield autoDeleteOnExpire(userId);
            if (!userId)
                return responseType({ res, status: 400, message: 'userId required' });
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            if (userId !== (task === null || task === void 0 ? void 0 : task.userId.toString()))
                return responseType({ res, status: 403, message: 'Not you resource' });
            this.taskManagerService.createNewTask(userId, task)
                .then((newTask) => responseType({ res, count: 1, data: newTask }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    updateTasks(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const task = req.body;
            if (!task || !userId)
                return responseType({ res, status: 404, message: 'task or userId required' });
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 401, message: 'unauthorized' });
            if (userId !== (task === null || task === void 0 ? void 0 : task.userId.toString()))
                return responseType({ res, status: 403, message: 'Not you resource' });
            this.taskManagerService.updateTask(task)
                .then((updatedTask) => responseType({ res, status: 201, count: 1, data: updatedTask }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    deleteUserTask(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId, taskId } = req.params;
            if (!userId || !taskId)
                return responseType({ res, status: 400, message: 'userId or taskId required' });
            yield autoDeleteOnExpire(userId);
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            const task = yield this.taskManagerService.getTaskById(taskId);
            if (!task)
                return responseType({ res, status: 404, message: 'task not found' });
            if (userId !== (task === null || task === void 0 ? void 0 : task.userId.toString()))
                return responseType({ res, status: 403, message: 'Not you resource' });
            this.taskManagerService.deleteTask(userId, taskId)
                .then(() => responseType({ res, status: 204, message: 'task deleted' }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    emptyBin(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!userId)
                return responseType({ res, status: 400, message: 'userId required' });
            const user = yield this.userService.getUserById(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            const task = yield this.taskManagerService.getTaskInBin(userId);
            if (!task)
                return responseType({ res, status: 404, message: 'bin not found' });
            this.taskManagerService.emptyTaskBin(userId)
                .then(() => responseType({ res, status: 201, message: 'task bin emptied' }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    getUserTask(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!userId)
                return responseType({ res, status: 400, message: 'userId required' });
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.redisClientService.getCachedResponse({ key: `tasks:${userId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const tasks = yield this.taskManagerService.getUserTasks(userId);
                    return tasks;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userTasks) => {
                if (!userTasks.length)
                    return responseType({ res, status: 404, message: 'no tasks found' });
                return responseType({ res, count: userTasks === null || userTasks === void 0 ? void 0 : userTasks.length, data: userTasks });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    getTask(req, res) {
        asyncFunc(res, () => {
            const { taskId } = req.params;
            if (!taskId)
                return responseType({ res, status: 400, message: 'taskId required' });
            this.redisClientService.getCachedResponse({ key: `singleTask:${taskId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const task = yield this.taskManagerService.getTaskById(taskId);
                    return task;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userTask) => {
                if (!userTask)
                    return responseType({ res, status: 404, message: 'task not found' });
                return responseType({ res, count: 1, data: userTask });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    getTasksInBin(req, res) {
        asyncFunc(res, () => {
            const { userId } = req.params;
            if (!userId)
                return responseType({ res, status: 400, message: 'userId required' });
            this.redisClientService.getCachedResponse({ key: `taskInBin:${userId}`, timeTaken: 1800, cb: () => __awaiter(this, void 0, void 0, function* () {
                    const task = yield this.taskManagerService.getTaskInBin(userId);
                    return task;
                }), reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
                .then((userTask) => {
                var _a, _b;
                if (!userTask)
                    return responseType({ res, status: 404, message: 'task not found' });
                const binLength = (_b = (_a = userTask[0]) === null || _a === void 0 ? void 0 : _a.taskBin) === null || _b === void 0 ? void 0 : _b.length;
                return responseType({ res, count: binLength, data: userTask });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        });
    }
    restoreTasks(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { taskIds } = req.body;
            if (!Array.isArray(taskIds) || !taskIds.length || !userId)
                return responseType({ res, status: 400, message: 'all inputs are required in right format' });
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.taskManagerService.restoreTaskFromBin(taskIds, userId)
                .then(() => responseType({ res, status: 201, message: 'Tasks restored' }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    deletePermanently(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { taskIds } = req.body;
            if (!Array.isArray(taskIds) || !taskIds.length || !userId)
                return responseType({ res, status: 400, message: 'all inputs are required in right format' });
            const user = yield this.userService.getUserById(userId);
            yield autoDeleteOnExpire(userId);
            if (!user)
                return responseType({ res, status: 403, message: 'You do not have an account' });
            this.taskManagerService.deletePermanentlyFromBin(taskIds, userId)
                .then(() => responseType({ res, status: 204, message: 'Tasks deleted permanently' }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new TaskManagerController();
//# sourceMappingURL=taskManagerController.js.map