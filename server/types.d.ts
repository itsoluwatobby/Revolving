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
type CodeProps =  { 
  body: string,
  language: string,
  createdAt: string,
  updatedAt: string, 
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
  code: CodeProps[]
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
type Gender = "Female" | "Male" | "Others" | "Undecided"
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

type VerificationTokenType = { 
  token: string, 
  createdAt: string,
  type: ConfirmationMethodType, 
}

type Followers = { createdAt: string, followerId: string }
type Follows = { createdAt: string, followRecipientId: string }

type EachSubs = { createdAt: string, subscriberId: string }
type SubscriptionTo = { createdAt: string, subscribeRecipientId: string }

interface UserProps extends Document{
  email: string,
  gender: Gender,
  country: string,
  stack: string[],
  lastName: string,
  password: string,
  username: string,
  lastSeen: string,
  taskIds: string[],
  hobbies: string[],
  firstName: string,
  roles: USERROLES[],
  dateLocked: string,
  description: string,
  userSession: string,
  refreshToken: string,
  followers?: Followers[],
  followings?: Follows[],
  displayPicture: {
    coverPhoto: string, 
    photo: string
  },
  registrationDate: string,
  isAccountLocked: boolean,
  isResetPassword: boolean,
  isAccountActivated: boolean,
  subscribed: SubscriptionTo[],
  status: 'online' | 'offline',
  notificationSubscribers: EachSubs[],
  verificationToken: VerificationTokenType,
  socialMediaAccounts: SocialMediaAccoutProp[],
  createdAt: string,
  updatedAt: string
}

type SubUser = {
  _id: string, 
  subDate: string,
  lastName: string, 
  firstName: string, 
  description: string, 
  followers: Followers[], 
  followings: Follows[], 
  displayPicture: string,
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

type GetFollowsType = {
  follows: SubUser[],
  followers: SubUser[]
}
 
type GetSubscriptionType = {
  subscriptions: SubUser[],
  subscribed: SubUser[]
}
