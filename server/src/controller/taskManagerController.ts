import { TaskBin, TaskProp } from "../../types.js"
import { Request, Response } from "express"
import { UserService } from "../services/userService.js"
import { KV_Redis_ClientService } from "../helpers/redis.js"
import { TaskManagerService } from "../services/TaskManagerService.js"
import { asyncFunc, autoDeleteOnExpire, responseType } from "../helpers/helper.js"

class TaskManagerController {

  private userService = new UserService()
  private taskManagerService = new TaskManagerService()
  private redisClientService = new KV_Redis_ClientService()

  constructor(){}

  public createTask(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      const task: Partial<TaskProp> = req.body
      if(!userId) return responseType({res, status: 400, message: 'userId required'})
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
      this.taskManagerService.createNewTask(userId, task)
      .then((newTask) => responseType({res, count: 1, data: newTask}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public updateTasks(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      const task: TaskProp = req.body
      if(!task || !userId) return responseType({res, status: 404, message: 'task or userId required'})
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 401, message: 'unauthorized'})
      if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
      this.taskManagerService.updateTask(task)
      .then((updatedTask) => responseType({res, status: 201, count: 1, data: updatedTask}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public deleteUserTask(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId, taskId } = req.params
      if(!userId || !taskId) return responseType({res, status: 400, message: 'userId or taskId required'})
      await autoDeleteOnExpire(userId)
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      const task = await this.taskManagerService.getTaskById(taskId);
      if(!task) return responseType({res, status: 404, message: 'task not found'})
      if(userId !== task?.userId.toString()) return responseType({res, status: 403, message: 'Not you resource'})
      this.taskManagerService.deleteTask(userId, taskId)
      .then(() => responseType({res, status: 204, message: 'task deleted'}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public emptyBin(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      if(!userId) return responseType({res, status: 400, message: 'userId required'})
      const user = await this.userService.getUserById(userId);
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      const task = await this.taskManagerService.getTaskInBin(userId);
      if(!task) return responseType({res, status: 404, message: 'bin not found'})
      this.taskManagerService.emptyTaskBin(userId)
      .then(() => responseType({res, status: 201, message: 'task bin emptied'}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public getUserTask(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      if(!userId) return responseType({res, status: 400, message: 'userId required'})
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.redisClientService.getCachedResponse({key:`tasks:${userId}`, timeTaken: 1800, cb: async() => {
        const tasks = await this.taskManagerService.getUserTasks(userId)
        return tasks;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userTasks: TaskProp[]) => {
        if(!userTasks.length) return responseType({res, status: 404, message: 'no tasks found'})
        return responseType({res, count: userTasks?.length, data: userTasks})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public getTask(req: Request, res: Response){
    asyncFunc(res, () => {
      const { taskId } = req.params
      if(!taskId) return responseType({res, status: 400, message: 'taskId required'})
      this.redisClientService.getCachedResponse({key:`singleTask:${taskId}`, timeTaken: 1800, cb: async() => {
        const task = await this.taskManagerService.getTaskById(taskId)
        return task;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userTask: TaskProp) => {
        if(!userTask) return responseType({res, status: 404, message: 'task not found'})
        return responseType({res, count: 1, data: userTask})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public getTasksInBin(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId } = req.params
      if(!userId) return responseType({res, status: 400, message: 'userId required'})
      this.redisClientService.getCachedResponse({key:`taskInBin:${userId}`, timeTaken: 1800, cb: async() => {
        const task = await this.taskManagerService.getTaskInBin(userId)
        return task;
      }, reqMtd: ['POST', 'PUT', 'PATCH', 'DELETE'] })
      .then((userTask: TaskBin) => {
        if(!userTask) return responseType({res, status: 404, message: 'task not found'})
        const binLength = userTask[0]?.taskBin?.length
        return responseType({res, count: binLength, data: userTask})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public restoreTasks(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      const { taskIds }: {taskIds: string[]} = req.body
      if(!Array.isArray(taskIds) || !taskIds.length || !userId) return responseType({res, status: 400, message: 'all inputs are required in right format'})
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.taskManagerService.restoreTaskFromBin(taskIds, userId)
      .then(() => responseType({res, status: 201, message: 'Tasks restored'}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  public deletePermanently(req: Request, res: Response){
    asyncFunc(res, async() => {
      const { userId } = req.params
      const { taskIds }: {taskIds: string[]} = req.body
      if(!Array.isArray(taskIds) || !taskIds.length || !userId) return responseType({res, status: 400, message: 'all inputs are required in right format'})
      const user = await this.userService.getUserById(userId);
      await autoDeleteOnExpire(userId)
      if(!user) return responseType({res, status: 403, message: 'You do not have an account'})
      this.taskManagerService.deletePermanentlyFromBin(taskIds, userId)
      .then(() => responseType({res, status: 204, message: 'Tasks deleted permanently'}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
}
export default new TaskManagerController()
