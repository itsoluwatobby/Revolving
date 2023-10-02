import { Schema, model } from 'mongoose';
const SocialMedia = new Schema({
    name: { type: String, default: '' },
    link: { type: String, default: '' }
});
const EachSubscriptions = { createdAt: String, subscriberId: String };
const SubscriptionsTo = { createdAt: String, subscribeRecipientId: String };
const Followers = { createdAt: String, followerId: String };
const Follows = { createdAt: String, followRecipientId: String };
const USERSCHEMA = new Schema({
    username: { type: String, required: [true, 'Username is required'], trim: true },
    password: { type: String, required: [true, 'Password is required'], select: false, trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, min: 5, trim: true },
    userSession: { type: String, default: '' },
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    roles: {
        type: Array,
        default: 1120
    },
    registrationDate: { type: String, default: '' },
    displayPicture: {
        coverPhoto: { type: String, default: '' },
        photo: { type: String, default: '' },
    },
    isAccountActivated: { type: Boolean, default: false },
    isAccountLocked: { type: Boolean, default: false },
    dateLocked: { type: String, default: '' },
    isResetPassword: { type: Boolean, default: false },
    verificationToken: {
        type: { type: String, default: 'LINK', enum: ['LINK', 'OTP'] },
        token: { type: String, default: '' },
        createdAt: { type: String, default: '' }
    },
    followers: [Followers],
    followings: [Follows],
    lastSeen: { type: String, default: '' },
    hobbies: { type: Array, default: [] },
    status: { type: String, default: 'offline', enum: ['online', 'offline'] },
    refreshToken: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    gender: { type: String, enum: ['Female', 'Male', 'Others', 'Undecided'] },
    taskIds: { type: Array, default: [] },
    notificationSubscribers: [EachSubscriptions],
    subscribed: [SubscriptionsTo],
    stack: { type: Array, default: [] },
    socialMediaAccounts: [SocialMedia],
    notificationId: { type: String, default: '' },
    country: { type: String, default: '' },
}, {
    minimize: false,
    timestamps: true
});
export const UserModel = model('users', USERSCHEMA);
//# sourceMappingURL=User.js.map