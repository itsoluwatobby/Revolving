import { Schema, model } from 'mongoose';
import { SharedProps } from '../../types.js';

const SharedStorySchema: Schema = new Schema(
   {
      sharerId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'user ID required'] },
      storyId: { type: Schema.Types.ObjectId, ref: 'story', required: [true, 'story ID required'] },
      sharedDate: { type: String, required: [true, 'date must be added'], default: '' },
      likes: { type: Array, default: [] },
      sharedStory: { type: Object, required: [true, 'target story needs to be added'], default: {} },
   },
   {
      minimize: false,
      timestamps: true
   }
)

export const SharedStoryModel = model<SharedProps>('sharedStories', SharedStorySchema);

