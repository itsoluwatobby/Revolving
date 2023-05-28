import { createClient } from 'redis';

const redisClient = createClient();

export const getCachedResponse = async<T>(key: string, timeTaken: number = 3600, cb: () => Promise<T>): Promise<T> => {
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

