import { Schema, model, Types, Document} from 'mongoose';

interface StoryProps extends Document{
  userId: object | string
  title: string
  picture: string
  body: string
  storyDate: string
  commentIds?: string[]
  isShared?: string[]
  likes: string[]
  edited: false
  editDate: string
}

const STORY_SCHEMA: Schema = new Schema(
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

export const StoryModel = model<StoryProps>('story', STORY_SCHEMA);

export const getAllStories = async() => await StoryModel.find().lean();

export const getStoryById = async(id: string) => await StoryModel.findById(id).exec();

export const getUserStories = async(userId: string) => await StoryModel.find({ userId }).lean()

export const createUserStory = async(story: StoryProps) => await StoryModel.create({ ...story })

export const updateUserStory = async(userId: string, storyId: string, updateStory: StoryProps) => await StoryModel.findByIdAndUpdate({ userId, _id: storyId }, {...updateStory})

export const LikeAndUnlikeStory = async(userId: string, storyId: string) => {
  const story = await StoryModel.findById({ _id: storyId }).exec();
  if(!story?.likes.includes(userId)) {
    await story?.updateOne({ $push: {likes: userId} })
    return 'You like this post'
  }
  else {
    await story?.updateOne({ $pull: {likes: userId} })
    return 'You unliked this post'
  }
}

export const deleteUserStory = async(storyId: string) => await StoryModel.findByIdAndDelete({ _id: storyId })

export const deleteAllUserStories = async(userId: string) => await StoryModel.deleteMany({ userId })