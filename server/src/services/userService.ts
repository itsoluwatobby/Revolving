import { UserProps } from "../../types.js";
import { UserModel } from "../models/User.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { deleteAllUserStories } from "./StoryService.js";


  export async function getAllUsers(){
    return await UserModel.find().lean();
  }

  export async function getUserById(id: string){
    return await UserModel.findById(id).exec();
  }
  export async function getUserByEmail(email: string){
    return await UserModel.findOne({email}).exec();
  }
  export async function getUserByToken(token: string){
    return await UserModel.findOne({refreshToken: token}).exec();
  }
  export async function getUserByVerificationToken(token: string){
    return await UserModel.findOne({ verificationToken: { token } }).exec();
  }

  export async function createUser(user: Partial<UserProps>){
    const newUser = await UserModel.create(user)
    await TaskBinModel.create({
      userId: newUser?._id, taskBin: []
    })
    return newUser 
  }

  export async function updateUser(userId: string, updatedUser: UserProps){
    return await UserModel.findByIdAndUpdate({ _id: userId }, updatedUser, {new: true})
  }

  export async function followOrUnFollow(followerId: string, followingId: string): Promise<string>{
    const user = await UserModel.findById(followerId).exec();
    const following = await UserModel.findById(followingId).exec();
    if(user?._id.toString() == followingId) return 'duplicate'
    if(!user?.followings?.includes(followingId)) {
      await user?.updateOne({ $push: {followings: followingId} })
      await following?.updateOne({ $push: {followers: followerId} })
      return 'You followed this user'
    }
    else {
      await user?.updateOne({ $pull: {followings: followingId} })
      await following?.updateOne({ $pull: {followers: followerId} })
      return 'You unfollowed this user'
    }
  }

  export async function deleteAccount(userId: string): Promise<void>{
    await UserModel.findByIdAndDelete({ _id: userId })
    await deleteAllUserStories(userId)
    await TaskManagerModel.deleteOne({userId})
  }
