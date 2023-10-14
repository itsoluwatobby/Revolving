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
export class RedisClientService {
    constructor() {
        this.redisClient = createClient(process.env.NODE_ENV === 'production' ? { url: process.env.REDIS_URL } : {});
        if (!this.redisClient.isOpen) {
            this.redisClient.connect()
                .then(() => console.log('REDIS CONNECTED SUCCESSFULLY'));
        }
    }
    /**
     * @description caches all GET requests
     * @param object - containing {req, timeTaken, cb, reqMtd}
    */
    getCachedResponse({ key, timeTaken = 7200, cb, reqMtd = [] }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient.on('error', (err) => {
                console.error('Redis client error: ', err.logMessage);
            });
            try {
                if (objInstance.isPresent(reqMtd)) {
                    this.redisClient.flushAll();
                    objInstance.pullIt(reqMtd);
                }
                const data = yield this.redisClient.get(key);
                if (data)
                    return JSON.parse(data);
                const freshData = yield cb();
                this.redisClient.setEx(key, timeTaken, JSON.stringify(freshData));
                return freshData;
            }
            catch (error) {
                console.error(error === null || error === void 0 ? void 0 : error.message);
            }
        });
    }
    getCachedValueResponse({ key, timeTaken = 3600, cb }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient.on('error', err => console.error('Redis client error: ', err));
            if (!this.redisClient.isOpen)
                yield this.redisClient.connect();
            try {
                const data = yield this.redisClient.get(key);
                if (data)
                    return JSON.parse(data);
                const freshData = yield cb();
                this.redisClient.setEx(key, timeTaken, JSON.stringify(freshData));
                return freshData;
            }
            catch (error) {
                console.error(error === null || error === void 0 ? void 0 : error.message);
            }
        });
    }
}
//# sourceMappingURL=redis.js.map