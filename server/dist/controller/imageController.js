var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncFunc, responseType } from "../helpers/helper.js";
import { v4 as uuidV4 } from 'uuid';
import fsPromises from 'fs/promises';
export const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const uploadedFile = req.file;
        const uniqueId = uuidV4();
        const filename = uploadedFile.originalname;
        const fileext = filename.substring(filename.lastIndexOf('.'));
        const newName = `${uniqueId}${fileext}`;
        const newPath = `fileUpload/${newName}`;
        yield fsPromises.rename(uploadedFile.path, newPath)
            .then(() => {
            const imageUrl = `${process.env.IMAGELINK}/${newName}`;
            responseType({ res, status: 201, message: 'image uploaded', count: 1, data: { url: imageUrl } });
        })
            .catch((err) => {
            console.log(err.message);
        });
    }));
});
// Using express-static middleware to serve my images
export const getImage = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { imageName } = req.params;
        const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
        res.sendFile(pathname);
    }));
};
export const deleteImage = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const name = req.url;
        const imageName = name.substring(1);
        const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
        console.log(pathname);
        yield fsPromises.unlink(pathname)
            .then(() => {
            console.log('DELETED');
            responseType({ res, status: 204, message: 'image deleted' });
        })
            .catch(error => {
            console.log(error.message);
            responseType({ res, status: 404, message: 'error deleting' });
        });
    }));
};
//# sourceMappingURL=imageController.js.map