import userService from "./userService.js";
import { Document, Schema } from "mongoose";
import { MessageModel } from "../models/Messages.js";
import ConversationService from "./ConversationService.js";
import { DeleteChatOption, MessageModelType, MessageStatus } from "../../types.js";

type NewMessageType = Document<unknown, {}, MessageModelType> & MessageModelType & Required<{
  _id: string | Schema.Types.ObjectId;
}>

export class MessageService {

  constructor(){}

  public async createNewMessage(messageObj: MessageModelType): Promise<NewMessageType>{
    const user = await userService.getUserById(messageObj?.senderId as string)
    const convo = await ConversationService.getConversation(messageObj?.conversationId as string)
    const newMsg = {
      ...messageObj, displayPicture: user?.displayPicture?.photo, isDelivered: convo?.isOpened,
      author: `${user?.firstName} ${user?.lastName}`, isMessageRead: convo?.isOpened ? 'read' : 'unread'
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
  
  public deleteMessage(userId: string, messageId: string, option: DeleteChatOption): Promise<string>{
    if(option === 'forAll'){
      return (
        MessageModel.findByIdAndUpdate({_id: messageId}, {$set: { isDeleted: true }})
        .then(() => 'successfully deleted')
      )
    }
    else if(option === 'forMe'){
      return (
        MessageModel.updateOne({$push: { isMessageDeleted: userId }})
        .then(() => 'deleted')
      )
    }
  }

  public isRead_Or_Delivered_Message(messageId: string, status: MessageStatus){
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
  }

  public isRead_Messages(conversationId: string, isOpened: boolean){
    const read = isOpened ? 'read' : 'unread'
    MessageModel.find({ conversationId, isDelivered: false, isMessageRead: 'unread' })
    .then(async(messages) => {
      await Promise.all(messages.map(async(msg) => {
        await msg.updateOne({$set: { isDelivered: isOpened, isMessageRead: read }})
      }))
    })
    MessageModel.find({ conversationId, isMessageRead: 'unread' })
    .then(async(messages) => {
      await Promise.all(messages.map(async(msg) => {
        await msg.updateOne({$set: { isMessageRead: read }})
      }))
    })
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
