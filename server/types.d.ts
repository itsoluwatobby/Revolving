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

type SharedInfo = {
  userId: string,
  sharedId: string
}

interface StoryProps extends Document{
  userId: Types.ObjectId
  title: string
  picture: string[]
  body: string
  fontFamily: string
  category: Categories[]
  commentIds?: string[]
  isShared?: SharedInfo[]
  likes: string[]
  edited: false
  author: string
  sharedAuthor: string
  sharedDate?: string
  createdAt: string
  updatedAt: string
}

type TaskBin = {
  userId: string,
  _id: string,
  taskBin: TaskProp[],
  createdAt: string,
  updatedAt?: string,
}

interface TaskProp{
  _id: string,
  userId: string,
  task: string,
  completed: boolean,
  subTasks?: SubTasks[],
  dateRestored: string,
  edited: boolean,
  createdAt: string,
  updatedAt?: string,
}

interface CommentProps{
  _id: string,
  storyId: string,
  userId: string,
  comment: string,
  likes: string[],
  author: string,
  edited: boolean,
  commentResponse: string[]
  createdAt: string
  updatedAt: string
}

type ConfirmationMethodType = 'LINK' | 'OTP'
type CommentResponseProps = Omit<Emerge, 'commentDate' | 'comment' | 'commentResponse' | 'storyId'>

interface Emerge extends CommentProps{
  responseTags: string[],
  commentId: string,
  response: string,
  responseId?: string
}

interface SharedProps extends Document{
  sharerId: string,
  storyId: string,
  sharedLikes: string[],
  sharedAuthor: string,
  sharedStory: StoryProps,
  createdAt: string,
  updatedAt: string
}

type SocialMediaAccoutProp = {
  name: string,
  link: string
}

interface UserProps extends Document{
  username: string,
  email: string,
  description: string,
  password: string,
  userSession: string,
  roles: USERROLES[],
  registrationDate: string,
  displayPicture: {
    coverPhoto: string, 
    photo: string
  },
  isAccountActivated: boolean,
  isAccountLocked: boolean,
  isResetPassword: boolean,
  verificationToken: { type: ConfirmationMethodType, token: string, createdAt: string },
  dateLocked: string,
  followers?: string[],
  followings?: string[],
  lastSeen: string,
  hobbies: string[],
  status: 'online' | 'offline',
  refreshToken: string,
  gender: 'Female' | 'Male' | 'Others',
  firstName: string,
  lastName: string,
  stack: string[],
  country: string,
  taskIds: string[]
  socialMediaAccounts: SocialMediaAccoutProp[],
  notificationSubscribers: string[],
  createdAt: string,
  updatedAt: string
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

type ObjectUnknown<K>={
  [index: string]: K | string,
  createdAt: string,
  likes: string[]
}
