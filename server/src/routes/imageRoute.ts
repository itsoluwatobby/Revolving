import { Router } from "express";
import { ROLES } from "../config/allowedRoles.js";
import { upload } from "../middleware/imageUpload.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import ImageControllerInstance from "../controller/imageController.js";

const imageRouter: Router = Router()

imageRouter.post('/upload', upload.single('image'), ImageControllerInstance.uploadImages)
imageRouter.delete('/:imageName', verifyRoles([ROLES.USER]), ImageControllerInstance.deleteImage)

export default imageRouter