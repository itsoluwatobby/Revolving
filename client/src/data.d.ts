import { ChangeEvent, FormEvent } from "react"

type FontProp = {
  [index: string] : string
}

type Button = 'RESTORE' | 'DELETE';
type Position = 'NAV' | 'NORM';
type FunctionOption = {
  type: 'SINGLE' | 'MULTI',
  taskId?: string
}

type Entries = 'socialMediaEntry' | 'hobbiesEntry' | 'stackEntry'
type ValueType = 'socialMediaName'


type InitPrevEntriesType = {
  prevHobby: string,
  prevStack: string,
  prevSocialName: string
}

type InitEntriesType = { 
  hobbiesEntry: string, 
  stackEntry: string, 
  socialMediaEntry: string, 
  socialMediaName: string 
}

type TextProp = {
  boldText: string
  italics: string
  functions: string
  highlight: string,
  inbuilts: string[],
  dotWords: string[],
  async: string[],
  dataTypes: string[],
  converters: string[],
  typescript: string[],
  keywords: string[],
  codeBlock: {
    backStrokes: string,
    quotes: string,
    singleQuotes: string,
    operators: string[],
    comments: string[]
  }
}

type Categories = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'
type CodeProps =  { 
  _id?: string,
  body: string,
  codeId?: string,
  language: string,
  createdAt: string,
  updatedAt: string, 
}

type StoryProps = {
  _id: string,
  userId: string,
  title: string,
  picture: string[],
  body: string,
  author: string | 'anonymous',
  likes: string[],
  isShared?: string[],
  category: Categories[],
  fontFamily?: string | 'sans',
  commentIds?: string[],
  code: CodeProps[],
  edited: boolean,
  sharerId?: string,
  sharedId?: string,
  sharedAuthor?: string,
  sharedLikes?: string[],
  sharedDate?: string,
  createdAt: string,
  updatedAt: string
}

interface SharedProps extends Document{
  _id: string,
  sharerId: string,
  storyId: string,
  sharedLikes: string[],
  sharedAuthor: string,
  sharedStory: StoryProps,
  createdAt: string,
  updatedAt: string
}

interface CommentProps{
  _id: string,
  storyId: string,
  userId: string,
  comment: string,
  likes: string[],
  author: string,
  edited: boolean,
  createdAt: string,
  updatedAt: string
  commentResponse: string[]
}

type InputTaskProp = {
  value: string, 
  isTyping?: TypingEvent
}

type ButtonType = 'EDIT' | 'DELETE' | 'CHECK'
type TypingEvent = 'typing' | 'notTyping'

type EditTaskOption = 'EDIT' | 'VIEW' | 'NIL'
type OpenSnippet = 'Snippet' | 'Image' | 'Nil'

type CreatePrompt = 'Hide' | 'Open' | 'Idle' | 'Nil'
type Gender = "Female" | "Male" | "Others" | "Undecided"

type CommentResponseProps = Omit<Emerge, 'commentDate' | 'comment' | 'commentResponse' | 'storyId'>

interface Emerge extends CommentProps{
  responseTags: string[],
  commentId: string,
  response: string,
  responseId?: string
}

type Prompted = {
  type: 'create' | 'edit' | 'delete' | 'response' | 'nil',
  assert: boolean
}

type OpenReply = {
  type: 'reply' | 'edit' | 'nil',
  assert: boolean,
  pos?: 'enlarge'
}

type SubTasks = {
  title: string, 
  body: string,
  completed: boolean
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
  subTasks?: SubTasks[]
  edited: boolean,
  createdAt: string,
  updatedAt?: string,
}

type Positions = 'navbar' | 'profile' | 'followPage' | 'others'

type HoverType = 'unfollow' | 'following'
type PositionType = Positions[]
type OptionType = 'EMAIL' | 'DIRECT'

type EnlargeCompo = {
  type: 'open' | 'enlarge',
  assert: boolean
}

type ObjectUnknown<K>={
  [index: string]: K | string,
  createdAt: string,
  likes: string[]
}

type USERROLES = number

interface SharedProps{
  sharerId: string,
  storyId: string,
  sharedStory: object,
  sharedLikes: string[],
  createdAt: string,
  updatedAt: string
}

type SocialMediaAccoutProp = {
  name: string,
  link: string
}

type Followers = { createdAt: string, followerId: string }
type Follows = { createdAt: string, followRecipientId: string }

type EachSubs = { createdAt: string, subscriberId: string }
type SubscriptionTo = { createdAt: string, subscribeRecipientId: string }
type LastMessageType = { _id: string, createdAt: string, message: string }
type Status = 'online' | 'offline'

