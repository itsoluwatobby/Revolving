import userService from "./userService.js";
import { UserModel } from "../models/User.js";
import messageService from "./messageService.js";
import { Document, Schema, Types } from "mongoose";
import { conversationModel } from "../models/Conversations.js";
import { ConversationModelType, GetConvoType } from "../../types.js";


type NewConvoType = Document<unknown, {}, ConversationModelType> & ConversationModelType & {
  _id: Types.ObjectId;
} | Document<unknown, {}, ConversationModelType> & ConversationModelType & Required<{
  _id: string | Schema.Types.ObjectId;
}>

export class ConversationService {

  constructor(){}

  public async createNewConversation(userId: string, partnerId: string): Promise<GetConvoType | string>{
    const user = await userService.getUserById(userId)
    const partnerUser = await userService.getUserById(partnerId)
    if(!user || !partnerUser) return 'not found'
    const duplicate = await conversationModel.findOne({"members": {$in: [userId, partnerId]}}).lean()
    if(duplicate) this.getSingleConversation(userId, duplicate._id as string)
    else{
      return (
        conversationModel.create({
          members: [userId, partnerId], adminId: userId
        })
        .then(newConversation => {
          const partnerId = newConversation?.members.filter(id => id.toString() !== userId.toString())
          return (
            userService.getUserById(partnerId[0])
            .then(partnerUser => {
              const { _id, lastName, firstName, lastSeen, status, lastMessage, displayPicture: { photo } } = partnerUser
              const user =  { userId: _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: photo }
              return { ...newConversation, ...user }
            })
          )
        })
      )
    }
  }

  public deleteConversation(conversationId: string): Promise<string>{
    return (
      conversationModel.deleteOne({_id: conversationId})
      .then(() => 'deleted successfully')
    )
  }
  public getConversation(conversationId: string){
    return (
      conversationModel.findById({_id: conversationId})
      .then((data) => data)
    )
  }

  public getAllConversation(userId: string): Promise<GetConvoType[]>{
    return (
      conversationModel.find({"members": { $in: [userId] } }).lean()
      .then(async(data) => {
        const partnerIds = [] as string[]
        data?.map(eachConvo => {
          eachConvo?.members?.map(id => id !== userId ? partnerIds.push(id) : null)
        })
        if(!partnerIds?.length) return []
        return (
          await Promise.all(partnerIds?.map(async(partnerId, i) => {
            const partnerUser = await userService.getUserById(partnerId)
            const { _id, lastName, firstName, lastSeen, status, lastMessage, displayPicture: { photo } } = partnerUser
            const user = { userId: _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: photo }
            return { ...data[i], ...user }
          }))
        )
      })
    )
  }

  public getSingleConversation(userId: string, conversationId: string): Promise<GetConvoType>{
    return (
      conversationModel.findById(conversationId).exec()
      .then( async(conversation) => {
        if(conversation.adminId.toString() === userId) conversation.membersOpen.adminOpened = true;
        else if(conversation.adminId.toString() !== userId) conversation.membersOpen.clientOpened = true;
        conversation.isOpened = conversation.membersOpen.adminOpened && conversation.membersOpen.clientOpened;
        await UserModel.findByIdAndUpdate({_id: userId}, {$set: { lastConversationId: conversation?._id }})
        const partnerId = conversation?.members.filter(id => id.toString() !== userId.toString())
        await conversation.save()
        messageService.isRead_Messages(conversation._id as string, conversation.isOpened)
        return (
          userService.getUserById(partnerId[0])
          .then(partnerUser => {
            const { _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: { photo } } = partnerUser
            const user = { userId: _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: photo }
            return {...conversation, ...user}
          })
        )
      })
    ) 
  }

  public closeConversation(userId: string, conversationId: string){
    return (
      conversationModel.findById(conversationId).exec()
      .then(async(conversation) => {
        if(conversation.adminId.toString() === userId) conversation.membersOpen.adminOpened = true;
        else if(conversation.adminId.toString() !== userId) conversation.membersOpen.clientOpened = true;
        conversation.isOpened = conversation.membersOpen.adminOpened && conversation.membersOpen.clientOpened;
        await conversation.save()
        return 'closed'
      })
    )
  }
}
export default new ConversationService()
