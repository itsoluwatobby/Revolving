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
  edited: false,
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

type HoverType = 'unfollow' | 'following'
type PositionType = 'navbar' | 'others'
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
  isResetPassword: boolean,
  verificationToken: { type: string, token: string, createdAt: string },
  dateLocked: string,
  followers?: string[],
  followings?: string[],
  lastSeen: string,
  hobbies: string[],
  status: 'online' | 'offline',
  refreshToken: string,
  editDate: string,
  gender: Gender,
  firstName: string,
  lastName: string,
  stack: string[],
  country: string,
  socialMediaAccounts: SocialMediaAccoutProp[],
  notificationSubscribers: string[],
  subscribed: string[],
  createdAt: string,
  updatedAt: string
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
  follows: Partial<UserProps[]>,
  followers: Partial<UserProps[]>
}

type GetSubscriptionType = {
  subscriptions: Partial<UserProps[]>,
  subscribed: Partial<UserProps[]>
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
