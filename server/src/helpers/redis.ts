import { createClient } from 'redis';

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
}
export const redisClient = createClient();

export const getCachedResponse = async<T>({key, timeTaken=7200, cb}): Promise<T> => {
  redisClient.on('error', err => console.error('Redis client error: ',err))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    const data = await redisClient.get(key)
    if(data) return JSON.parse(data)
    const freshData = await cb()
    redisClient.setEx(key, timeTaken, JSON.stringify(freshData))
    return freshData
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
    redisClient.setEx(key, timeTaken, freshData)
    return freshData
  }
  catch(error){
    console.error(error)
  }
}

