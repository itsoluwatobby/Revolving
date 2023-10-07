import { Document, Schema, Types } from "mongoose";
import { conversationModel } from "../models/Coversations.js";
import userService from "./userService.js";
import { ConversationModelType, GetConvoType, UserFriends } from "../../types.js";
import { UserModel } from "../models/User.js";

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
    if(duplicate) {
      const partnerId = duplicate?.members.filter(id => id.toString() !== userId.toString())
      return (
        userService.getUserById(partnerId[0])
        .then(partnerUser => {
          const { _id, lastName, firstName, lastSeen, status, lastMessage, displayPicture: { photo } } = partnerUser
          const user = { userId: _id, lastName, firstName, lastMessage, lastSeen, status, displayPicture: photo }
          return { ...duplicate, ...user }
        })
      )
    }
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
      conversationModel.findByIdAndUpdate({_id: conversationId}, {$set: { isOpened: true }}, { new: true }).lean()
      .then(async(data: ConversationModelType) => {
        UserModel.findByIdAndUpdate({_id: userId}, {$set: { lastConversationId: data?._id }})
        const partnerId = data?.members.filter(id => id.toString() !== userId.toString())
        return (
          userService.getUserById(partnerId[0])  
          .then(partnerUser => {
            const { _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: { photo } } = partnerUser
            const user = {userId: _id, lastName, firstName, lastSeen, lastMessage, status, displayPicture: photo }
            return {...data, ...user}
          })
        )
      })
    )
  }

  public closeConversation(conversationId: string){
    return (
      conversationModel.findByIdAndUpdate({_id: conversationId}, {$set: { isOpened: false }}).exec()
      .then(() => 'closed')
    )
  }
}
export default new ConversationService()
