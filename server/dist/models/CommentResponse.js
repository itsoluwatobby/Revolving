import { Schema, model } from "mongoose";
const CommentResponseSchema = new Schema({
    commentId: { type: Schema.Types.ObjectId, ref: 'comments', required: [true, 'comment id required'] },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user id required'] },
    likes: { type: Array, default: [] },
    response: { type: String, default: '' },
    responseDate: { type: String, default: '' },
    author: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, required: [true, 'comment edit date required'], default: '' }
}, {
    minimize: false,
    timestamps: true
});
export const CommentResponseModel = model('commentResponse', CommentResponseSchema);
//# sourceMappingURL=CommentResponse.js.map