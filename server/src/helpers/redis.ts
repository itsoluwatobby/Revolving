import { createClient } from 'redis';
import { objInstance } from './helper.js';

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
}
export const redisClient = createClient();

export const getCachedResponse = async<T>({key, timeTaken=7200, cb, reqUrl=null}): Promise<T> => {
  redisClient.on('error', err => console.error('Redis client error: ',err))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    if(objInstance.isPresent(reqUrl)){
      redisClient.DEL(key)
      objInstance.pullIt(reqUrl)
    }
    const data = await redisClient.get(key)
    if(data) return JSON.parse(data)
    const freshData = await cb()
    if(freshData != null){
      redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
      return freshData
    }
    return;
  }
  catch(error){
    console.error(error)
  }
}

export const getCachedValueResponse = async({key, timeTaken=3600, value}): Promise<string> => {
  redisClient.on('error', err => console.error('Redis client error: ',err))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    const data = await redisClient.get(key)
    if(data) return data
    const freshData = value
    if(freshData != null){
      redisClient.setEx(key, timeTaken, freshData)
      return freshData
    }
    return;
  }
  catch(error){
    console.error(error)
  }
}

