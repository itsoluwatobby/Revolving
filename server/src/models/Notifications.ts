import { Schema, model } from 'mongoose'
import { NotificationModelType } from '../../types.js'

const NotificationBody = new Schema(
  {
    notify: { type: Object, default: {} },
    hasRead: { type: Boolean, default: false },
    status: { type: String, default: 'unread' , enum: ['read', 'unread']},
    notificationType: { type: String, enum: ['Subcribe', 'NewPost', 'Follow', 'Likes', 'Comment', 'Message', 'Tagged', 'SharedStory', 'CommentLikes'] },
  },
  {
    timestamps: true
  }
)

const NotificationsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: [true, 'userId required'], unique: [true, 'Already exist'] },
    isNotificationOpen: { type: Boolean, default: false },
    notification: [NotificationBody]
  },
  {
    timestamps: true
  }
)

export const NotificationModel = model<NotificationModelType>('notifications', NotificationsSchema)