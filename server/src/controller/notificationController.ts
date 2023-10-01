import { Request, Response } from "express";
import { responseType } from "../helpers/helper.js";
import UserService from "../services/userService.js";
import { RedisClientService } from "../helpers/redis.js";
import { NotificationModel } from "../models/Notifications.js";
import { AllNotificationModelType, NotificationModelType, NotificationType, UserProps } from "../../types.js";


export class NotificationController {
  
  private redisClientService: RedisClientService = new RedisClientService()
  private NotificationToOthers = ["NewStory"] as Partial<NotificationType>[]
  private NotificationTo_Self_And_Other = ["Tagged"] as Partial<NotificationType>[]
  private NotificationToSelf = ["Subcribe", "Follow", "Comment", "Likes", "Message", "SharedStory"] as Partial<NotificationType>[]

  constructor(){}

  public async addToNotification<T>(userId: string, obj: T, notificationType: NotificationType){
    if(this.NotificationToOthers.includes(notificationType)){
      UserService.getUserById(userId)
      .then(async(user: UserProps) => {
        await Promise.all(user?.notificationSubscribers?.map(async(eachUser) => {
          const userNotification = await NotificationModel.findOne({ userId: eachUser?.subscriberId }).exec()
          const newNotification = { 
            notificationType, notify: {...obj} 
          }
          userNotification.updateOne({$push: { notification: newNotification }})
        }))
        .then(() => 'Notification added')
        .catch(() => 'Mongo error')
      }).catch((error) => error?.message)
    }
    else if(this.NotificationToSelf.includes(notificationType)){
      const userNotification = await NotificationModel.findOne({ userId }).exec()
      const newNotification = { 
        notificationType, notify: {...obj} 
      }
      userNotification.updateOne({$push: { notification: newNotification }})
      .then(() => 'Notification added')
      .catch(() => 'Mongo error')
    }
  }
 
  public async removeSingleNotification<T>(userId: string, obj: T, notificationType: NotificationType){
    if(this.NotificationToOthers.includes(notificationType)){
      UserService.getUserById(userId)
      .then(async(user: UserProps) => {
        await Promise.all(user?.notificationSubscribers?.map(async(eachUser) => {
          const userNotification = await NotificationModel.findOne({ userId: eachUser?.subscriberId }).exec()
          userNotification.updateOne({$pull: { notification: obj }})
        }))
        .then(() => 'Notification removed')
        .catch(() => 'Mongo error')
      }).catch((error) => error?.message)
    }
    else if(this.NotificationToSelf.includes(notificationType)){
      const userNotification = await NotificationModel.findOne({ userId }).exec()
      await userNotification.updateOne({$pull: { notification: obj }})
      .then(() => 'Notification removed')
      .catch(() => 'Mongo error')
    }
  }

  openOrCloseNotification(req: Request, res: Response){
    const { notificationId, isOpen } = req.query
    const opened = isOpen as unknown as boolean
    NotificationModel.findByIdAndUpdate({_id: notificationId}, { $set: {isNotificationOpen: opened} })
    .then(async() => {
      if(opened) {
        await this.isNotificationRead(notificationId as string)
        return responseType({res, status: 200, message: 'Read notification'})
      }
      else return responseType({res, status: 200, message: 'Unread'})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }

  public async isNotificationRead(notificationId: string){
    const userNotification = await NotificationModel.findById(notificationId).exec()
    const notRead = userNotification?.notification?.filter(noti => !noti?.hasRead)
    const read = userNotification?.notification?.filter(noti => noti?.hasRead)
    const modified = notRead?.map(not =>  not.hasRead = true)
    await userNotification.updateOne({$push: { notification: [...modified, ...read] }})
    return 'Done'
  }

  public async removeNotification(req: Request, res: Response){
    const { notificationId } = req.params
    const { notifyIds } = req.body
    const userNotification = await NotificationModel.findById(notificationId).exec()
    const retainAll = userNotification?.notification?.filter(noti => !notifyIds.includes(noti?._id))
    await userNotification.updateOne({$push: { notification: [...retainAll] }})
    .then(async() => {
      return responseType({res, status: 204, message: 'Removed notifications'})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }

  public async getNotification(req: Request, res: Response){
    const { userId } = req.params
    this.redisClientService.getCachedResponse({key: `userNotification:${userId}`, timeTaken: 1800, cb: async() => {
      const userNotification = await NotificationModel.findOne({userId}).exec()
      return userNotification
    }, reqMtd: ['POST', 'PATCH', 'PUT', 'DELETE'] })
    .then((data: NotificationModelType) => {
      return responseType({res, status: 200, message: 'success', count: data?.notification?.length, data})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }
}
export default new NotificationController()