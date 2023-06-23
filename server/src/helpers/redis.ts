import { createClient } from 'redis';
import { objInstance } from './helper.js';
import { CommentResponseModel } from '../models/CommentResponse.js';

type Methods = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RedisOptionProps<T>={
  key: string,
  timeTaken: number,
  cb: () => Promise<T>
  reqMtd: Methods[]
}
export const redisClient = createClient();

export const getCachedResponse = async<T>({key, timeTaken=7200, cb, reqMtd=[]}): Promise<T> => {
  redisClient.on('error', err => console.error('Redis client error: ',err))
  if(!redisClient.isOpen) await redisClient.connect();
  try{
    if(objInstance.isPresent(reqMtd)){
      //redisClient.DEL(key)
      redisClient.flushAll()
      objInstance.pullIt(reqMtd)
    }
    const data = await redisClient.get(key)
    if(data) {
      console.log('Cache Hit')
      return JSON.parse(data)
    }

    const freshData = await cb()
    console.log('Cache Miss')
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

