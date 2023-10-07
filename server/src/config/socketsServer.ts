import { Server } from 'socket.io';
import { MessageModelType } from '../../types.js';
import { disconnect } from 'process';

type TypingObjType = {
  firstName: string,
  userId: string,
  conversationId: string,
  status: boolean
}

export class SocketServer {

  private customIO: Server;

  constructor(io: Server) {
    this.customIO = io
    this.customIO.on('connection', (socket) => {
      this.createConnection(socket)
      this.privateConnection(socket)
    })
  }

  private createConnection(socket){
    socket.on('revolving', (revolvingId: string) => {
      //all connection here
      socket.join(revolvingId)
      socket.on('send_broadcast', ({}) => {
        this.customIO.to('').emit('receive_broadcast', {})
      })

      socket.on('disconnect', () => {
        socket.leave(revolvingId)
      })
    })
  }
  
  private privateConnection(socket){
    socket.on('start_conversation', (conversationId: string) => {
      //all connection here
      socket.join(conversationId)

      socket.on('create_message', (message: MessageModelType, callback) => {
        this.customIO.to(conversationId).emit('receive_message', {...message}),
        callback({status: 'Message received successfully'})
      })
      
      socket.on('is_typing', (typingObj: TypingObjType) => {
        this.customIO.to(typingObj.conversationId).emit('typing_event', {...typingObj, status: true})
      })
      
      socket.on('typing_stopped', (typingObj: TypingObjType) => {
        this.customIO.to(typingObj.conversationId).emit('typing_event_ended', {...typingObj, status: false})
      })

      socket.on('disconnect', () => {
        socket.leave(conversationId)
      })
      
    })
  }
}