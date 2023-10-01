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
  email: string,
  roles: USERROLES[],
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
  body: string
  title: string
  edited: false
  author: string
  likes: string[]
  picture: string[]
  code: CodeProps[]
  createdAt: string
  updatedAt: string
  fontFamily: string
  sharedDate?: string
  sharedAuthor: string
  commentIds?: string[]
  userId: Types.ObjectId
  category: Categories[]
  isShared?: SharedInfo[]
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
  task: string,
  userId: string,
  edited: boolean,
  createdAt: string,
  completed: boolean,
  updatedAt?: string,
  dateRestored: string,
  subTasks?: SubTasks[],
}

interface CommentProps{
  _id: string,
  userId: string,
  author: string,
  likes: string[],
  edited: boolean,
  storyId: string,
  comment: string,
  updatedAt: string,
  createdAt: string,
  commentResponse: string[]
}

type ConfirmationMethodType = 'LINK' | 'OTP'
type Gender = "Female" | "Male" | "Others" | "Undecided"
type CommentResponseProps = Omit<Emerge, 'commentDate' | 'comment' | 'commentResponse' | 'storyId'>

interface Emerge extends CommentProps{
  response: string,
  commentId: string,
  responseId?: string,
  responseTags: string[],
}

interface SharedProps extends Document{
  storyId: string,
  sharerId: string,
  createdAt: string,
  updatedAt: string,
  sharedAuthor: string,
  sharedLikes: string[],
  sharedStory: StoryProps,
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
  createdAt: string,
  updatedAt: string,
  hobbies: string[],
  firstName: string,
  roles: USERROLES[],
  dateLocked: string,
  description: string,
  userSession: string,
  refreshToken: string,
  notificationId: string,
  followings?: Follows[],
  followers?: Followers[],
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
}

type SubUser = {
  _id: string, 
  subDate: string,
  lastName: string, 
  firstName: string, 
  description: string, 
  followings: Follows[], 
  followers: Followers[], 
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

// NOTIFICATION OBJECT MODELS
type NewStoryNotificationType = {
  body: string, 
  title: string, 
  author: string,
  userId: string,
  likes: string[], 
  picture: string,
  commentIds: string[],
  _id: string | ObjectId, 
  category: Categories[], 
}

type FollowNotificationType = {
  userId: string | ObjectId,
  fullName: string,
  displayPicture: string
}

type SubscribeNotificationType = FollowNotificationType

type MessageNotificationType = FollowNotificationType

type CommentNotificationType = FollowNotificationType & {storyId: string, title: string}

type LikeNotificationType = CommentNotificationType

// All notification model types
type AllNotificationModelType = NewStoryNotificationType | FollowNotificationType | SubscribeNotificationType | MessageNotificationType | CommentNotificationType | LikeNotificationType

// Notification
type NotificationType = 'Subcribe' | 'NewStory' | 'Follow' | 'Likes' | 'Comment' | 'Message' | 'Tagged' | 'SharedStory'

type NotificationBody = {
  _id: ObjectId | string,
  hasRead: boolean,
  notificationType: NotificationType,
  notify: { [key: string]: string | number | Categories[] | string[] },
  createdAt: string,
  updatedAt: string
}

interface NotificationModelType{
  _id: ObjectId | string,
  userId: ObjectId | string,
  isNotificationOpen: boolean,
  notification: NotificationBody[],
  createdAt: string,
  updatedAt: string
}

interface NewUserProp extends Request{
  username: string,
  email: string,
  password: string,
  userId: string,
  type: ConfirmationMethodType
}

interface QueryProps extends Request{token: string}
interface EmailProps extends Request{
  email: string,
  resetPass: string
}

interface RequestProp extends Request{
  userId: string,
  storyId: string,
  commentId: string,
  // newComment: CommentProps
};

interface RequestStoryProp extends Request{
  userId: string,
  storyId: string,
  category: Categories
};

