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
import { randomUUID } from 'crypto';
import fsPromises from 'fs/promises';
export const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const uploadedFile = req.file;
        const uniqueId = randomUUID();
        const filename = uploadedFile.originalname;
        const fileext = filename.split('.')[1];
        const newName = `${uniqueId}.${fileext}`;
        const newPath = `fileUpload/${newName}`;
        yield fsPromises.rename(uploadedFile.path, newPath);
        const imageUrl = `${process.env.IMAGELINK}/${newName}`;
        return responseType({ res, status: 201, message: 'image uploaded', count: 1, data: { url: imageUrl } });
    }));
});
export const getImage = (req, res) => {
    asyncFunc(res, () => __awaiter(void 0, void 0, void 0, function* () {
        const { imageName } = req.params;
        const pathname = process.cwd() + `\\fileUpload\\${imageName}`;
        res.sendFile(pathname);
    }));
};
//# sourceMappingURL=imageController.js.map