import { Router } from "express";
import { createTask, deletePeranently, deleteUserTask, emptyBin, restoreTasks, updateTasks } from "../controller/taskManagerController.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
const taskManagerRouter = Router();
taskManagerRouter.post('/:userId', verifyRoles([ROLES.USER]), createTask);
taskManagerRouter.put('/:userId', verifyRoles([ROLES.USER]), updateTasks);
taskManagerRouter.put('/bin/:userId', verifyRoles([ROLES.USER]), emptyBin);
taskManagerRouter.delete('/:userId/:taskId', verifyRoles([ROLES.USER]), deleteUserTask);
// restore task
taskManagerRouter.post('/restore/:userId', verifyRoles([ROLES.USER]), restoreTasks);
// delete permanently
taskManagerRouter.delete('/delete/:userId', verifyRoles([ROLES.USER]), deletePeranently);
export default taskManagerRouter;
//# sourceMappingURL=taskManagerRoutes.js.map