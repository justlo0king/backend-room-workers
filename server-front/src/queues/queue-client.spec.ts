jest.mock('amqplib');
import * as amqplib from 'amqplib';
import { QueueClient } from "./queue-client";

describe(`QueueClient`, () => {
  let queueClient: QueueClient;

  const assertQueueMock = jest.fn();
  const consumeMock = jest.fn();
  const sendToQueueMock = jest.fn()
  const connectMock = jest.fn(() => {
    return {
      createChannel: jest.fn(() => {
        return {
          assertQueue: assertQueueMock,
          consume: consumeMock,
          sendToQueue: sendToQueueMock,
        }
      }),
    };
  });
  (amqplib as any).connect = connectMock;


  describe(`connectQueue`, () => {
    it(`should initialize a client`, async () => {
      queueClient = new QueueClient({});
      expect(amqplib.connect).toBeCalledTimes(1);
    });
  });

  describe(`sendMessage`, () => {
    it(`should call channel.sendToQueue method`, async() => {
      queueClient.sendMessage({
        message: 'data'
      });
      expect(sendToQueueMock).toBeCalledTimes(1);
    });
  })
})