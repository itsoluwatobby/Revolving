import jwt from 'jsonwebtoken'
import { sub } from 'date-fns';
import { Response } from 'express';
import { Model, Types, Document } from 'mongoose';
import { TaskBinModel } from '../models/TaskManager.js';
import { ClaimProps, ObjectUnknown, PaginationType, ResponseType, StoryProps, USERROLES } from '../../types.js';

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
    data !== null ? 
        res.status(status).json({pages, meta:{status, count, message}, data})
            : res.status(status).json({meta:{status, message}})
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

type ModelType<T> = Model<T, {}, {}, {}, Document<unknown, {}, T> & T & {
  _id: Types.ObjectId;
}, any>

type FuncArgsType = { 
  skip: number, 
  limit: number, 
  query?: string 
}

type PageRequest<T, K> = {
  itemsLength: number, 
  Models: ModelType<T>, 
  callback: () => Promise<T[]>, 
  // callback: ({skip, limit, query}: FuncArgsType) => T[], 
  query?: string
  page: number,
  limit: number,
}

// not so correct version --- CORRECT VERSION BELOW
export const pagination = async<T, K>({page, limit, Models, callback, query='nil'}: PageRequest<T, K>) => {
  
  const count = limit
  const currentPage = page
  const startIndex = (currentPage * count) - count 
  const resultLength = await Models.find().count()
  const data  = await callback()
  // const data = await Models.find().skip(startIndex).limit(count)
  // {skip: startIndex, limit: count, query}

  const total = Math.ceil(resultLength / count)
  const pageable = {
    pages: {
      previous: (currentPage === 1 || currentPage > total || currentPage < 1) ? 'Non' : currentPage - 1,
      currentPage,
      next: (currentPage === total || currentPage > total || currentPage < 1) ? 'Non' : currentPage + 1,
    },
    count: data?.length,
    pagesLeft: (currentPage > total || currentPage < 1) ? 'Non' : total - currentPage,
    numberOfPages: total,
  }
  // if(currentPage > total || currentPage < 1) 
  // return { message: currentPage < 1 ? 'Pages starts from 1' : 'Pages exceeded', pageable }
  return { pageable, data };
}
export type PagedTypeResponse = Awaited<ReturnType<typeof pagination>>

// correct pagination version
const pagination = async (pageNumber, limit, Model, queryObj = {}, selections = '') => {
  const dataLength = +limit;
  const currentPage = +pageNumber;
  const startIndex = (currentPage * dataLength) - dataLength;
  const resultLength = await Model.find(queryObj).countDocuments();
  const data = await Model.find(queryObj).select(selections).skip(startIndex).limit(dataLength);
  //--------- sample for plain arrays ---------------
  // const resultLength = Model.length;
  // const data = Model.slice(startIndex, limit + startIndex);

  const total = Math.ceil(resultLength / dataLength);
  const pagesLeft = total - currentPage;
  const returnedVal = (currentPage > total) || (currentPage < 1);
  const pageable = {
    pages: {
      previous: (currentPage === 1 || returnedVal) ? null : currentPage - 1,
      current: currentPage,
      next: (currentPage === total || returnedVal) ? null : currentPage + 1,
    },
    length: data?.length,
    pagesLeft: pagesLeft >= 0 ? pagesLeft : 0,
    numberOfPages: total,
  };
  return { pageable, data };
};

function timeConverterInMillis() {
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  return {minute, hour, day}
}

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

 /**
   * @description checks token expiration time
   * @param req - createdTime
  */ 
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
