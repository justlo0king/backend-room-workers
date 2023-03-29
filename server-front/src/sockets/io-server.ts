import * as socketio from 'socket.io';
import { Server } from 'http';
import { IOEvent } from '../constants';

export class IOServer extends socketio.Server {
  constructor(server: Server, params:Record<string, unknown>={}) {
    super(server);
    this.init(params);
  }

  init(params:Record<string, any>={}) {
    this.on(IOEvent.CONNECT, (socket) => this.initSocket(socket, params));
  }

  initSocket(socket: socketio.Socket, params:any={}) {
    console.log('IOServer.init: connected client: %s', socket.id);

    socket.on(IOEvent.MESSAGE, (m: unknown) => {
      console.log('AppServer.listen: message: %s', JSON.stringify(m));
      this.emit('message', m);
    });
    if (typeof params.onCommand == 'function') {
      socket.on(IOEvent.COMMAND, (data:Record<string, unknown>) => {
        params.onCommand(socket, data);
      });
    }
    socket.on(IOEvent.DISCONNECT, () => {
      console.log('IOServer.init: client disconnected');
    });
  }
}