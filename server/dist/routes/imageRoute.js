import { Router } from "express";
import { uploadImages } from "../controller/imageController.js";
import { upload } from "../middleware/imageUpload.js";
// verifyRoles([ROLES.USER]),
const imageRouter = Router();
imageRouter.post('/upload', upload.single('image'), uploadImages);
export default imageRouter;
//# sourceMappingURL=imageRoute.js.map