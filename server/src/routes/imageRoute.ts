import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
import { deleteImage, uploadImages } from "../controller/imageController.js";
import { coverPhotoUpload, dpUpload, upload } from "../middleware/imageUpload.js";

const imageRouter: Router = Router()

imageRouter.post('/upload', upload.single('image'), uploadImages)
imageRouter.post('/dp_upload', dpUpload.single('image'), uploadImages)
imageRouter.post('/cover_upload', coverPhotoUpload.single('image'), uploadImages)
imageRouter.delete('/:imageName', verifyRoles([ROLES.USER]), deleteImage)

export default imageRouter