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
import { objInstance } from './helper.js';
export const redisClient = createClient();
export const getCachedResponse = ({ key, timeTaken = 7200, cb, reqMtd = [] }) => __awaiter(void 0, void 0, void 0, function* () {
    redisClient.on('error', err => console.error('Redis client error: ', err.logMessage));
    if (!redisClient.isOpen)
        yield redisClient.connect();
    try {
        if (objInstance.isPresent(reqMtd)) {
            //redisClient.DEL(key)
            redisClient.flushAll();
            objInstance.pullIt(reqMtd);
        }
        const data = yield redisClient.get(key);
        if (data) {
            console.log('Cache Hit');
            return JSON.parse(data);
        }
        const freshData = yield cb();
        console.log('Cache Miss');
        redisClient.setEx(key, timeTaken, JSON.stringify(freshData));
        return freshData;
    }
    catch (error) {
        console.error(error);
    }
});
export const getCachedValueRespon = ({ key, timeTaken = 3600, value }) => __awaiter(void 0, void 0, void 0, function* () {
    redisClient.on('error', err => console.error('Redis client error: ', err));
    if (!redisClient.isOpen)
        yield redisClient.connect();
    try {
        const data = yield redisClient.get(key);
        if (data)
            return data;
        const freshData = value;
        if (freshData != null) {
            redisClient.setEx(key, timeTaken, freshData);
            return freshData;
        }
        return;
    }
    catch (error) {
        console.error(error);
    }
});
export const timeConverterInMillis = () => {
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    return { minute, hour, day };
};
//# sourceMappingURL=redis.js.map