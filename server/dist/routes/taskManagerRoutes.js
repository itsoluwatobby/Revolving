import { Router } from "express";
import { createTask, deletePermanently, deleteUserTask, emptyBin, restoreTasks, updateTasks } from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const taskManagerRouter = Router();
// User tasks routes
taskManagerRouter.post('/:userId/tasks', verifyRoles([ROLES.USER]), createTask);
taskManagerRouter.put('/:userId/tasks/update', verifyRoles([ROLES.USER]), updateTasks);
taskManagerRouter.delete('/:userId/tasks/:taskId', verifyRoles([ROLES.USER]), deleteUserTask);
// Bin routes
taskManagerRouter.put('/:userId/bin', verifyRoles([ROLES.USER]), emptyBin);
taskManagerRouter.post('/:userId/bin/restore', verifyRoles([ROLES.USER]), restoreTasks);
taskManagerRouter.delete('/:userId/bin/permanent', verifyRoles([ROLES.USER]), deletePermanently);
export default taskManagerRouter;
//# sourceMappingURL=taskManagerRoutes.js.map