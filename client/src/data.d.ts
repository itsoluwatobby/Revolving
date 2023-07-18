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

type StoryProps = {
  _id: string
  userId: string
  title: string
  picture: string[]
  body: string
  category: Categories[]
  commentIds?: string[]
  isShared?: string[]
  likes: string[]
  edited: false
  author: string
  createdAt: string,
  updatedAt: string
}

interface SharedProps extends Document{
  _id: string,
  sharerId: string,
  storyId: string,
  sharedLikes: string[],
  author: string,
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

type OpenSnippet = 'Snippet' | 'Image' | 'Nil'
type CreatePrompt = 'Hide' | 'Open' | 'Idle' | 'Nil'
type TypingEvent = 'typing' | 'notTyping'
type ButtonType = 'EDIT' | 'DELETE'
type EditTaskOption = 'EDIT' | 'VIEW' | 'NIL'
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
  createdAt: Date,
  updatedAt?: Date,
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
type ALLOWEDROLES = Record<string, USERROLES>

interface SharedProps{
  sharerId: string,
  storyId: string,
  sharedStory: object,
  sharedLikes: string[],
  createdAt: string,
  updatedAt: string
}

type SocialMediaAccoutProp = {
  media: string,
  link: string
}

interface UserProps{
  _id: string,
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
  socialMediaAccounts: SocialMediaAccoutProp[],
  createdAt: string,
  updatedAt: string
}

type ChatProps = {
  _id?: string,
  adminId?: string,
  message: string,
  userId: string,
  dateTime?: string,
  image?: string,
  createdAt?: string
  updatedAt?: string
}

type DeleteCommentByAdmin = 'onlyInStory' | 'allUserComment'
type DeleteResponseByAdmin = 'onlyInComment' | 'allUserResponse'

interface ErrorResponse{
  status: number | string,
  data: {
    meta: {
      message: string
    }
  },
  originalStatus?: number
}
//  FetchBaseQueryError | SerializedError
type AuthType={
  _id: string,
  accessToken: string,
  roles: USERROLES[]
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
  handleUsername: (event: ChangeEvent<HTMLInputElement>) => void,
  handleConfirmPassword: (event: ChangeEvent<HTMLInputElement>) => void,
  setValidEmail: React.Dispatch<React.SetStateAction<boolean>>,
  setValidPassword: React.Dispatch<React.SetStateAction<boolean>>
}