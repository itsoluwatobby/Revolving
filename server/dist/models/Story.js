import { Schema, model } from 'mongoose';
const STORYSCHEMA = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users', required: true
    },
    title: { type: String, required: true },
    picture: { type: String, default: '' },
    body: { type: String, required: true },
    storyDate: { type: String, required: true, default: '' },
    commentIds: { type: Array, default: [] },
    isShared: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    edited: { type: Boolean, default: false },
    editDate: { type: String, default: '' },
}, {
    minimize: false,
    timestamps: true
});
export const StoryModel = model('story', STORYSCHEMA);
//# sourceMappingURL=Story.js.map