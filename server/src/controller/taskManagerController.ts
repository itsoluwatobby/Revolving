import { Request, Response, response } from "express"
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js"
import { TaskBin, TaskProp } from "../../types.js"
import { getUserById } from "../helpers/userHelpers.js"
import { createNewTask, deletePermanentlyFromBin, deleteTask, emptyTaskBin, getTaskById, 
  getTaskInBin, getUserTasks, restoreTaskFromBin, updateTask } from "../helpers/tasksHelper.js"
import { getCachedResponse } from "../helpers/redis.js"


export const createTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    const task: Partial<TaskProp> = req.body
    await autoDeleteOnExpire(userId)
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
    createNewTask(userId, task)
    .then((newTask) => responseType({res, count: 1, data: newTask}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const updateTasks = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    const task: TaskProp = req.body
    if(!task || !userId) return responseType({res, status: 404, message: 'task or userId required'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 401, message: 'unauthorized'})
    if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
    updateTask(task)
    .then((updatedTask) => responseType({res, status: 201, count: 1, data: updatedTask}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const deleteUserTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId, taskId } = req.params
    if(!userId || !taskId) return responseType({res, status: 400, message: 'userId or taskId required'})
    await autoDeleteOnExpire(userId)
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    const task = await getTaskById(taskId);
    if(!task) return responseType({res, status: 404, message: 'task not found'})
    if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
    deleteTask(userId, taskId)
    .then(() => responseType({res, status: 204, message: 'task deleted'}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const emptyBin = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    const task = await getTaskInBin(userId);
    if(!task) return responseType({res, status: 404, message: 'bin not found'})
    emptyTaskBin(userId)
    .then(() => responseType({res, status: 201, message: 'task bin emptied'}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const getUserTask = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    getCachedResponse({key:`tasks:${userId}`, timeTaken: 1800, cb: async() => {
      const tasks = await getUserTasks(userId)
      return tasks;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((userTasks: TaskProp[]) => {
      if(!userTasks.length) return responseType({res, status: 404, message: 'no tasks found'})
      return responseType({res, count: userTasks?.length, data: userTasks})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const getTask = (req: Request, res: Response) => {
  asyncFunc(res, () => {
    const { taskId } = req.params
    if(!taskId) return responseType({res, status: 400, message: 'taskId required'})
    getCachedResponse({key:`singleTask:${taskId}`, timeTaken: 1800, cb: async() => {
      const task = await getTaskById(taskId)
      return task;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((userTask: TaskProp) => {
      if(!userTask) return responseType({res, status: 404, message: 'task not found'})
      return responseType({res, count: 1, data: userTask})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const getTasksInBin = (req: Request, res: Response) => {
  asyncFunc(res, () => {
    const { userId } = req.params
    if(!userId) return responseType({res, status: 400, message: 'userId required'})
    getCachedResponse({key:`taskInBin:${userId}`, timeTaken: 1800, cb: async() => {
      const task = await getTaskInBin(userId)
      return task;
    }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
    .then((userTask: TaskBin) => {
      if(!userTask) return responseType({res, status: 404, message: 'task not found'})
      const binLength = userTask[0]?.taskBin?.length
      return responseType({res, count: binLength, data: userTask})
    }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const restoreTasks = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    const { taskIds }: {taskIds: string[]} = req.body
    if(!Array.isArray(taskIds) || !taskIds.length || !userId) return responseType({res, status: 400, message: 'all inputs are required in right format'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    restoreTaskFromBin(taskIds, userId)
    .then(() => responseType({res, status: 201, message: 'Tasks restored'}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

export const deletePermanently = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const { userId } = req.params
    const { taskIds }: {taskIds: string[]} = req.body
    if(!Array.isArray(taskIds) || !taskIds.length || !userId) return responseType({res, status: 400, message: 'all inputs are required in right format'})
    const user = await getUserById(userId);
    await autoDeleteOnExpire(userId)
    if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
    deletePermanentlyFromBin(taskIds, userId)
    .then(() => responseType({res, status: 204, message: 'Tasks deleted permanently'}))
    .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
  })
}

