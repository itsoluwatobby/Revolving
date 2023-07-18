import { TaskProp } from "../../types.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { UserModel } from "../models/User.js";

export const getUserTasks = async(userId: string) => await TaskManagerModel.find({ userId }).lean()

export const getTaskById = async(taskId: string) => await TaskManagerModel.findById(taskId).exec()

export const getTaskInBin = async(userId: string) => await TaskBinModel.find({userId}).exec()

export const createNewTask = async(userId: string, task: Partial<TaskProp>) => {
  const newTask = await TaskManagerModel.create({...task})
  const { _id } = newTask
  await UserModel.findByIdAndUpdate({_id: userId}, {$push: {taskIds: _id.toString()}})
  return newTask
}

export const updateTask = async(task: TaskProp) => await TaskManagerModel.findByIdAndUpdate({_id: task?._id}, {...task, edited: true})

export const deleteTask = async(userId: string, taskId: string) => {
  const task = await getTaskById(taskId)
  await UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: taskId}}).exec()
  .then(async() => {
    await TaskBinModel.findOneAndUpdate({userId}, {$push: {taskBin: task}})
    await TaskManagerModel.findByIdAndDelete(taskId)
  })
}

export const emptyTaskBin = async(userId: string) => {
  await TaskBinModel.findOneAndUpdate({userId}, {$set: { taskBin: [] }})
  .then(async() => {
    await UserModel.findByIdAndUpdate({_id: userId}, {$set: { taskIds: [] }})
  })
}

export const restoreTaskFromBin = async(taskIds: string[], userId: string) => {
  const taskBin = await TaskBinModel.findOne({userId}).exec()
  const tasksToRestore = await Promise.all(taskBin.taskBin.filter((task: TaskProp) => taskIds.includes(task?._id.toString())));
  // Restore back into task model
  await Promise.all(tasksToRestore.map(async(taskToRestore) => {
    const { userId, task, completed, updatedAt, createdAt } = taskToRestore
    const restoreTask = { userId, task, completed, updatedAt, createdAt, dateRestored: new Date().toString() }
    await createNewTask(userId, restoreTask)
  }))
  // save the modified taskbin without the restored tasks
  const otherTasks = await Promise.all(taskBin.taskBin.filter((task: TaskProp) => !taskIds.includes(task?._id.toString())));
  await taskBin.updateOne({$set: {taskBin: []}})
  .then(async() => {
    await Promise.all(otherTasks.map(async(task) => {
      await taskBin.updateOne({$push: {taskBin: task}})
      .then(async() => {
        await UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: task?._id.toString()}})
      })
    }))
  })
}

export const deletePermanentlyFromBin = async(taskIds: string[], userId: string) => {
  const taskBin = await TaskBinModel.findOne({userId}).exec()
  // save the modified taskbin without the restored tasks
  const otherTasks = await Promise.all(taskBin.taskBin.filter((task: TaskProp) => !taskIds.includes(task?._id.toString())));
  await taskBin.updateOne({$set: {taskBin: []}})
  .then(async() => {
    await Promise.all(otherTasks.map(async(task) => {
      await taskBin.updateOne({$push: {taskBin: task}})
    }))
  })
}
