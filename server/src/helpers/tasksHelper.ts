import { TaskProp } from "../../types.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { UserModel } from "../models/User.js";

export const getUserTasks = async(userId: string) => await TaskManagerModel.find({ userId }).lean()

export const getTaskById = async(taskId: string) => await TaskManagerModel.findById(taskId).exec()

export const getTaskInBin = async(userId: string) => await TaskBinModel.find({userId}).exec()

export const createNewTask = async(userId: string, task: TaskProp) => {
  const newTask = await TaskManagerModel.create({...task})
  const { _id } = newTask
  await UserModel.findByIdAndUpdate({_id: userId}, {$push: {taskIds: _id.toString()}})
  return newTask
}

export const updateTask = async(task: TaskProp) => await TaskManagerModel.findByIdAndUpdate({_id: task?._id}, {...task, edited: true})

export const deleteTask = async(userId: string, taskId: string) => {
  const task = await getTaskById(taskId)
  await UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: taskId}}).exec()
  await TaskBinModel.findOneAndUpdate({userId}, {$push: {taskBin: task}})
  await TaskManagerModel.findByIdAndDelete(taskId)
}

export const emptyTaskBin = async(userId: string) => {
  await TaskBinModel.findOneAndUpdate({userId}, {$set: { taskBin: [] }})
  await UserModel.findByIdAndUpdate({_id: userId}, {$set: { taskIds: [] }})
}

export const restoreTaskFromBin = async(taskIds: string[], userId: string) => {
  const taskBin = await TaskBinModel.findOne({userId}).exec()
  const tasksToRestore = taskBin[0]?.taskBin.map((task: TaskProp) => {
    const gottenTask = taskIds.map(id => id === task?._id.toString())
    return gottenTask
  }) as TaskProp[]
  // Restore back into task model
  await Promise.all(tasksToRestore.map(async(taskToRestore) => {
    const  {createdAt, updatedAt, ...rest } = taskToRestore
    await TaskManagerModel.create({...rest})
    await UserModel.findByIdAndUpdate({_id: userId}, {$push: {taskIds: rest?._id.toString()}})
  }))
  // save the modified taskbin without the restored tasks
  const otherTasks = taskBin[0]?.taskBin.map((task: TaskProp) => {
    const gottenTask = taskIds.map(id => id !== task?._id.toString())
    return gottenTask
  }) as TaskProp[]

  await taskBin.updateOne({$set: {taskBin: []}})
  await Promise.all(otherTasks.map(async(task) => {
    await taskBin.updateOne({$push: {taskBin: task}})
    await UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: task?._id.toString()}})
  }))
}

export const deletePermanentlyFromBin = async(taskIds: string[], userId: string) => {
  const taskBin = await TaskBinModel.findOne({userId}).exec()
  // save the modified taskbin without the restored tasks
  const otherTasks = taskBin[0]?.taskBin.map((task: TaskProp) => {
    const gottenTask = taskIds.map(id => id !== task?._id.toString())
    return gottenTask
  }) as TaskProp[]

  await taskBin.updateOne({$set: {taskBin: []}})
  await Promise.all(otherTasks.map(async(task) => {
    await taskBin.updateOne({$push: {taskBin: task}})
  }))
}
