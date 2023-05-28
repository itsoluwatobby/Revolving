var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from 'redis';
const redisClient = createClient();
export const getCachedResponse = (key, timeTaken = 3600, cb) => __awaiter(void 0, void 0, void 0, function* () {
    redisClient.on('error', err => console.error('Redis client error: ', err));
    if (!redisClient.isOpen)
        yield redisClient.connect();
    try {
        const data = yield redisClient.get(key);
        if (data)
            return JSON.parse(data);
        const freshData = yield cb();
        redisClient.setEx(key, timeTaken, JSON.stringify(freshData));
        return freshData;
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=redis.js.map