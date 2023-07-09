import { Schema, model } from 'mongoose';
import { StoryProps } from '../../types.js';

const STORYSCHEMA: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', required: [true, 'you need to provide a user ID'] 
    },
    title: { type: String, required: [true, 'story title is required'], trim: true },
    picture: { type: Array, default: [] },
    body: { type: String, required: [true, 'story body is required'], trim: true },
    commentIds: { type: Array, default: [] },
    category: { 
      type: Array, required: true, 
      default: []
    },
    isShared: { type: Array, default: [] },
    likes: { type: Array, default: [] },
    fontFamily: { type: String, default: 'open_sans' },
    edited: { type: Boolean, default: false },
    author: { type: String, default: '' }
  },
  { 
    minimize: false, 
    timestamps: true 
  }
)

export const StoryModel = model<StoryProps>('story', STORYSCHEMA);

//enum: ['General', 'Web Development', 'React', 'Node', 'Bash scripting']