import { Router } from "express";
import { createTask, deleteUserTask, emptyBin, getTask, getTasksInBin, getUserTask, updateTasks } from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";

const taskManagerRouter = Router()

taskManagerRouter.post('/:userId', verifyRoles([ROLES.USER]), createTask)
taskManagerRouter.put('/:userId', verifyRoles([ROLES.USER]), updateTasks)
taskManagerRouter.put('/bin/:userId', verifyRoles([ROLES.USER]), emptyBin)
taskManagerRouter.get('/user/:userId', verifyRoles([ROLES.USER]), getUserTask)
taskManagerRouter.get('/:taskId', verifyRoles([ROLES.USER]), getTask)
taskManagerRouter.get('/bin/:userId', verifyRoles([ROLES.USER]), getTasksInBin)
taskManagerRouter.delete('/:userId/:taskId', verifyRoles([ROLES.USER]), deleteUserTask)

export default taskManagerRouter