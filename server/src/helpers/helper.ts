import { sub } from 'date-fns';
import jwt from 'jsonwebtoken'
import { ClaimProps, ObjectUnknown, PageRequest, PagesType, ResponseType, StoryProps, USERROLES } from '../../types.js';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { Request, Response } from 'express';

type ReqOpt = {
  mtd: string,
  url: string
}

type UrlObj={
  req: ReqOpt,
  urls: ReqOpt[],
  pushIn: () => void,
  pullIt: () => void,
  reset: () => void
}

export const dateTime = sub(new Date, { minutes: 0 }).toISOString();

export const signToken = async(claim: ClaimProps, expires: string, secret: string) => {
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

export const verifyToken = async(token: string, secret: string): Promise<string | ClaimProps> => {
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
// type ResMessage = {
//   res: Response,
//   status: number,
//   message: string,
//   data?: object
// }
export const responseType = ({res, status=200, count=0, message='success', data={}, pages={}}): ResponseType => {
  return (
    data ? 
        res.status(status).json({pages, meta:{status, count, message}, data})
            : res.status(status).json({meta:{status, message}, data})
  )
}

class UrlsObj{

  private req: ReqOpt;
  private urls: ReqOpt[];

  constructor(){
    this.req = { mtd: '', url: '' };
    this.urls = [];
  }

  isPresent(reqUrl: string[]): boolean{
    const present = this.urls.find(url => reqUrl.includes(url.mtd))
    return present ? true : false
  }
  pushIn(reqs: ReqOpt){
    this.req = reqs
    const conflict = this.urls.filter(url => url.url == this.req.url)
    !conflict.length ? this.urls.push(this.req) : null
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

export const transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: process.env.REVOLVING_MAIL,
    pass: process.env.REVOLVING_PASS,
  }
})

type OptionsType = 'account' | 'password'
export const mailOptions = (receiver: string, username: string, verificationLink: string, option: OptionsType = 'account') => {
  return {
    to: receiver,
    from: process.env.REVOLVING_MAIL,
    subject: `ACCOUNT CONFIRMATION FOR ${username}`,
    html: `<div style='padding: 5px; background-color: #696969; border-radius: 5px; box-shadow: 2px 4px 16px rgba(0,0,0,0.4);'>
            <h2 style='text-decoration: underline; text-shadow: 2px 2px 10px rgba(0,0,0,0.3);'>Tap the Link below To ${option == 'account' ? 'Activate Your Account' : 'Reset Your Password'}</h2><br/>
                <p>Link expires in 30 minutes, please confirm now!!</p>
                <a href=${verificationLink} target=_blank style='text-decoration:none;'>
                   <button style='padding:1rem; padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: teal; border:none; border-radius:10px; font-size: 18px'>
                      ${option == 'account' ? 'Account Verification' : 'Reset Password'}
                   </button>
                </a>
                <p>Or copy the link below to your browser</p>
                <p style='word-break: break-all;'>${verificationLink}</p><br/>
                <span>Keep link private, it contains some sensitive information about you.</span>
            </div>      
          `
  }
}

export const asyncFunc = (res: Response, callback: () => void) => {
  try{
    callback()
  }
  catch(error){
    res.sendStatus(500)
  }
}

export const pagination = async<T>({startIndex=1, endIndex=1, page=1, limit=1, cb}) => {

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

// export function contentFeedAlgorithm<T>(entry: ObjectUnknown<T>[], numLikes=50){
//   const mostLikedPosts = entry?.filter(post => Number(post?.likes) >= numLikes)
//   const otherLikedPosts = entry?.filter(post => Number(post?.likes) < numLikes)

//   shufflePosts(mostLikedPosts)
//   shufflePosts(otherLikedPosts)

//   sortByTime(mostLikedPosts)
//   sortByTime(otherLikedPosts)

//   const combinedPosts = [...mostLikedPosts, ...otherLikedPosts]
//   return combinedPosts
// }

// function shufflePosts<K>(content: ObjectUnknown<K>[]){
//   for(let i = content?.length - 1; i > 0; i--){
//     const j = Math.floor(Math.random() * (i + 1))
//     const temp = content[i]
//     content[i] = content[j]
//     content[j] = temp
//   }
// }

// function sortByTime<K>(content: ObjectUnknown<K>[]){
//   content?.sort((a, b) => Number(b?.createdAt) - Number(a?.createdAt))
// }

