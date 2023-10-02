import { TaskProp } from "../../types.js";
import { UserModel } from "../models/User.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";

export class TaskManagerService {

  constructor(){}
  public async getUserTasks(userId: string){
    return await TaskManagerModel.find({ userId }).lean()
  }

  public async getTaskById(taskId: string){
    return await TaskManagerModel.findById(taskId).exec()
  }

  public async getTaskInBin(userId: string){
    return await TaskBinModel.find({userId}).exec()
  }

  public async createNewTask(userId: string, task: Partial<TaskProp>){
    const newTask = await TaskManagerModel.create({...task})
    const { _id } = newTask
    await UserModel.findByIdAndUpdate({_id: userId}, {$push: {taskIds: _id.toString()}})
    return newTask
  }

  public async updateTask(task: TaskProp){
    return await TaskManagerModel.findByIdAndUpdate({_id: task?._id}, {...task, edited: true})
  }

  public async deleteTask(userId: string, taskId: string){
    const task = await this.getTaskById(taskId)
    UserModel.findByIdAndUpdate({_id: userId}, {$pull: {taskIds: taskId}}).exec()
    .then(async() => {
      await TaskBinModel.findOneAndUpdate({userId}, {$push: {taskBin: task}})
      await TaskManagerModel.findByIdAndDelete(taskId)
    })
  }

  public async emptyTaskBin(userId: string){
    TaskBinModel.findOneAndUpdate({userId}, {$set: { taskBin: [] }})
    .then(async() => {
      await UserModel.findByIdAndUpdate({_id: userId}, {$set: { taskIds: [] }})
    })
  }

  public async restoreTaskFromBin(taskIds: string[], userId: string){
    const taskBin = await TaskBinModel.findOne({userId}).exec()
    const tasksToRestore = await Promise.all(taskBin.taskBin.filter((task: TaskProp) => taskIds.includes(task?._id.toString())));
    // Restore back into task model
    await Promise.all(tasksToRestore.map(async(taskToRestore) => {
      const { userId, task, completed, updatedAt, createdAt } = taskToRestore
      const restoreTask = { userId, task, completed, updatedAt, createdAt, dateRestored: new Date().toString() }
      await this.createNewTask(userId, restoreTask)
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

  public async deletePermanentlyFromBin(taskIds: string[], userId: string){
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
}
