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
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $push: { taskIds: newTask === null || newTask === void 0 ? void 0 : newTask._id } });
    return newTask;
});
export const updateTask = (task) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskManagerModel.findByIdAndUpdate({ _id: task === null || task === void 0 ? void 0 : task._id }, Object.assign(Object.assign({}, task), { edited: true })); });
export const deleteTask = (userId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield getTaskById(taskId);
    yield TaskManagerModel.findByIdAndDelete(taskId);
    yield UserModel.findByIdAndUpdate({ _id: userId }, { $pull: { taskIds: taskId } });
    yield TaskBinModel.findOneAndUpdate({ userId }, { $push: { taskBin: task } });
});
export const emptyTaskBin = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield TaskBinModel.findOneAndUpdate({ userId }, { $set: { taskBin: [] } }); });
//# sourceMappingURL=tasksHelper.js.map