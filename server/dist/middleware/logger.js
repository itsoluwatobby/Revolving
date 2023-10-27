var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import fsPromises from 'fs/promises';
export const revolvingErrorLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date());
    if ((res === null || res === void 0 ? void 0 : res.statusCode) >= 400) {
        const logMessage = `[-${req.headers.origin}::${req.httpVersion}] - [${date}] "${req.method} ${req.baseUrl}${req.url}" ${res.statusCode} ${res.statusMessage}\n`;
        const filePath = process.cwd() + '\\errorLog\\error.log';
        if (!fs.existsSync(filePath))
            yield fsPromises.writeFile(filePath, logMessage);
        else
            yield fsPromises.appendFile(filePath, logMessage);
        next();
    }
    else
        next();
});
//# sourceMappingURL=logger.js.map