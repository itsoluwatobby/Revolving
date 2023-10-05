import { Request, Response } from "express";
import { statuses } from "../helpers/responses.js";
import { MessageService } from "../services/messageService.js"
import { asyncFunc, responseType } from "../helpers/helper.js";
import { ConversationService } from "../services/ConversationService.js"
import { ConversationModelType, MessageModelType, MessageStatus } from "../../types.js";

interface MessageRequest extends Request{
  messageId: string,
  status: MessageStatus
}

class MessageConversationController {

  private messageService: MessageService = new MessageService();
  private conversationService: ConversationService = new ConversationService()

  constructor() {}

  // conversation controller
  public createConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, partnerId } = req.params
      if(!userId || !partnerId) return res.status(400)
      this.conversationService.createNewConversation(userId, partnerId)
      .then((data) => {
        if(typeof data === 'string') return responseType({res, status: 400})
        return responseType({res, status: 200, message: 'conversation created', data})
      })
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to create conversation'}))
    })
  }

  public deleteConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return res.status(400)
      this.conversationService.deleteConversation(conversationId)
      .then((message) => responseType({res, status: 200, message}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to delete conversation'}))
    })
  }

  public getConversations(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId } = req.params
      if(!userId) return res.status(400)
      this.conversationService.getAllConversation(userId)
      .then((data: ConversationModelType[]) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversations'}))
    })
  }
  
  public getConversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return res.status(400)
      this.conversationService.getSingleConversation(conversationId)
      .then((data: ConversationModelType) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversation'}))
    })
  }
  
  public close_current_conversation(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return res.status(400)
      this.conversationService.closeConversation (conversationId)
      .then(() => responseType({res, status: 200, message: 'conversation close'}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to get conversation'}))
    })
  }

  // message controller
  public createMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { messageObj }: { messageObj: MessageModelType } = req.body
      if(!messageObj) return res.status(400)
      this.messageService.createNewMessage(messageObj)
      .then((data) => responseType({res, status: 200, message: 'message created', data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to create message'}))
    })
  }

  public deleteMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { userId, messageId } = req.params
      if(!userId || !messageId) return res.status(400)
      this.messageService.deleteMessage(userId, messageId)
      .then((message) => responseType({res, status: 200, message}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to delete message'}))
    })
  }

  public message_read_or_deleted(req: Request, res: Response){
    asyncFunc(res, () => {
      const { messageId, status } = req.query
      if(!messageId || !status) return res.status(400)
      const stats = status as MessageStatus
      this.messageService.isRead_Or_Delivered_Message(messageId as string, stats)
      .then((data) => {
        if(typeof data === 'string') return responseType({res, status: 400, message: statuses[400]})
        return responseType({res, status: 200, message: statuses[200], data})
      })
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to modify messages'}))
    })
  }
  
  public getMessages(req: Request, res: Response){
    asyncFunc(res, () => {
      const { conversationId } = req.params
      if(!conversationId) return res.status(400)
      this.messageService.get_All_Messages(conversationId)
      .then((data: MessageModelType[]) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to fetch messages'}))
    })
  }
  
  public getMessage(req: Request, res: Response){
    asyncFunc(res, () => {
      const { messageId } = req.params
      if(!messageId) return res.status(400)
      this.messageService.getSingleMessage(messageId)
      .then((data: MessageModelType) => responseType({res, status: 200, message: statuses[200], data}))
      .catch(() => responseType({res, status: 400, message: 'mongo error: failed to fetch messages'}))
    })
  }
}
export default new MessageConversationController()
