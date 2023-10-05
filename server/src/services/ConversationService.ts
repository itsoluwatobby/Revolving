import { Document, Types } from "mongoose";
import { conversationModel } from "../models/Coversations.js";
import userService from "./userService.js";
import { ConversationModelType } from "../../types.js";

type NewConvoType = Document<unknown, {}, ConversationModelType> & ConversationModelType & {
  _id: Types.ObjectId;
}

export class ConversationService {

  constructor(){}

  public async createNewConversation(userId: string, partnerId: string): Promise<NewConvoType | string>{
    const user = await userService.getUserById(userId)
    const partnerUser = await userService.getUserById(partnerId)
    if(!user || !partnerUser) return 'not found'
    return (
      conversationModel.create({
        members: [userId, partnerId], adminId: userId
      })
      .then(newConversation => newConversation)
      .catch(error => error.message)
    )
  }

  public async deleteConversation(conversationId: string): Promise<string>{
    return (
      conversationModel.deleteOne({_id: conversationId})
      .then(() => 'deleted successfully')
      .catch(error => error.message)
    )
  }

  public getAllConversation(userId: string){
    return (
      conversationModel.find({"members": { $in: [userId] } }).lean()
      .then(data => data)
      .catch(error => error.message)
    )
  }

  public getSingleConversation(conversationId: string){
    return (
      conversationModel.findByIdAndUpdate({_id: conversationId}, {$set: { isOpened: true }}, { new: true }).exec()
      .then(data => data)
      .catch(error => error.message)
    )
  }

  public closeConversation(conversationId: string){
    return (
      conversationModel.findByIdAndUpdate({_id: conversationId}, {$set: { isOpened: false }}).exec()
      .then(() => 'closed')
      .catch(error => error.message)
    )
  }
}
export default new ConversationService()
