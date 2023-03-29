jest.mock('socket.io');
jest.mock('http');
import { EventEmitter } from 'events';
import * as socketio from 'socket.io';
import { IOEvent } from './../constants';
import { IOServer } from './io-server';

describe('IOServer', () => {
  const options = {};

  const server = (socketio as any).Server = new EventEmitter(options)
  let io: IOServer;

  describe(`init`, () => {
    it(`should initiialize server`, () => {
      io = new IOServer((server as any), {});
      expect(io.on).toBeCalledTimes(1);
    });
  });
})