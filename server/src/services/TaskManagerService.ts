import { TaskProp } from "../../types.js";
import { UserModel } from "../models/User.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";


  export async function getUserTasks(userId: string){
    return await TaskManagerModel.find({ userId }).lean()
  }

  export async function getTaskById(taskId: string){
    return await TaskManagerModel.findById(taskId).exec()
  }

  export async function getTaskInBin(userId: string){
    return await TaskBinModel.find({userId}).exec()
  }

  export async function createNewTask(userId: string, task: Partial<TaskProp>){
    const newTask = await TaskManagerModel.create({...task})
    const { _id } = newTask
    await UserModel.findByIdAndUpdate({_id: userId}, {$push: {taskIds: _id.toString()}})
    return newTask
  }

  export async function updateTask(task: TaskProp){
    return await TaskManagerModel.findByIdAndUpdate({_id: task?._id}, {...task, edited: true})
  }

  export async function deleteTask(userId: string, taskId: string){
    const task = await getTaskById(taskId)
    UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: taskId}}).exec()
    .then(async() => {
      await TaskBinModel.findOneAndUpdate({userId}, {$push: {taskBin: task}})
      await TaskManagerModel.findByIdAndDelete(taskId)
    })
  }

  export async function emptyTaskBin(userId: string){
    TaskBinModel.findOneAndUpdate({userId}, {$set: { taskBin: [] }})
    .then(async() => {
      await UserModel.findByIdAndUpdate({_id: userId}, {$set: { taskIds: [] }})
    })
  }

  export async function restoreTaskFromBin(taskIds: string[], userId: string){
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
    taskBin.updateOne({$set: {taskBin: []}})
    .then(async() => {
      await Promise.all(otherTasks.map(async(task) => {
        taskBin.updateOne({$push: {taskBin: task}})
        .then(async() => {
          await UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: task?._id.toString()}})
        })
      }))
    })
  }

  export async function deletePermanentlyFromBin(taskIds: string[], userId: string){
    const taskBin = await TaskBinModel.findOne({userId}).exec()
    // save the modified taskbin without the restored tasks
    const otherTasks = await Promise.all(taskBin.taskBin.filter((task: TaskProp) => !taskIds.includes(task?._id.toString())));
    taskBin.updateOne({$set: {taskBin: []}})
    .then(async() => {
      await Promise.all(otherTasks.map(async(task) => {
        await taskBin.updateOne({$push: {taskBin: task}})
      }))
    })
  }