interface UserProps{
  _id: string,
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
  lastConversationId: string,
  isResetPassword: boolean,
  verificationToken: { type: string, token: string, createdAt: string },
  dateLocked: string,
  followers?: Followers[],
  followings?: Follows[],
  lastSeen: string,
  hobbies: string[],
  notificationId: string,
  status: Status,
  refreshToken: string,
  lastMessage: LastMessageType,
  editDate: string,
  gender: Gender,
  firstName: string,
  lastName: string,
  stack: string[],
  country: string,
  socialMediaAccounts: SocialMediaAccoutProp[],
  notificationSubscribers: EachSubs[],
  subscribed: SubscriptionTo[],
  createdAt: string,
  updatedAt: string
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

type ChatProps = {
  _id?: string,
  adminId?: string,
  message: string,
  userId: string,
  dateTime?: string, // delete later
  image?: string,
  createdAt?: string,
  updatedAt?: string
}

type ConfirmationMethodType = 'LINK' | 'OTP'
type PageType = 'PROFILE' | 'OTHERS'
type DeleteCommentByAdmin = 'onlyInStory' | 'allUserComment'
type DeleteResponseByAdmin = 'onlyInComment' | 'allUserResponse'
type DataType = { otp: string, expiresIn: string }
type UserDataType = { _id: string, email: string, roles: USERROLES[] }

interface ErrorResponse{
  status: number | string,
  message?: string,
  data: {
    meta: {
      message: string
    }
  },
  originalStatus?: number
}
//  FetchBaseQueryError | SerializedError

type ConfirmType = {
  meta: {
    status: number, nessage: string
  }
}

type AuthType={
  _id: string,
  accessToken: string,
  roles: USERROLES[],
  updatedAt: string
}

type GetFollowsType = {
  follows: SubUser[],
  followers: SubUser[]
}

type GetSubscriptionType = {
  subscriptions: SubUser[],
  subscribed: SubUser[]
}

type ApiSliceType = {
  error?: {
    originalStatus?: number, 
    status?: string | number | "PARSING_ERROR", 
    data?: string
  }, 
  data: object, 
  meta: object
}

type RefreshTokenType = {
  data: {
    data: AuthType
  }, 
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR', 
  error?: string,
  originalStatus?: number
}

type RefreshType = {
  data: AuthType, 
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR', 
  error?: string,
  originalStatus?: number
}

type AuthenticationContextType={
  auth: AuthType,
  userSession?: boolean,
  setAuth: React.Dispatch<React.SetStateAction<AuthType>>
}

interface UserInfoProps{
  email: string,
  password: string,
  revealPassword: boolean,
  loading: boolean,
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void,
  handleEmail: (event: ChangeEvent<HTMLInputElement>) => void,
  handlePassword: (event: ChangeEvent<HTMLInputElement>) => void,
  setRevealPassword: React.Dispatch<React.SetStateAction<boolean>>,
}

interface LoginProps extends UserInfoProps{
  handleChecked: (event: ChangeEvent<HTMLInputElement>) => void,
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
}

interface RegistrationProps extends UserInfoProps{
  match: boolean,
  username: string,
  confirmPassword: string,
  validEmail: boolean,
  validPassword: boolean,
  confirmationBy: ConfirmationMethodType,
  handleUsername: (event: ChangeEvent<HTMLInputElement>) => void,
  handleConfirmPassword: (event: ChangeEvent<HTMLInputElement>) => void,
  setValidEmail: React.Dispatch<React.SetStateAction<boolean>>,
  setValidPassword: React.Dispatch<React.SetStateAction<boolean>>
  setConfirmationBy: React.Dispatch<React.SetStateAction<ConfirmationMethodType>>
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
  _id: string, 
  category: Categories[], 
}

type FollowNotificationType = {
  userId: string,
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
  _id: string,
  hasRead: boolean,
  status: NotificationStatus,
  notificationType: NotificationType,
  notify: { [key: string]: string | number | Categories[] | string[] },
  createdAt: string,
  updatedAt: string
}

interface NotificationModelType{
  _id: string,
  userId: string,
  isNotificationOpen: boolean,
  notification: NotificationBody[],
  createdAt: string,
  updatedAt: string
}

type MembersType = { userId: string, partnerId: string }

type ConversationModelType = {
  _id: string,
  adminId: string,
  members: string[],
  isOpened: boolean,
  createdAt: string,
  updatedAt: string,
  membersOpen?: {
    adminOpened: boolean,
    clientOpened: boolean
  }
}

type MessageModelType = {
  _id: string,
  conversationId:  string, 
  senderId:  string,
  receiverId:  string, 
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

type TypingObjType = {
  firstName: string,
  userId: string,
  status?: boolean,
  conversationId: string
}

type DeleteStatusType = { loading: boolean, errorMsg: boolean }
type SearchStateType = { openSearch: boolean, search: string }
type DeleteChatOption = 'forMe' | 'forAll'

type MessageStatusType = {
  isEdited?: boolean,
  isDeleted?: boolean
  conversationId: string,
}

type ConversationStatusType = {
  isOpened: boolean,
  conversationId: string,
}
