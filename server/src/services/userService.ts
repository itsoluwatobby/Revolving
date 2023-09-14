import { UserProps } from "../../types.js";
import { UserModel } from "../models/User.js";
import StoryServiceInstance from "./StoryService.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import { userInfo } from "os";

export class UserService{

  constructor(){}
  async getAllUsers(){
    return await UserModel.find().lean();
  }

  async getUserById(id: string){
    return await UserModel.findById(id).exec();
  }
  async getUserByEmail(email: string){
    return await UserModel.findOne({email}).exec();
  }
  async getUserByToken(token: string){
    return await UserModel.findOne({refreshToken: token}).exec();
  }
  async getUserByVerificationToken(token: string){
    return await UserModel.findOne({ verificationToken: { token } }).exec();
  }

  async createUser(user: Partial<UserProps>){
    const newUser = await UserModel.create(user)
    await TaskBinModel.create({
      userId: newUser?._id, taskBin: []
    })
    return newUser 
  }

  async updateUser(userId: string, updatedUser: UserProps){
    return await UserModel.findByIdAndUpdate({ _id: userId }, updatedUser, {new: true})
  }

  async followOrUnFollow(followerId: string, followingId: string): Promise<string>{
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

  async deleteAccount(userId: string): Promise<void>{
    await UserModel.findByIdAndDelete({ _id: userId })
    await StoryServiceInstance.deleteAllUserStories(userId)
    await TaskManagerModel.deleteOne({userId})
  }
}

export default new UserService()