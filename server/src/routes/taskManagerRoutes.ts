import { Router } from "express";
import TaskManagerInstance from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const taskManagerRouter: Router = Router()

// User tasks routes
taskManagerRouter.post('/:userId/tasks', verifyRoles([ROLES.USER]), TaskManagerInstance.createTask);
taskManagerRouter.put('/:userId/tasks/update', verifyRoles([ROLES.USER]), TaskManagerInstance.updateTasks);
taskManagerRouter.delete('/:userId/tasks/:taskId', verifyRoles([ROLES.USER]), TaskManagerInstance.deleteUserTask);

// Bin routes
taskManagerRouter.put('/:userId/bin', verifyRoles([ROLES.USER]), TaskManagerInstance.emptyBin);
taskManagerRouter.post('/:userId/bin/restore', verifyRoles([ROLES.USER]), TaskManagerInstance.restoreTasks);
taskManagerRouter.delete('/:userId/bin/permanent', verifyRoles([ROLES.USER]), TaskManagerInstance.deletePermanently);

export default taskManagerRouter