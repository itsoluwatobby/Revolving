import { Schema, model } from 'mongoose';
import { StoryProps } from '../../types.js';

const CodeSchema = new Schema(
  {
    language: { type: String, trim: true },
    body: { type: String, default: '' }
  },
  {
    timestamps: true
  }
)

const STORYSCHEMA: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', required: [true, 'you need to provide a user ID'] 
    },
    title: { type: String, trim: true },
    picture: { type: Array, default: [] },
    body: { type: String, required: [true, 'story body is required'], trim: true },
    commentIds: { type: Array, default: [] },
    category: { 
      type: Array, required: true, 
      default: []
    },
    isShared: { type: Array, default: [] },
    code: [CodeSchema],
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