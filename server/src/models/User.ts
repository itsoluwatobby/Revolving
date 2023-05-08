import { Schema, model} from 'mongoose';
import { UserProps } from '../../types.js';

const USERSCHEMA: Schema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, min: 5 },
    description: { type: String, default: '' },
    authentication: {
      password: { type: String, required: true, select: false },
      sessionID: { type: String, required: true }
    },
    roles: { 
      type: Array, 
      default: [1120],
      enum: [1120, 1159]
    },
    registrationDate: { type: String, default: '' },
    displayPicture: { type: String, default: '' },
    isAccountActive: { type: Boolean, required: true, default: false },
    isAccountLocked: { type: Boolean, default: false },
    dateLocked: { type: String, default: '' },
    isResetPassword: { type: Boolean, default: false },
    verificationLink: { type: String, default: '' },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    lastSeen: { type: String, default: [] },
    hobbies: { type: Array, default: [] },
    status: { type: String, default: 'offline', enum: ['online', 'offline'] },
    refreshToken: { type: String, default: '' },
    editDate: { type: String, default: '' },
  },
  { 
    minimize: false, 
    timestamps: true 
  }
)

export const UserModel = model<UserProps>('users', USERSCHEMA);
