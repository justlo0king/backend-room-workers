import * as express from 'express';
import { createServer, Server } from "http";
import * as socketio from "socket.io";
import * as cors from 'cors';
import { IOEvent } from './constants';
import { QueueClient } from './queues/queue-client';
import { IOServer } from './sockets/io-server';

class AppServer {
  public static readonly PORT: number = 8080;
  private _app: express.Application;
  private server: Server;
  private io: socketio.Server;
  private port: string | number;
  private queue: QueueClient;

  get app(): express.Application {
    return this._app;
  }

  constructor() {
    this._app = express();
    this.port = process.env.PORT || AppServer.PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this.server = createServer(this._app);
    this.initSocket();
    this.queue = new QueueClient({});
    this.listen();
  }  

  private initSocket(): void {
    this.io = new IOServer(this.server, {
      onCommand: this.onCommand
    });
  }

  onCommand = (socket:socketio.Socket, command: Record<string, unknown>) => {
    console.log(`AppServer.onCommand: socket: ${socket.id}, command: ${JSON.stringify(command)}`);

    const { cmd, payload } = command || {};
    switch(cmd) {
      case 'join':
        return this.joinRoom(socket, {
          ...command, contextId: socket.id,
        });
    }
  }

  private async joinRoom(socket:socketio.Socket, command:Record<string, unknown>) {
    const { payload={} as any } = command || {};
    const { roomId='' } = payload || {};
    const [ appId ] = roomId.split('-');
    console.log(`AppServer.joinRoom: roomId: ${roomId}, appId: ${appId}`);
    const response = await this.queue.sendMessage(command, { roomId }, `${appId}-rooms`);
    console.log(`AppServer.joinRoom: response:`, response);
    return socket.emit('command-result', JSON.parse(response as string));
  }


  private listen(): void {   // server listening on our defined port
    this.server.listen(this.port, () => {
      console.log('AppServer.listen: running server on port %s', this.port);
    });
  }  
}

const app = new AppServer().app; // calling the getter method here
export { app };