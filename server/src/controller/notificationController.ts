import { Request, Response } from "express";
import { responseType } from "../helpers/helper.js";
import UserService from "../services/userService.js";
import { KV_Redis_ClientService } from "../helpers/redis.js";
import { NotificationModel } from "../models/Notifications.js";
import { AllNotificationModelType, NotificationBody, NotificationModelType, NotificationStatus, NotificationType, UserProps } from "../../types.js";
import { Document, Schema } from "mongoose";
import { statuses } from "../helpers/responses.js";

type NotificationDocument = Document<unknown, {}, NotificationModelType> & NotificationModelType & Required<{ _id: string | Schema.Types.ObjectId; }>

export class NotificationController {
  
  private Notification_To_Others = ["NewStory"] as Partial<NotificationType>[]
  private redisClientService: KV_Redis_ClientService = new KV_Redis_ClientService()
  private Notification_To_Tagged_And_Others = ["Tagged"] as Partial<NotificationType>[]
  private Notification_To_Self = ["Subcribe", "Follow", "Comment", "Likes", "Message", "SharedStory", "CommentLikes"] as Partial<NotificationType>[]

  constructor(){}

  public async addToNotification<T>(userId: string, obj: T, notificationType: NotificationType){
    if((obj as AllNotificationModelType)?.userId){
      if(userId === (obj as AllNotificationModelType)?.userId.toString()) return 'duplicate'
    }
    else if(this.Notification_To_Others.includes(notificationType)){
      return (
        UserService.getUserById(userId)
        .then(async(user: UserProps) => {
          return (
            await Promise.all(user?.notificationSubscribers?.map(async(eachUser) => {
              const userNotification = await NotificationModel.findOne({ userId: eachUser?.subscriberId }).exec()
              userNotification.updateOne({$push: { notification: { notify: {...obj}, notificationType } }})
            }))
            .then(() => 'Notification added')
            .catch(() => 'Mongo error')
            )
          }).catch((error) => error?.message as string)
      )
    }
    else if(this.Notification_To_Self.includes(notificationType)){
      const userNotification = await NotificationModel.findOne({ userId }).exec()
      return (
        userNotification.updateOne({$push: { notification: { notify: {...obj}, notificationType } }})
        .then(() => 'Notification added')
        .catch(() => 'Mongo error')
      )
    }
  }
 
  public async removeSingleNotification<T>(userId: string, obj: T, notificationType: NotificationType){
    if((obj as AllNotificationModelType)?.userId){
      if(userId === (obj as AllNotificationModelType)?.userId.toString()) return 'duplicate'
    }
    else if(this.Notification_To_Others.includes(notificationType)){
      return (
        UserService.getUserById(userId)
        .then(async(user: UserProps) => {
          return (
            await Promise.all(user?.notificationSubscribers?.map(async(eachUser) => {
              const userNotification = await NotificationModel.findOne({ userId: eachUser?.subscriberId }).exec()
              userNotification.updateOne({$pull: { notification: { notify: {...obj}, notificationType } }})
            }))
            .then(() => 'Notification removed')
            .catch(() => 'Mongo error')
          )
        }).catch((error) => error?.message as string)
      )
    }
    else if(this.Notification_To_Self.includes(notificationType)){
      const userNotification = await NotificationModel.findOne({ userId }).exec()
      return (
        await userNotification.updateOne({$pull: { notification: { notify: {...obj}, notificationType } }})
        .then(() => 'Notification removed')
        .catch(() => 'Mongo error')
      )
    }
  }

  openOrCloseNotification(req: Request, res: Response){
    const { notificationId, isOpen, stats } = req.query
    if(!notificationId || notificationId == undefined) return responseType({res, status: 406, message: statuses['406']})
    const opened = isOpen === 'true' ? true : false
    const status = stats as unknown as NotificationStatus
    NotificationModel.findByIdAndUpdate({_id: notificationId}, { $set: {isNotificationOpen: opened} }, { new: true })
    .then(async(userNotification) => {
      if(opened && status === 'unread') {
        await this.isNotificationRead(userNotification, status)
        return responseType({res, status: 200, message: 'Notification opened'})
      }
      else if(!opened && status === 'read'){
        await this.isNotificationRead(userNotification, status)
        return responseType({res, status: 200, message: 'read'})
      }
      else
        return responseType({res, status: 200, message: 'Unread'})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }

  public async isNotificationRead(userNotification: NotificationDocument, status: NotificationStatus){
    let unRead_Notifications: NotificationBody[], read_Notifications: NotificationBody[], modified_Notifications: NotificationBody[];
    if(status === 'unread'){
      unRead_Notifications = userNotification?.notification?.filter(notification => !notification?.hasRead)
      read_Notifications = userNotification?.notification?.filter(notification => notification?.hasRead)
      modified_Notifications = unRead_Notifications?.map(notification =>  ({ ...notification, hasRead: true }))
    }
    else if (status === 'read'){
      unRead_Notifications = userNotification?.notification?.filter(notification => notification?.status === 'unread')
      read_Notifications = userNotification?.notification?.filter(notification => notification?.status === 'read')
      modified_Notifications = unRead_Notifications?.map(notification =>  ({ ...notification, status: 'read', hasRead: true }))
    }
    if(!unRead_Notifications?.length) return 'Done'
    userNotification.notification = [...modified_Notifications, ...read_Notifications]
    await userNotification.save()
    return 'Done'
  }

  public async removeNotification(req: Request, res: Response){
    const { notificationId } = req.params
    const notifyIds = req.body
    if(!notificationId || !Array.isArray(notifyIds) || !notifyIds?.length) return responseType({res, status: 406, message: statuses['406']})
    const userNotification = await NotificationModel.findById(notificationId).exec()
    const retainAll = userNotification?.notification?.filter(noti => !notifyIds.includes(noti?._id.toString()))
    await userNotification.updateOne({$set: { notification: [...retainAll] }})
    .then(async() => {
      return responseType({res, status: 204, message: 'Removed notifications'})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }

  public async getNotification(req: Request, res: Response){
    const { userId } = req.params
    if(!userId || userId == undefined) return responseType({res, status: 406, message: statuses['406']})
    this.redisClientService.getCachedResponse({key: `userNotification:${userId}`, timeTaken: 1800, cb: async() => {
      return await NotificationModel.findOne({userId}).exec()
    }, reqMtd: ['POST', 'PATCH', 'PUT', 'DELETE'] })
    .then((data: NotificationModelType) => {
      return responseType({res, status: 200, message: 'success', count: data?.notification?.length, data})
    }).catch(() => responseType({res, status: 400, message: 'Mongo error'}))
  }
}
export default new NotificationController()