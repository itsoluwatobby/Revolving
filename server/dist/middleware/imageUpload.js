import multer, { diskStorage } from "multer";
import process from 'process';
const pathname = process.cwd() + '\\fileUpload';
const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, pathname);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
export const upload = multer({ storage: storage });
//# sourceMappingURL=imageUpload.js.map