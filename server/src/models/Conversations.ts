import { Schema, model } from "mongoose";
import { ConversationModelType } from "../../types.js";

const ConversationSchema = new Schema(
  {
    members: {type: Array, default: []},
    adminId: {type: Schema.Types.ObjectId, ref: 'users', unique: true},
    isOpened: {type: Boolean, default: false},
  },
  {
    minimize: false, 
    timestamps: true
  }
)

export const conversationModel = model<ConversationModelType>('conversation', ConversationSchema)
