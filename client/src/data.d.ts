import { ChangeEvent, FormEvent } from "react"

type Categories = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'

type StoryProps = {
  _id: string
  userId: string
  title: string
  picture: string
  body: string
  storyDate: string
  category: Categories[]
  commentIds?: string[]
  isShared?: string[]
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
  likes: string, //array of string
  author: string,
  edited: boolean,
  editDate: string,
  commentResponse?: CommentResponseProps[]
}

type CommentResponseProps = Omit<Emerge, 'commentDate' | 'comment' | 'commentResponse' | 'storyId'>

interface Emerge extends CommentProps{
  commentId: string[],
  response: string,
  responseDate: string
}

type USERROLES = number
type ALLOWEDROLES = Record<string, USERROLES>

interface SharedProps{
  sharerId: string,
  storyId: string,
  sharedDate: string,
  sharedStory: object,
  sharedLikes: string[]
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
  socialMediaAccounts: SocialMediaAccoutProp[]
}

type DeleteCommentByAdmin = 'onlyInStory' | 'allUserComment'
type DeleteResponseByAdmin = 'onlyInComment' | 'allUserResponse'

interface ErrorResponse{
  status: number,
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