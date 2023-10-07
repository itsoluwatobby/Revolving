import { Schema, model } from "mongoose";
import { MessageModelType } from "../../types.js";


const MessagesSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'conversations', required: [true, 'conversationId required'] }, 
    senderId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'senderId required'] }, 
    receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'receiverId required'] }, 
    author: { type: String, default: '', trim: true },
    message: { type: String, default: '' },
    displayPicture: { type: String, default: '' },
    referencedMessage: {type: Object, default: {}},
    isDelivered: {type: Boolean, default: false},
    isMessageRead: {type: String, default: 'unread', enum: ['read', 'unread']},
    isMessageDeleted: {type: Array, default: []},
    pictures: { type: Array, default: [] },
  },
  {
    minimize: false,
    timestamps: true
  }
)

export const MessageModel = model<MessageModelType>('messages', MessagesSchema)