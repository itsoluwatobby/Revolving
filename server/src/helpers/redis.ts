import { createClient } from 'redis';
import { objInstance } from './helper.js';

type Methods = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
  reqMtd: Methods[]
}

export class RedisClientService {

  public redisClient = createClient();

  constructor(){}

  /**
   * @description caches all GET requests
   * @param object - containing {req, timeTaken, cb, reqMtd}
  */ 
  public async getCachedResponse<T>({key, timeTaken=7200, cb, reqMtd=[]}): Promise<T | T[]> {
    this.redisClient.on('error', (err) => console.error('Redis client error: ', err.logMessage))
    if(!this.redisClient.isOpen) await this.redisClient.connect();
    try{
      if(objInstance.isPresent(reqMtd)){
        this.redisClient.flushAll()
        objInstance.pullIt(reqMtd)
      }
      const data = await this.redisClient.get(key)
      if(data) return JSON.parse(data)

      const freshData = await cb()
      this.redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
      return freshData
    }
    catch(error){
      console.error(error?.message)
    }
  }

  public async getCachedValueResponse<T>({key, timeTaken=3600, cb}): Promise<T> {
    this.redisClient.on('error', err => console.error('Redis client error: ',err))
    if(!this.redisClient.isOpen) await this.redisClient.connect();
    try{
      const data = await this.redisClient.get(key)
      if(data) return JSON.parse(data) as T
      
      const freshData = await cb() as T
      this.redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
      return freshData
    }
    catch(error){
      console.error(error?.message)
    }
  }
}
