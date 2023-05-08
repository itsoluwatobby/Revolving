import { Schema, model } from 'mongoose';
import { SharedProps } from '../../types.js';

const SharedStorySchema: Schema = new Schema(
   {
      sharerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
      storyId: { type: Schema.Types.ObjectId, ref: 'story', required: true },
      sharedDate: { type: String, required: true, default: '' },
      sharedStory: { type: Object, required: true, default: {} },
   },
   {
      minimize: false,
      timestamps: true
   }
)

export const SharedStoryModel = model<SharedProps>('sharedStories', SharedStorySchema);

