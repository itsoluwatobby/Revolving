import { VerifyOptions } from "jsonwebtoken"
import { Document, ObjectId } from "mongoose"

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

type USERROLES = number[]
type AllOWEDROLES = Record<string, number>

interface ClaimProps extends JwtPayload{
  roles: USERROLES[],
  email: string
}

interface SharedProps extends Document{
  sharerId: ObjectId | string,
  storyId: ObjectId | string,
  sharedDate: string,
  sharedStory: object
}

interface StoryProps extends Document{
  userId: object | string
  title: string
  picture: string
  body: string
  storyDate: string
  commentIds?: string[]
  isShared?: string[]
  likes: string[]
  edited: false
  editDate: string
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
  isAccountActive: boolean,
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
  editDate: string
}
