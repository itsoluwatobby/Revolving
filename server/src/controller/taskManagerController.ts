import { Request, Response } from "express"
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js"
import { TaskProp } from "../../types.js"
import { getUserById } from "../helpers/userHelpers.js"
import { createNewTask, deleteTask, emptyTaskBin, getTaskById, getUserTasks, updateTask } from "../helpers/tasksHelper.js"
import { getCachedResponse } from "../helpers/redis.js"

export const createTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    const task: TaskProp = req.body
    await autoDeleteOnExpire(userId)
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    const newTask = await createNewTask(userId, task)
    return responseType({res, count: 1, data: newTask})
  })
}

export const updateTasks = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const task: TaskProp = req.body
    if(!task) return responseType({res, status: 404, message: 'task required'})
    const user = await getUserById(task?.userId);
    await autoDeleteOnExpire(user?._id)
    if(!user) return responseType({res, status: 401, message: 'unauthorized'})
    const updatedTask = await updateTask(task)
    return responseType({res, status: 201, count: 1, data: updatedTask})
  })
}

export const deleteUserTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, taskId } = req.params
    if(!userId || !taskId) return responseType({res, status: 400, message: 'userId or taskId required'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    await deleteTask(userId, taskId)
    return responseType({res, status: 204, message: 'task deleted'})
  })
}

export const emptyBin = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    await emptyTaskBin(userId)
    return responseType({res, status: 204, message: 'task bin emptied'})
  })
}
export const getUserTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    const userTasks = await getCachedResponse({key:`tasks:${userId}`, timeTaken: 1800, cb: async() => {
      const tasks = await getUserTasks(userId)
      return tasks;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as TaskProp[];
    if(!userTasks.length) return responseType({res, status: 404, message: 'no tasks found'})
    return responseType({res, count: userTasks?.length, data: userTasks})
  })
}

export const getTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { taskId } = req.params
    if(!taskId) return responseType({res, status: 400, message: 'taskId required'})
    const userTask = await getCachedResponse({key:`singleTask:${taskId}`, timeTaken: 1800, cb: async() => {
      const task = await getTaskById(taskId)
      return task;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] }) as TaskProp;
    if(!userTask) return responseType({res, status: 404, message: 'task not found'})
    return responseType({res, count: 1, data: userTask})
  })
}
