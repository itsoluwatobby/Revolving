import { ROLES } from "../config/allowedRoles.js";
import { Request, Response, Router } from "express";
// import { createTask, deletePermanently, deleteUserTask, emptyBin, restoreTasks, updateTasks } from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import TaskManagerController from "../controller/taskManagerController.js";

const taskManagerRouter: Router = Router()

// User tasks routes
taskManagerRouter.post('/:userId/tasks', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.createTask(req, res));
taskManagerRouter.put('/:userId/tasks/update', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.updateTasks(req, res));
taskManagerRouter.delete('/:userId/tasks/:taskId', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.deleteUserTask(req, res));

// Bin routes
taskManagerRouter.put('/:userId/bin', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.emptyBin(req, res));
taskManagerRouter.post('/:userId/bin/restore', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.restoreTasks(req, res));
taskManagerRouter.delete('/:userId/bin/permanent', verifyRoles([ROLES.USER]), (req: Request, res: Response) => TaskManagerController.deletePermanently(req, res));

export default taskManagerRouter