import { TaskProp } from "../../types.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { UserModel } from "../models/User.js";

export const getUserTasks = async(userId: string) => await TaskManagerModel.find({ userId }).lean()
export const getTaskById = async(taskId: string) => await TaskManagerModel.findById(taskId).exec()
export const createNewTask = async(userId: string, task: TaskProp) => {
  const newTask = await TaskManagerModel.create({...task})
  await UserModel.findByIdAndUpdate(userId, {$push: {taskIds: newTask?._id}})
  return newTask
}
export const updateTask = async(task: TaskProp) => await TaskManagerModel.findByIdAndUpdate({_id: task?._id}, {...task})
export const deleteTask = async(userId: string, taskId: string) => {
  const task = await getTaskById(taskId)
  await TaskManagerModel.findByIdAndDelete(taskId)
  await UserModel.findByIdAndUpdate(userId, {$pull: {taskIds: taskId}})
  await TaskBinModel.findOneAndUpdate({userId}, {$push: {taskBin: task}})
}
export const emptyTaskBin = async(userId: string) => {
  await TaskBinModel.findByIdAndUpdate(userId, { taskBin: [] })
}
