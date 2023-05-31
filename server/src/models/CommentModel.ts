import { Schema, model } from "mongoose";
import { CommentProps } from "../../types.js";

const CommentSchema: Schema = new Schema(
  {
    storyId: { type: Schema.Types.ObjectId, ref: 'story', required: [true, 'story id required'] },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user id required'] },
    likes: { type: Array, default: [] },
    comment: { type: String, default: '' },
    commentDate: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, required: [true, 'Comment edit required'], default: '' },
  },
  {
    minimize: false,
    timestamps: true
  }
)

export const CommentModel = model<CommentProps>('comments', CommentSchema);
