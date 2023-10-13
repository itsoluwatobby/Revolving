import { Request, Response } from "express"
import { VerifyOptions } from "jsonwebtoken"
import { Document, FlattenMaps, ObjectId, Types } from "mongoose"
import { type } from "os"

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
  // _id: ObjectId | string
  body: string
  title: string
  edited: boolean
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
type LastMessageType = { _id: string, createdAt: string, message: string }
type Status = 'online' | 'offline'

interface UserProps extends Document{
  email: string,
  gender: Gender,
  status: Status,
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
  lastConversationId: string,
  isAccountActivated: boolean,
  lastMessage: LastMessageType,
  subscribed: SubscriptionTo[],
  notificationSubscribers: EachSubs[],
  verificationToken: VerificationTokenType,
  socialMediaAccounts: SocialMediaAccoutProp[],
}

type SubUser = {
  _id: string, 
  email: string,
  status: Status,
  subDate: string,
  lastName: string,
  lastSeen: string,
  firstName: string, 
  description: string, 
  followings: Follows[], 
  followers: Followers[], 
  displayPicture: string,
}

type UserFriends = {
  _id: string, 
  status: Status,
  email?: string,
  lastName: string,
  lastSeen: string,
  firstName: string, 
  displayPicture: string,
}

type PagesType = {
  previous: string | number;
  currentPage: number;
  next: string | number;
};

type PaginationType = {
  pages: PagesType
  count: any;
  pagesLeft: string | number;
  numberOfPages: number;
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
type NotificationType = 'Subcribe' | 'NewStory' | 'Follow' | 'Likes' | 'Comment' | 'Message' | 'Tagged' | 'SharedStory' | 'CommentLikes'
type NotificationStatus = 'unread' | 'read'
type NotificationBody = {
  _id: ObjectId | string,
  hasRead: boolean,
  status: NotificationStatus,
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

interface ConversationModelType{
  _id: ObjectId | string,
  adminId: string | ObjectId,
  isOpened: boolean,
  members: string[],
  createdAt: string,
  updatedAt: string,
  membersOpen: {
    adminOpened: boolean,
    clientOpened: boolean
  }
}

interface MessageModelType{
  _id: ObjectId | string,
  conversationId:  ObjectId | string, 
  senderId:  ObjectId | string,
  receiverId:  ObjectId | string, 
  author: string,
  message: string,
  displayPicture: string,
  referencedMessage: Omit<MessageModelType, 'referencedMessage'>,
  isDelivered: boolean,
  isMessageRead: NotificationStatus,
  isMessageDeleted: string[],
  pictures: string[],
  createdAt: string,
  updatedAt: string,
  isDeleted: boolean,
  edited: boolean,
}

type MessageStatus = 'DELIVERED' | 'READ'

type GetConvoType = {
  _id: string | FlattenMaps<ObjectId>, 
  email: string,
  status: Status,
  lastName: string,
  lastSeen: string,
  firstName: string, 
  displayPicture: string,
  userId: ObjectId | string,
  adminId: string | ObjectId,
  lastMessage: LastMessageType,
  isOpened: boolean,
  members: string[],
  membersOpen: {
    adminOpened: boolean,
    clientOpened: boolean
  }
  createdAt: string,
  updatedAt: string
}

type DeleteChatOption = 'forMe' | 'forAll'