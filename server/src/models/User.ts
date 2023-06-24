import { Schema, model} from 'mongoose';
import { UserProps } from '../../types.js';

const USERSCHEMA: Schema = new Schema(
  {
    username: { type: String, required: [true, 'Username is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, min: 5, trim: true },
    description: { type: String, default: '', trim: true },
    authentication: {
      password: { type: String, required: [true, 'Password is required'], select: false, trim: true },
      sessionID: { type: String, default: '' }
    },
    roles: { 
      type: Array, 
      default: 1120
    },
    registrationDate: { type: String, default: '' },
    displayPicture: { type: String, default: '' },
    isAccountActivated: { type: Boolean, default: false },
    isAccountLocked: { type: Boolean, default: false },
    dateLocked: { type: String, default: '' },
    isResetPassword: { type: Boolean, default: false },
    verificationToken: { type: String, default: '' },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    lastSeen: { type: String, default: '' },
    hobbies: { type: Array, default: [] },
    status: { type: String, default: 'offline', enum: ['online', 'offline'] },
    refreshToken: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, default: '' },
    gender: { type: String, enum: ['Female', 'Male', 'Others'] },
    codeName: { type: String, default: '', trim: true },
    stack: { type: Array, default: [] },
    socialMediaAccounts: { type: Array, default: [] },
    country: { type: Array, default: '' },
  },
  { 
    minimize: false, 
    timestamps: true 
  }
)

export const UserModel = model<UserProps>('users', USERSCHEMA);
