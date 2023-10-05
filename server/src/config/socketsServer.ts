import { Server } from 'socket.io';

export class SocketServer {

  constructor(io: Server) {
    io.on('connection', (socket) => this.createConnection(socket))
  }

  private createConnection(socket){
    
    console.log(socket.id)
      console.log('connected now')
      socket.join('join')
    socket.on('revolving', (connectionId: string) => {
      //all connection here
      console.log({connectionId})
    })
  }
}