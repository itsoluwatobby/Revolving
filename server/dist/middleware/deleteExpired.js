var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { timeConverter } from "../helpers/redis.js";
import { TaskBinModel } from "../models/TaskManager.js";
export const autoDeleteOnExpire = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { minute } = timeConverter();
    const expiredTime = new Date(new Date().getTime() + minute);
    const { userId } = req.params;
    const entry = req.body;
    console.log('IN HERE 1', userId, entry === null || entry === void 0 ? void 0 : entry._id);
    console.log(req.params);
    if (!userId && !(entry === null || entry === void 0 ? void 0 : entry.userId))
        return next();
    else {
        let id = userId !== null && userId !== void 0 ? userId : entry === null || entry === void 0 ? void 0 : entry.userId;
        console.log('IN HERE 2', id);
        const getTaskBin = yield TaskBinModel.findOne({ userId: id });
        if (expiredTime < getTaskBin.createdAt) {
            console.log('DELETED BRO');
            yield TaskBinModel.findByIdAndUpdate({ userId: id }, { $set: { taskBin: [] } });
            return next();
        }
        else {
            console.log('IN HERE 3');
            return next();
        }
    }
});
//# sourceMappingURL=deleteExpired.js.map