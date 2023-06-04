import { Schema, model } from "mongoose";
const CommentSchema = new Schema({
    storyId: { type: Schema.Types.ObjectId, ref: 'story', required: [true, 'story id required'] },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user id required'] },
    likes: { type: Array, default: [] },
    comment: { type: String, default: '' },
    commentDate: { type: String, default: '' },
    author: { type: String, default: '' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, required: [true, 'comment edit date required'], default: '' },
    commentResponse: { type: Array, ref: 'commentResponse', default: [] }
}, {
    minimize: false,
    timestamps: true
});
export const CommentModel = model('comments', CommentSchema);
//# sourceMappingURL=CommentModel.js.map