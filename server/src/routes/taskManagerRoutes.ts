import { Router } from "express";
import { createTask, deleteUserTask, emptyBin, getTask, getTasksInBin, getUserTask, updateTasks } from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const taskManagerRouter: Router = Router()

taskManagerRouter.post('/:userId', verifyRoles([ROLES.USER]), createTask)
taskManagerRouter.put('/:userId', verifyRoles([ROLES.USER]), updateTasks)
taskManagerRouter.put('/bin/:userId', verifyRoles([ROLES.USER]), emptyBin)
taskManagerRouter.delete('/:userId/:taskId', verifyRoles([ROLES.USER]), deleteUserTask)

export default taskManagerRouter