import { createClient as redisCreateClient } from 'redis';
import { objInstance } from './helper.js';
import { kv, createClient } from '@vercel/kv'

type Methods = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
  reqMtd: Methods[]
}


export class KV_Redis_ClientService {

  public redisClient = process.env.NODE_ENV === 'production' ? createClient(
    {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }
  ) : kv;

  constructor(){}

  /**
   * @description caches all GET requests
   * @param object - containing {req, timeTaken, cb, reqMtd}
  */ 
  public async getCachedResponse<T>({key, timeTaken=7200, cb, reqMtd=[]}): Promise<T | T[]> {
    try{
      if(objInstance.isPresent(reqMtd)){
        this.redisClient.flushall()
        objInstance.pullIt(reqMtd)
      }
      const data = await this.redisClient.get(key) as T | T[]
      if(data) return data

      const freshData = await cb()
      this.redisClient.setex(key, timeTaken, freshData)
      return freshData
    }
    catch(error){
      console.error(error?.message)
    }
  }
}


export class RedisClientService {

  public redisClient = redisCreateClient(
    process.env.NODE_ENV === 'production' ? { url: process.env.REDIS_URL } : {}
  );

  constructor(){
    if(!this.redisClient.isOpen) {
      this.redisClient.connect()
      .then(() => console.log('REDIS CONNECTED SUCCESSFULLY'))
    }
  }

  /**
   * @description caches all GET requests
   * @param object - containing {req, timeTaken, cb, reqMtd}
  */ 
  public async getCachedResponse<T>({key, timeTaken=7200, cb, reqMtd=[]}): Promise<T | T[]> {
    this.redisClient.on('error', (err) => {
      console.error('Redis client error: ', err.logMessage)
    })
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
}
