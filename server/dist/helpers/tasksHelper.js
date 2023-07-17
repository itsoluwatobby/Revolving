var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { taskIds: taskId } }).exec();
    yield TaskBinModel.findOneAndUpdate({ userId }, { $push: { taskBin: task } });
    yield TaskManagerModel.findByIdAndDelete(taskId);
});
export const emptyTaskBin = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield TaskBinModel.findOneAndUpdate({ userId }, { $set: { taskBin: [] } });
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $set: { taskIds: [] } });
});
export const restoreTaskFromBin = (taskIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const taskBin = yield TaskBinModel.findOne({ userId }).exec();
    const tasksToRestore = (_a = taskBin[0]) === null || _a === void 0 ? void 0 : _a.taskBin.map((task) => {
        const gottenTask = taskIds.map(id => id === (task === null || task === void 0 ? void 0 : task._id.toString()));
        return gottenTask;
    });
    // Restore back into task model
    yield Promise.all(tasksToRestore.map((taskToRestore) => __awaiter(void 0, void 0, void 0, function* () {
        const { createdAt, updatedAt } = taskToRestore, rest = __rest(taskToRestore, ["createdAt", "updatedAt"]);
        yield TaskManagerModel.create(Object.assign({}, rest));
        yield UserModel.findByIdAndUpdate({ _id: userId }, { $push: { taskIds: rest === null || rest === void 0 ? void 0 : rest._id.toString() } });
    })));
    // save the modified taskbin without the restored tasks
    const otherTasks = (_b = taskBin[0]) === null || _b === void 0 ? void 0 : _b.taskBin.map((task) => {
        const gottenTask = taskIds.map(id => id !== (task === null || task === void 0 ? void 0 : task._id.toString()));
        return gottenTask;
    });
    yield taskBin.updateOne({ $set: { taskBin: [] } });
    yield Promise.all(otherTasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
        yield taskBin.updateOne({ $push: { taskBin: task } });
        yield UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { taskIds: task === null || task === void 0 ? void 0 : task._id.toString() } });
    })));
});
export const deletePermanentlyFromBin = (taskIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const taskBin = yield TaskBinModel.findOne({ userId }).exec();
    // save the modified taskbin without the restored tasks
    const otherTasks = (_c = taskBin[0]) === null || _c === void 0 ? void 0 : _c.taskBin.map((task) => {
        const gottenTask = taskIds.map(id => id !== (task === null || task === void 0 ? void 0 : task._id.toString()));
        return gottenTask;
    });
    yield taskBin.updateOne({ $set: { taskBin: [] } });
    yield Promise.all(otherTasks.map((task) => __awaiter(void 0, void 0, void 0, function* () {
        yield taskBin.updateOne({ $push: { taskBin: task } });
    })));
});
//# sourceMappingURL=tasksHelper.js.map