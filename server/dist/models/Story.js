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
    category: {
        type: Array, required: true,
        default: 'General'
    },
    isShared: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    fontFamily: { type: String, default: 'open_sans' },
    edited: { type: Boolean, default: false },
    editDate: { type: String, default: '' },
}, {
    minimize: false,
    timestamps: true
});
export const StoryModel = model('story', STORYSCHEMA);
//enum: ['General', 'Web Development', 'React', 'Node', 'Bash scripting']
//# sourceMappingURL=Story.js.map