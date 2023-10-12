import { UserModel } from "../models/User.js";
import { StoryService } from "./StoryService.js";
import { FollowNotificationType, Followers, Follows, GetFollowsType, GetSubscriptionType, SubUser, UserFriends, UserProps } from "../../types.js";
import { NotificationModel } from "../models/Notifications.js";
import { TaskBinModel, TaskManagerModel } from "../models/TaskManager.js";
import NotificationController from "../controller/notificationController.js";


export class UserService {

  public dateTime: string
  private storyService: StoryService = new StoryService()

  constructor() {
    this.dateTime = new Date().toString()
  }

  public async getAllUsers(){
    return await UserModel.find().lean();
  }
  public async getUserById(id: string){
    return await UserModel.findById(id).exec();
  }
  public async getUserByEmail(email: string){
    return await UserModel.findOne({email}).exec();
  }
  public async getUserByToken(token: string){
    return await UserModel.findOne({refreshToken: token}).exec();
  }
  public async getUserByVerificationToken(token: string){
    return await UserModel.findOne({ verificationToken: { token } }).exec();
  }

  public async createUser(user: Partial<UserProps>){
    const newUser = await UserModel.create(user)
    await TaskBinModel.create({
      userId: newUser?._id, taskBin: []
    })
    return newUser 
  }

  public async updateUser(userId: string, updatedUser: UserProps){
    return await UserModel.findByIdAndUpdate({ _id: userId }, updatedUser, {new: true})
  }

  // receiver == followingId
  public async followOrUnFollow(followerId: string, followingId: string): Promise<string>{
    const user = await UserModel.findById(followerId).exec();
    const following = await UserModel.findById(followingId).exec();
    if(user?._id.toString() == followingId) return 'duplicate'
    const { firstName, lastName, displayPicture: { photo }, email } = user
    const notiFollow = {
      userId: followerId, fullName: `${firstName} ${lastName}`,
      displayPicture: photo, email
    } as FollowNotificationType

    const duplicate = following?.followers?.find(sub => sub?.followerId === followerId) as Followers
    if(duplicate) {
      const targetFollowerRecipient = user?.followings?.find(sub => sub?.followRecipientId === followingId) as Follows
      following?.updateOne({ $pull: { followers: duplicate } })
      .then(async() => {
        await user?.updateOne({ $pull: { followings: targetFollowerRecipient }})
        await NotificationController.removeSingleNotification(followingId, notiFollow, 'Follow')
        return 'You unfollowed this user'
      }).catch(() => 'unable to unfollow')
    }
    else {
      following?.updateOne({ $push: {followers: { followerId, createdAt: this.dateTime }} })
      .then(async() => {
        await user?.updateOne({ $push: {followings: { followRecipientId: followingId, createdAt: this.dateTime } } })
        await NotificationController.addToNotification(followingId, notiFollow, 'Follow')
        return 'You followed this user'
      }).catch(() => 'unable to follow')
    }
  }

  public async getUserSubscriptions(user: UserProps): Promise<GetSubscriptionType>{
    const subscriptions = await Promise.all(user?.notificationSubscribers?.map(async(sub) => {
      const { _id, description, status, email, lastSeen, displayPicture: { photo }, firstName, lastName, followers, followings } = await this.getUserById(sub?.subscriberId)
      return { _id, description, status, email, lastSeen, displayPicture: photo, firstName, lastName, followers, followings, subDate: sub?.createdAt }
    })) as SubUser[]
    const subscribed = await Promise.all(user?.subscribed?.map(async(sub) => {
      const { _id, description, status, email, lastSeen, displayPicture: { photo }, firstName, lastName, followers, followings } = await this.getUserById(sub?.subscribeRecipientId)
      return { _id, description, status, email, lastSeen, displayPicture: photo, firstName, lastName, followers, followings, subDate: sub?.createdAt }
    })) as SubUser[]
    return { subscriptions, subscribed }
  }

  public async getUserFollowers(user: UserProps): Promise<GetFollowsType>{
    const follows = await Promise.all(user?.followings?.map(async(follow) => {
      const { _id, description, status, email, lastSeen, displayPicture: { photo }, firstName, lastName, followers, followings } = await this.getUserById(follow?.followRecipientId)
      return {_id, description, status, email, lastSeen, displayPicture: photo, firstName, lastName, followers, followings, subDate: follow?.createdAt }
    })) as SubUser[]
    const followers = await Promise.all(user?.followers?.map(async(follow) => {
      const { _id, description, status, email, lastSeen, displayPicture: { photo }, firstName, lastName, followers, followings } = await this.getUserById(follow?.followerId)
      return { _id, description, status, email, lastSeen, displayPicture: photo, firstName, lastName, followers, followings, subDate: follow?.createdAt }
    })) as SubUser[]
    return { follows, followers }
  }

  public async getFriends(user: UserProps): Promise<UserFriends[]>{
    const allIds = user?.followers?.map(us => us?.followerId.toString())
    // remove conflicting IDs
    user?.followings?.map(us => !allIds?.includes(us?.followRecipientId.toString()) ? allIds.push(us?.followRecipientId?.toString()) : null)
      // allIds?.map(id => id.toString() !== us?.followRecipientId.toString() ? allIds.push(us?.followRecipientId) : null)
    const allUsers = await Promise.all(allIds?.map(async(eachId) => {
      const { _id, status, lastSeen, displayPicture: { photo }, firstName, lastName, email } = await this.getUserById(eachId)
      return { _id, status, lastSeen, displayPicture: photo, firstName, lastName, email }
    })) as UserFriends[]
    return allUsers
  }

  public async deleteAccount(userId: string): Promise<void>{
    await UserModel.findByIdAndDelete({ _id: userId })
    await this.storyService.deleteAllUserStories(userId)
    await TaskManagerModel.deleteOne({userId})
    await NotificationModel.deleteOne({userId})
  }
}
export default new UserService()
