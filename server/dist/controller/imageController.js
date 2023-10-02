var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidV4 } from 'uuid';
import fsPromises from 'fs/promises';
import { asyncFunc, responseType } from "../helpers/helper.js";
class ImageController {
    constructor() { }
    uploadImages(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const uploadedFile = req.file;
            const uniqueId = uuidV4();
            const filename = uploadedFile.originalname;
            const fileext = filename.substring(filename.lastIndexOf('.'));
            const newName = `${uniqueId}${fileext}`;
            const newPath = `fileUpload/${newName}`;
            fsPromises.rename(uploadedFile.path, newPath)
                .then(() => {
                const imageUrl = `${process.env.IMAGELINK}/${newName}`;
                return responseType({ res, status: 201, message: 'image uploaded', count: 1, data: { url: imageUrl } });
            }).catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
    // Using express-static middleware to serve my images
    getImage(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const { imageName } = req.params;
            const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
            res.sendFile(pathname);
        }));
    }
    deleteImage(req, res) {
        asyncFunc(res, () => __awaiter(this, void 0, void 0, function* () {
            const name = req.url;
            const imageName = name.substring(1);
            const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
            fsPromises.unlink(pathname)
                .then(() => responseType({ res, status: 204, message: 'image deleted' }))
                .catch((error) => responseType({ res, status: 404, message: `${error.message}` }));
        }));
    }
}
export default new ImageController();
//# sourceMappingURL=imageController.js.map