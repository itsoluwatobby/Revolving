import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { upload } from "../middleware/imageUpload.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
// import { deleteImage, uploadImages } from "../controller/imageController.js";
import ImageController from "../controller/imageController.js";
const imageRouter = Router();
imageRouter.post('/upload', upload.single('image'), (req, res) => ImageController.uploadImages(req, res));
imageRouter.delete('/:imageName', verifyRoles([ROLES.USER]), (req, res) => ImageController.deleteImage(req, res));
export default imageRouter;
//# sourceMappingURL=imageRoute.js.map