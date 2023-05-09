import { UserProps } from "../../types.js";
import { UserModel } from "../models/User.js";

export const getAllUsers = async() => await UserModel.find().lean();

export const getUserById = async(id: string) => await UserModel.findById(id).exec();
export const getUserByEmail = async(email: string) => await UserModel.findOne({email}).exec();
export const getUserByToken = async(token: string) => await UserModel.findOne({verificationToken: token}).exec();

export const createUser = async(user: Partial<UserProps>) => await UserModel.create(user)

export const updateUser = async(userId: string, updatedUser: UserProps) => await UserModel.findByIdAndUpdate({ _id: userId }, {...updatedUser})

export const followOrUnFollow = async(followerId: string, followingId: string) => {
  const user = await UserModel.findById({ _id: followingId }).exec();
  if(!user?.followers?.includes(followerId)) {
    await user?.updateOne({ $push: {likes: followerId} })
    return 'You followed this user'
  }
  else {
    await user?.updateOne({ $pull: {likes: followerId} })
    return 'You unfollowed this user'
  }
}

export const deleteUserAccount = async(userId: string) => await UserModel.findByIdAndDelete({ _id: userId })
