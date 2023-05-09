import { Schema, model } from 'mongoose';
import { StoryProps } from '../../types.js';

const STORYSCHEMA: Schema = new Schema(
  {
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
      type: String, required: true, 
      default: 'General',
      enum: ['General', 'Web Development', 'React', 'Node', 'Bash scripting']
    },
    isShared: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    edited: { type: Boolean, default: false },
    editDate: { type: String, default: '' },
  },
  { 
    minimize: false, 
    timestamps: true 
  }
)

export const StoryModel = model<StoryProps>('story', STORYSCHEMA);
