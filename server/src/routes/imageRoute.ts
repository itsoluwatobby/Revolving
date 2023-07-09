import { Router } from "express";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { ROLES } from "../config/allowedRoles.js";
import { uploadImages } from "../controller/imageController.js";
import { upload } from "../middleware/imageUpload.js";
// verifyRoles([ROLES.USER]),
const imageRouter = Router()

imageRouter.post('/upload', upload.single('image'), uploadImages)

export default imageRouter