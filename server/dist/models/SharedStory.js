import { Schema, model } from 'mongoose';
const SharedStorySchema = new Schema({
    sharerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    storyId: { type: Schema.Types.ObjectId, ref: 'story', required: true },
    sharedDate: { type: String, required: true, default: '' },
    sharedStory: { type: Object, required: true, default: {} },
}, {
    minimize: false,
    timestamps: true
});
export const SharedStoryModel = model('sharedStories', SharedStorySchema);
//# sourceMappingURL=SharedStory.js.map