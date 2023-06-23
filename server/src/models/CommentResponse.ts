import { Schema, model } from "mongoose";
import { CommentResponseProps } from "../../types.js";

const CommentResponseSchema: Schema = new Schema(
  {
    commentId: { type: Schema.Types.ObjectId, ref: 'comments', required: [true, 'comment id required'] },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user id required'] },
    likes: { type: Array, default: [] },
    response: { type: String, default: '' },
    responseDate: { type: String, default: '' },
    author: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, default: '' }
  },
  {
    minimize: false,
    timestamps: true
  }
)

export const CommentResponseModel = model<CommentResponseProps>('commentResponse', CommentResponseSchema);
