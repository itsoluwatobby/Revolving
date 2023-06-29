import { Schema, model } from 'mongoose';
const SharedStorySchema = new Schema({
    sharerId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user ID required'] },
    storyId: { type: Schema.Types.ObjectId, ref: 'story', required: [true, 'story ID required'] },
    sharedLikes: { type: Array, default: [] },
    author: { type: String, default: '' },
    sharedStory: { type: Object, required: [true, 'target story needs to be added'], default: {} },
}, {
    minimize: false,
    timestamps: true
});
export const SharedStoryModel = model('sharedStories', SharedStorySchema);
//# sourceMappingURL=SharedStory.js.map