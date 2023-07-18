var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { UserModel } from "../models/User.js";
export const getUserTasks = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskManagerModel.find({ userId }).lean(); });
export const getTaskById = (taskId) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskManagerModel.findById(taskId).exec(); });
export const getTaskInBin = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskBinModel.find({ userId }).exec(); });
export const createNewTask = (userId, task) => __awaiter(void 0, void 0, void 0, function* () {
    const newTask = yield TaskManagerModel.create(Object.assign({}, task));
    const { _id } = newTask;
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $push: { taskIds: _id.toString() } });
    return newTask;
});
export const updateTask = (task) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskManagerModel.findByIdAndUpdate({ _id: task === null || task === void 0 ? void 0 : task._id }, Object.assign(Object.assign({}, task), { edited: true })); });
export const deleteTask = (userId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield getTaskById(taskId);
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { taskIds: taskId } }).exec()
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield TaskBinModel.findOneAndUpdate({ userId }, { $push: { taskBin: task } });
        yield TaskManagerModel.findByIdAndDelete(taskId);
    }));
});
export const emptyTaskBin = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield TaskBinModel.findOneAndUpdate({ userId }, { $set: { taskBin: [] } })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield UserModel.findByIdAndUpdate({ _id: userId }, { $set: { taskIds: [] } });
    }));
});
export const restoreTaskFromBin = (taskIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const taskBin = yield TaskBinModel.findOne({ userId }).exec();
    const tasksToRestore = yield Promise.all(taskBin.taskBin.filter((task) => taskIds.includes(task === null || task === void 0 ? void 0 : task._id.toString())));
    // Restore back into task model
    yield Promise.all(tasksToRestore.map((taskToRestore) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, task, completed, updatedAt, createdAt } = taskToRestore;
        const restoreTask = { userId, task, completed, updatedAt, createdAt };
        yield createNewTask(userId, restoreTask);
    })));
    // save the modified taskbin without the restored tasks
    const otherTasks = yield Promise.all(taskBin.taskBin.filter((task) => !taskIds.includes(task === null || task === void 0 ? void 0 : task._id.toString())));
    yield taskBin.updateOne({ $set: { taskBin: [] } })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(otherTasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
            yield taskBin.updateOne({ $push: { taskBin: task } })
                .then(() => __awaiter(void 0, void 0, void 0, function* () {
                yield UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { taskIds: task === null || task === void 0 ? void 0 : task._id.toString() } });
            }));
        })));
    }));
});
export const deletePermanentlyFromBin = (taskIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const taskBin = yield TaskBinModel.findOne({ userId }).exec();
    // save the modified taskbin without the restored tasks
    const otherTasks = yield Promise.all(taskBin.taskBin.filter((task) => !taskIds.includes(task === null || task === void 0 ? void 0 : task._id.toString())));
    yield taskBin.updateOne({ $set: { taskBin: [] } })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(otherTasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
            yield taskBin.updateOne({ $push: { taskBin: task } });
        })));
    }));
});
//# sourceMappingURL=tasksHelper.js.map