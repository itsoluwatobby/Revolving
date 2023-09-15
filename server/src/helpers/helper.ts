import { sub } from 'date-fns';
import jwt from 'jsonwebtoken'
import { ClaimProps, ObjectUnknown, PageRequest, PagesType, ResponseType, StoryProps, USERROLES } from '../../types.js';
import { Response } from 'express';
import { TaskBinModel } from '../models/TaskManager.js';
import { timeConverterInMillis } from './redis.js';

type ReqOpt = {
  mtd: string,
  url: string
}

export const dateTime = sub(new Date, { minutes: 0 }).toISOString();

/**
 * @description function to sign tokens
 * @param claim user data to attach to token
 * @param expires expiration date
 * @param secret token secret
 * @returns 
 */
export async function signToken(claim: ClaimProps, expires: string, secret: string) {
    const token = jwt.sign(
      {
        "userInfo": {
          roles: claim?.roles, email: claim?.email
        }
      },
      secret,
      { expiresIn: expires },
    )
  return token
}

/**
 * @description function to verify jwt tokens
 * @param token 
 * @param secret 
 * @returns 
 */
export async function verifyToken(token: string, secret: string): Promise<string | ClaimProps> {
  let response: string | ClaimProps;  
  jwt.verify(
      token,
      secret,
      (err: {name: string}, decoded: {userInfo: { email: string, roles: USERROLES[]}}) => {
        if(err?.name == 'TokenExpiredError') response = 'Expired Token'
        else if(err?.name == 'JsonWebTokenError') response = 'Bad Token'
        else{
          response = {
            roles: decoded?.userInfo?.roles,
            email: decoded?.userInfo?.email
          } as ClaimProps
        }
      }
    )
  return response;
}

/**
 * @description general response body
 * @param param0 
 * @returns 
 */
export const responseType = ({res, status=200, count=0, message='success', data={}, pages={}}): ResponseType => {
  return (
    data ? 
        res.status(status).json({pages, meta:{status, count, message}, data})
            : res.status(status).json({meta:{status, message}, data})
  )
}

/**
 * @class an object to keep track of the request methods to enable effect caching
 */
class UrlsObj{

  private req: ReqOpt;
  private urls: ReqOpt[];

  constructor(){
    this.req = { mtd: '', url: '' };
    this.urls = [];
  }

  isPresent(reqUrl: string[]): boolean{
    let present = this.urls.map(url => reqUrl.includes(url.mtd)).find(seen => seen == true)
    if(!present){
      const cumtomUrls = ['POST', 'PUT', 'PATCH', 'DELETE']
      present = cumtomUrls.map(cumtomUrl => reqUrl.includes(cumtomUrl)).find(seen => seen == true)
    }
    return present ? true : false
  }
  pushIn(reqs: ReqOpt){
    this.req = reqs
    const others = this.urls.filter(url => url.url !== this.req.url)
    this.urls = others
    this.urls.push(this.req)
  }
  pullIt(reqUrl: string[]){
    const otherUrls = this.urls.filter(url => !reqUrl.includes(url.mtd))
    this.urls = [...otherUrls]
  }
  getUrl(){
    return this.urls
  }
  reset(){
    this.urls = []
    this.req = { mtd: '', url: '' }
  }
}
export const objInstance = new UrlsObj();

/**
 * @description general reusable async function
 * @param res the responseBody
 * @param callback callback function
 */
export const asyncFunc = (res: Response, callback: () => void) => {
  try{
    callback()
  }
  catch(error){
    res.sendStatus(500)
  }
}

export async function pagination({startIndex=1, endIndex=1, page=1, limit=1, cb}) {

  const pages = {} as PagesType;
  try{
    const parsedObject = await cb() as StoryProps[] | string;
    
    if(parsedObject?.length){
      if(endIndex < parsedObject?.length){
        pages.next = {
          page: +page + 1,
          limit: +limit
        }
      }

      if(startIndex > 0){
        pages.previous = {
          page: +page - 1,
          limit: +limit
        }
      }
      const result = parsedObject as StoryProps[]  
      return {pages, result}
    }
    const result = parsedObject as string
    return result
  }
  catch(error){
    console.log(error)
  }
}

export type PagedTypeResponse = Awaited<ReturnType<typeof pagination>>

/**
 * @description function to autodelete a taskbin when expired
 * @param userId 
 * @returns null
 */
export async function autoDeleteOnExpire(userId: string) {
  const {day} = timeConverterInMillis()
  const expireAfterThirtyDays = day * 30
  const currentTime = new Date()
  if(!userId) return
  else{
    const task = await TaskBinModel.findOne({userId})
    if(!task?.updatedAt) return
    const elaspedTime = +currentTime - +task?.updatedAt
    if(elaspedTime > expireAfterThirtyDays){
      await TaskBinModel.findOneAndUpdate({userId}, {$set: { taskBin: [] }})
      return
    }
    return
  }
}

/**
 * @description function to generate otp
 * @param MAXLENGTH size of otp
 * @returns otp
 */
export function generateOTP(MAXLENGTH=6){
  let generatedOTP = ''
  const numberOriginator = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  for(let i = 0; i < MAXLENGTH; i++){
    const randomIndex: number = Math.ceil(Math.random() * numberOriginator?.length - 1)
    generatedOTP += numberOriginator[randomIndex]
  }
  return generatedOTP
}

export function checksExpiration(createdTime:string): boolean {
  const EXPIRES_IN_30_MINUTES = 30 * 60 * 1000 // 30 minutes
  const presentTime = new Date()
  if(!createdTime) return
  const elaspedTime = +presentTime - +createdTime
  return elaspedTime > EXPIRES_IN_30_MINUTES ? true : false
}

export function mongooseError<T>(cb: () => T | T[]): T | T[] {
  try{
    const data = cb() as T | T[]
    return data
  }
  catch(error){
    console.log('An error occurred')
  }
}
