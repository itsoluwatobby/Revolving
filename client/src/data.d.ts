type StoryProps = {
  userId: Types.ObjectId
  title: string
  picture: string
  body: string
  storyDate: string
  category: 'General' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'
  commentIds?: string[]
  isShared?: string[]
  likes: string[]
  edited: false
  editDate: string
}

type USERROLES = number
type ALLOWEDROLES = Record<string, USERROLES>

interface ClaimProps{
  roles: USERROLES[],
  email: string
}

interface SharedProps{
  sharerId: string,
  storyId: string,
  sharedDate: string,
  sharedStory: object
}


type UserProps={
  _id: string,
  username: string,
  email: string,
  description: string,
  password: string,
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
  hobbies?: string[],
  status: 'online' | 'offline',
  refreshToken: string,
  editDate: string
}

interface ErrorResponse{
  response:{ status: number }
}

type AuthType={
  _id: string,
  accessToken: string,
  roles: USERROLES[]
}

type AuthenticationContextType={
  auth: AuthType,
  userSession?: boolean,
  persistLogin: boolean,
  setAuth: React.Dispatch<React.SetStateAction<AuthType>>,
  setPersistLogin: React.Dispatch<React.SetStateAction<boolean>>
}

