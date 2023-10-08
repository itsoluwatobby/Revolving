import userService from "./userService.js";
import { Document, Schema } from "mongoose";
import { MessageModel } from "../models/Messages.js";
import { MessageModelType, MessageStatus } from "../../types.js";

type NewMessageType = Document<unknown, {}, MessageModelType> & MessageModelType & Required<{
  _id: string | Schema.Types.ObjectId;
}>

export class MessageService {

  constructor(){}

  public async createNewMessage(messageObj: MessageModelType): Promise<NewMessageType>{
    const user = await userService.getUserById(messageObj?.senderId as string)
    const newMsg = {
      ...messageObj, displayPicture: user?.displayPicture?.photo, 
      author: `${user?.firstName} ${user?.lastName}`
    } as MessageModelType
    return (
      MessageModel.create({ ...newMsg })
      .then(async(newMessage) => {
        const { _id, createdAt, message } = newMessage
        await user.updateOne({$set: {lastMessage: { _id, message, createdAt }} })
        return newMessage
      })
    )
  }

  public updateMessage(messageObj: MessageModelType): Promise<NewMessageType>{
    return (
      MessageModel.findByIdAndUpdate({_id: messageObj?._id}, messageObj, {new: true})
      .then(data => data)
    )
  }
  
  public deleteMessage(userId: string, messageId: string): Promise<string>{
    return (
      this.getSingleMessage(messageId)
      .then(async(data) => {
        if(data?.isMessageDeleted?.length && data?.isMessageDeleted[0] !== userId){
          await data.deleteOne({_id: messageId})
          return 'successfully deleted' 
        }
        else{
          await data.updateOne({$push: { isMessageDeleted: userId }})
          return 'deleted'
        }
      })
    )
  }

  public async isRead_Or_Delivered_Message(messageId: string, status: MessageStatus): Promise<NewMessageType | string>{
    if(status === 'READ'){
      return (
        MessageModel.findByIdAndUpdate({_id: messageId}, {$set: { isMessageRead: 'read' }}, {new: true})
        .then(data => data)
      )
    } 
    else if(status === 'DELIVERED'){
      return (
        MessageModel.findByIdAndUpdate({_id: messageId}, {$set: { isDelivered: true }}, {new: true})
        .then(data => data)
      )
    }
    else return 'argument error'
  }

  public get_All_Messages(conversationId: string){
    return (
      MessageModel.find({ conversationId }).lean()
      .then(data => data)
    )
  }

  public getSingleMessage(messageId: string){
    return (
      MessageModel.findById(messageId).exec()
      .then(data => data)
    )
  }
}
export default new MessageService()
