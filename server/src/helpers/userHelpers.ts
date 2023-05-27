import { ObjectId } from "mongoose";
import { UserProps } from "../../types.js";
import { UserModel } from "../models/User.js";

export const getAllUsers = async() => await UserModel.find().lean();

export const getUserById = async(id: string) => await UserModel.findById(id).exec();
export const getUserByEmail = async(email: string) => await UserModel.findOne({email}).exec();
export const getUserByToken = async(token: string) => await UserModel.findOne({refreshToken: token}).exec();
export const getUserByVerificationToken = async(token: string) => await UserModel.findOne({verificationToken: token}).exec();

export const createUser = async(user: Partial<UserProps>) => await UserModel.create(user)

export const updateUser = async(userId: string, updatedUser: UserProps) => await UserModel.findByIdAndUpdate({ _id: userId }, {...updatedUser})

export const followOrUnFollow = async(followerId: ObjectId, followingId: ObjectId): Promise<string> => {
  const user = await UserModel.findById(followerId).exec();
  const following = await UserModel.findById(followingId).exec();
  if(user._id.equals(followingId)) return 'duplicate'
  if(!user?.followings?.includes(followerId)) {
    await user?.updateOne({ $push: {followings: followerId} })
    await following?.updateOne({ $push: {followers: followerId} })
    return 'You followed this user'
  }
  else {
    await user?.updateOne({ $pull: {followings: followerId} })
    await following?.updateOne({ $pull: {followers: followerId} })
    return 'You unfollowed this user'
  }
}

export const deleteUserAccount = async(userId: string) => await UserModel.findByIdAndDelete({ _id: userId })
