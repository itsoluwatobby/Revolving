import { Request, Response, response } from "express";
import { statuses } from "../helpers/responses.js";
import { MessageService } from "../services/messageService.js"
import { asyncFunc, responseType } from "../helpers/helper.js";
import { ConversationService } from "../services/ConversationService.js"
import { DeleteChatOption, GetConvoType, MessageModelType, MessageStatus, UserFriends } from "../../types.js";
import { RedisClientService } from "../helpers/redis.js";

interface MessageRequest extends Request{
  messageId: string,
  status: MessageStatus
}

class MessageConversationController {

  private messageService: MessageService = new MessageService();
  private conversationService: ConversationService = new ConversationService()
  private redisClientService: RedisClientService = new RedisClientService()

  constructor() {}

  // conversation controller
  public createConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, partnerId } = req.params
      if(!userId || !partnerId) return responseType({res, status: 406, message: statuses['406']})
      this.conversationService.createNewConversation(userId, partnerId)
      .then((data) => {
        if(typeof data === 'string') return responseType({res, status: 400})
        return responseType({res, status: 200, message: 'conversation created', data})
      })
      .catch((error) => responseType({res, status: 400, message: error.message}))
    })
  }

  public deleteConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return responseType({res, status: 406, message: statuses['406']})
      this.conversationService.deleteConversation(conversationId)
      .then((message) => responseType({res, status: 200, message}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to delete conversation'}))
    })
  }

  public getConversations(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId } = req.params
      if(!userId) return responseType({res, status: 406, message: statuses['406']})
      this.redisClientService.getCachedResponse({key: `userConversations:${userId}`, timeTaken: 1800, cb: async() => {
        return this.conversationService.getAllConversation(userId)
      }, reqMtd: ['POST', 'PATCH', 'PUT', 'DELETE'] })
      .then((data: GetConvoType[]) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversations'}))
    })
  }
  
  public getConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, conversationId } = req.params
      if(!conversationId || !userId) return responseType({res, status: 406, message: statuses['406']})
      this.conversationService.getSingleConversation(userId, conversationId)
      .then((data: GetConvoType) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversation'}))
    })
  }
  
  public close_current_conversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, conversationId } = req.params
      if(!conversationId) return responseType({res, status: 406, message: statuses['406']})
      this.conversationService.closeConversation (userId, conversationId)
      .then((conversation) => responseType({res, status: 200, message: 'conversation close', data: conversation}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversation'}))
    })
  }

  // message controller
  public createMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const messageObj: MessageModelType = req.body
      if(!messageObj?.senderId || !messageObj?.receiverId || !messageObj?.message) return responseType({res, status: 406, message: statuses['406']})
      this.messageService.createNewMessage(messageObj)
      .then((data) => responseType({res, status: 201, message: 'message created', data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to create message'}))
    })
  }

  public editMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId } = req.params
      const messageObj: MessageModelType = req.body
      if(!userId || !messageObj?.senderId || !messageObj?.receiverId || !messageObj?.message) return responseType({res, status: 406, message: statuses['406']})
      if(userId !== messageObj?.senderId) return responseType({res, status: 401, message: statuses['401']})
      this.messageService.updateMessage(messageObj)
      .then((data) => responseType({res, status: 201, message: `${statuses['201']}: message edited`, data}))
      .catch((error) => {
        console.log(error)
        responseType({res, status: 400, message: 'mongo error: failed to edit message'})
      })
    })
  }

  public deleteMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, messageId, option } = req.params
      if(!userId || !messageId) return responseType({res, status: 406, message: statuses['406']})
      this.messageService.deleteMessage(userId, messageId, option as DeleteChatOption)
      .then((message) => responseType({res, status: 200, message}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to delete message'}))
    })
  }

  public message_read_or_deleted(req: Request, res: Response){
    asyncFunc(res, () => {
      const { messageId, status } = req.query
      if(!messageId || !status) return responseType({res, status: 406, message: statuses['406']})
      this.messageService.isRead_Or_Delivered_Message(messageId as string, status as MessageStatus)
    // if(typeof data === 'string') return responseType({res, status: 400, message: statuses[400]})
      .then(data => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to modify messages'}))
    })
  }
  
  public getMessages(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return responseType({res, status: 406, message: statuses['406']})
      this.redisClientService.getCachedResponse({key: `conversationMessages:${conversationId}`, timeTaken: 1800, cb: async() => {
        return this.messageService.get_All_Messages(conversationId)
      }, reqMtd: ['POST', 'PATCH', 'PUT', 'DELETE'] })
      .then((data: MessageModelType[]) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to fetch messages'}))
    })
  }
  
  public getMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { messageId } = req.params
      if(!messageId) return responseType({res, status: 406, message: statuses['406']})
      this.messageService.getSingleMessage(messageId)
      .then((data: MessageModelType) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to fetch messages'}))
    })
  }
}
export default new MessageConversationController()
