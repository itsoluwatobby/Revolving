import { createClient } from 'redis';
import { objInstance } from './helper.js';

type Methods = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
  reqMtd: Methods[]
}
export const redisClient = createClient();

export async function getCachedResponse<T>({key, timeTaken=7200, cb, reqMtd=[]}): Promise<T> {
  redisClient.on('error', (err) => console.error('Redis client error: ', err.logMessage))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    if(objInstance.isPresent(reqMtd)){
      redisClient.flushAll()
      objInstance.pullIt(reqMtd)
    }
    const data = await redisClient.get(key)
    if(data) return JSON.parse(data)

    const freshData = await cb()
    redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
    return freshData
  }
  catch(error){
    console.error(error?.message)
  }
}

export const getCachedValueResponse = async<T>({key, timeTaken=3600, cb}): Promise<T> => {
  redisClient.on('error', err => console.error('Redis client error: ',err))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    const data = await redisClient.get(key)
    if(data) return JSON.parse(data) as T
    
    const freshData = await cb() as T
    redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
    return freshData
  }
  catch(error){
    console.error(error?.message)
  }
}

export function timeConverterInMillis() {
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
 
  return {minute, hour, day}
}


