import { Request, Response } from "express"
import { VerifyOptions } from "jsonwebtoken"
import { Document, ObjectId, Types } from "mongoose"

// interface Environment_Env{
//   REVOLVING_DB: string,
//   ROUTELINK: string,
//   SESSION_SECRET: string,
//   REFRESH_STORY_SECRET: string,
//   ACCOUNT_VERIFICATION_SECRET: string,

// }
// // declare namespace NodeJS{
  // -------------------------------
// declare global{
//   namespace NodeJS{
//     interface ProcessEnv extends Environment_Env{}
//   }
// }

type USERROLES = number
type ALLOWEDROLES = Record<string, USERROLES>

interface ClaimProps extends JwtPayload{
  roles: USERROLES[],
  email: string
}

type Categories = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'

// interface StoryType{
//   userId: Types.ObjectId
//   title: string
//   picture: string
//   body: string
//   fontFamily: string
//   storyDate: string
//   category: Categories
//   commentIds?: string
//   isShared?: string
//   likes: string
//   edited: false
//   editDate: string
// }

type SharedInfo = {
  userId: string,
  sharedId: string
}

interface StoryProps extends Document{
  userId: Types.ObjectId
  title: string
  picture: string
  body: string
  fontFamily: string
  storyDate: string
  category: Categories[]
  commentIds?: ObjectId[]
  isShared?: SharedInfo[]
  likes: string[]
  edited: false
  editDate: string
  author: string
}

interface CommentProps{
  _id: string,
  storyId: string,
  userId: string,
  commentDate: string,
  comment: string,
  likes: string[],
  author: string,
  edited: boolean,
  editDate: string,
  commentResponse: CommentResponseProps[]
}

type CommentResponseProps = Omit<Emerge, 'commentDate' | 'comment' | 'commentResponse' | 'storyId'>

interface Emerge extends CommentProps{
  commentId: string[],
  response: string,
  responseDate: string
}

interface SharedProps extends Document{
  sharerId: string,
  storyId: string,
  sharedDate: string,
  sharedLikes: string[],
  author: string,
  sharedStory: StoryProps,
}

type SocialMediaAccoutProp = {
  media: string,
  link: string
}

interface UserProps extends Document{
  username: string,
  email: string,
  description: string,
  authentication: {
    password: string,
    sessionID: string
  },
  roles: USERROLES[],
  registrationDate: string,
  displayPicture: string,
  isAccountActivated: boolean,
  isAccountLocked: boolean,
  isResetPassword: boolean,
  verificationToken: string,
  dateLocked: string,
  followers?: string[],
  followings?: string[],
  lastSeen: string,
  hobbies: string[],
  status: 'online' | 'offline',
  refreshToken: string,
  editDate: string,
  gender: 'Female' | 'Male' | 'Others',
  codeName: string,
  stack: string[],
  country: string,
  socialMediaAccouts: SocialMediaAccoutProp[]
}

interface PageRequest extends Request{
  page: number,
  limit: number
}

type PagesType = {
  next?: { 
    page: number, limit: number 
  },
  previous?: { 
    page: number, limit: number 
  }
}

interface ResponseType extends Response{
  pages: PagesType,
  meta: {
    status: number,
    count?: number,
    message?: string
  },
  data?: object
}
