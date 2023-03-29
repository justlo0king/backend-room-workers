import * as amqp from 'amqplib';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';

interface ChannelWithEventEmitter extends amqp.Channel {
  responseEmitter?: EventEmitter
}

export class QueueClient {
  private CONNECT_URI = 'amqp://localhost:5672';
  private QUEUE = 'test-queue';
  private REPLY_QUEUE = 'amq.rabbitmq.reply-to';  
  private params:Record<string, unknown>;
  private channel:ChannelWithEventEmitter;
  private connection:amqp.Connection;
  
  constructor(params={}) {
    this.params = params;
    this.connectQueue()  // call the connect function
  }

  private async connectQueue() {
    try {        
      this.connection = await amqp.connect(this.CONNECT_URI);
      this.channel = await this.connection.createChannel()
      
      this.channel.responseEmitter = new EventEmitter();
      this.channel.responseEmitter.setMaxListeners(0);

      await this.channel.assertQueue(this.REPLY_QUEUE);

      this.channel.consume(this.REPLY_QUEUE, (data:amqp.Message) => {
        this.channel.responseEmitter.emit(data.properties.correlationId, data.content.toString('utf-8'));
      }, {
        noAck: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async sendMessage(data:Record<string, unknown>, metadata:Record<string, unknown>={}, queue:string=this.QUEUE) {
    return this.sendRPCMessage(this.channel, data, queue);
  }
  
  private sendRPCMessage = (channel:ChannelWithEventEmitter, message:any, rpcQueue:string, metadata={}) => {
    return new Promise(resolve => {
      const correlationId = uuid.v4();
      channel.responseEmitter?.once(correlationId, resolve);
      channel.sendToQueue(rpcQueue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: this.REPLY_QUEUE,
        ...metadata,
      });
    });
  }
}

