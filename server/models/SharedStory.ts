import mongoose from 'mongoose';
import { getStoryById } from './Story';
import { dateTime } from '../helpers/helper';

const SharedStorySchema = new mongoose.Schema(
   {
      sharerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'story', required: true },
      sharedDate: { type: String, required: true, default: '' },
      sharedStory: { type: Object, required: true, default: {} },
   },
   {
      minimize: false,
      timestamps: true
   }
)

export const SharedStoryModel = mongoose.model('sharedStories', SharedStorySchema);

export const getSharedStoryById = async(sharedId: string) => await SharedStoryModel.findById(sharedId).exec();

export const shareStory = async(userId: string, storyId: string) => {
  const story = await getStoryById(storyId)
  await SharedStoryModel.create({
    sharerId: userId, storyId: story?._id, sharedDate: dateTime, sharedStory: {...story}
  })
  await story?.updateOne({$push: { isShared: userId }});
}

export const unShareStory = async(userId: string, sharedId: string) => {
  const story = await getStoryById(sharedId)
  const sharedStory = await getSharedStoryById(sharedId)
  await sharedStory?.deleteOne();
  await story?.updateOne({ $pull: { isShared: userId } });
}
