import * as amqp from 'amqplib';
import { RoomsController } from './rooms/rooms-server';


class RoomsServer {
  private APP_ID: string;
  private QUEUE: string = 'test-queue';
  private channel: amqp.Channel;
  private connection: amqp.Connection;
  private rooms: RoomsController;

  constructor() {
    this.init();
  }

  private async init() {
    this.APP_ID = process.env.APP_ID || 'rooms01';
    this.QUEUE = `${this.APP_ID}-rooms`;
    this.rooms = new RoomsController({
      APP_ID: this.APP_ID
    });
    this.appLoop();
    this.connectQueue();
  }
  private loopTmt:unknown = null;
  private appLoop(i=0) {
    this.loopTmt = setTimeout(() => {
      this.appLoop(++i);
    }, 5000)
  }


  private async connectQueue() {   
    try {
      this.connection = await amqp.connect('amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.QUEUE);

      await this.channel.consume(this.QUEUE, async (data:amqp.Message) => {       
        const message = JSON.parse(`${Buffer.from(data.content)}`);;    
        // console.log(`RoomsServer: queue data: ${Buffer.from(data.content)}`);//, properties:`, data.properties);
        const { cmd, payload } = message || {};
        const { roomId } = payload || {};
        if (!roomId) {
          console.log(`no roomId in payload:`, payload);
          return;
        }
        if (this.APP_ID !== String(roomId).substring(0, String(this.APP_ID).length)) {
          // room is not on this instance
          console.log(`app: ${this.APP_ID}, roomId: ${roomId}, skipping`);
          return;
        }
        this.channel.ack(data);

        const response = await this.rooms.command(message);

        this.channel.sendToQueue(
          data.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: data.properties.correlationId,
          },
        );

      });      
      console.log(`RoomsServer.connectQueue: done`);
    } catch (error) {
      console.error('RoomsServer.connectQueue: error:', error);
    }
  }


  private async sendData (data:Record<string, unknown>) {    // send data to queue
    console.log(`RoomsServer.sendData: data`, data);
    return this.channel.sendToQueue('test-queue', Buffer.from(JSON.stringify(data)));
  }

  async disconnect() {
    // close the channel and connection
    await this.channel.close();
    await this.connection.close(); 
  }  
}


const app = new RoomsServer(); // calling the getter method here
export { app };