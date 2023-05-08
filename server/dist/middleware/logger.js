var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { format } from 'date-fns';
const logger = (logName, method) => __awaiter(void 0, void 0, void 0, function* () {
    const { randomBytes } = yield import("node:crypto");
    const date = `${format(new Date(), 'MMMM-dd-yyyy\tHH:mm:ss')}`;
    const randomId = randomBytes(12).toString('hex');
    const logEvent = `[${date}]\t${randomId}\t${method}\n`;
    try {
        (!fs.existsSync(path.join(__dirname, '..', 'log'))) && (yield fsPromises.mkdir(path.join(__dirname, '..', 'log')));
        yield fsPromises.appendFile(path.join(__dirname, '..', 'log', logName), logEvent);
        console.log(logEvent);
    }
    catch (error) {
        console.log('unable to log request');
    }
});
export const logEvents = (req, res, next) => {
    logger('reqLog.log', `${req.method}\t${req.url}\t${req.headers.origin}`);
    next();
};
export const errorLog = (err, req, res, next) => {
    logger(`${err.name}:\t${err === null || err === void 0 ? void 0 : err.message}`, 'errLog.log');
    res.sendFile(path.join(__dirname, '..', 'public', '404.html'));
    console.log(`${err === null || err === void 0 ? void 0 : err.stack}`);
    next();
};
//# sourceMappingURL=logger.js.map