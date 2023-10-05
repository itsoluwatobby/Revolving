import { Document, Types } from "mongoose";
import { MessageModel } from "../models/Messages.js";
import { MessageModelType, MessageStatus } from "../../types.js";

type NewMessageType = Document<unknown, {}, MessageModelType> & MessageModelType & {
  _id: Types.ObjectId;
}

export class MessageService {

  constructor(){}

  public async createNewMessage(messageObj: MessageModelType): Promise<NewMessageType | string>{
    return (
      MessageModel.create({ ...messageObj })
      .then(newMessage => newMessage)
      .catch(error => error.message)
    )
  }

  public async deleteMessage(userId: string, messageId: string): Promise<string>{
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
      .catch(error => error.message)
    )
  }

  public async isRead_Or_Delivered_Message(messageId: string, status: MessageStatus): Promise<NewMessageType | string>{
    if(status === 'READ'){
      return (
        MessageModel.findByIdAndUpdate({_id: messageId}, {$set: { isMessageRead: 'read' }}, {new: true})
        .then(data => data)
        .catch(error => error.message)
      )
    } 
    else if(status === 'DELIVERED'){
      return (
        MessageModel.findByIdAndUpdate({_id: messageId}, {$set: { isDelivered: true }}, {new: true})
        .then(data => data)
        .catch(error => error.message)
      )
    }
    else return 'argument error'
  }

  public get_All_Messages(conversationId: string){
    return (
      MessageModel.find({ conversationId }).lean()
      .then(data => data)
      .catch(error => error.message)
    )
  }

  public getSingleMessage(messageId: string){
    return (
      MessageModel.findById(messageId).exec()
      .then(data => data)
      .catch(error => error.message)
    )
  }
}
export default new MessageService()
