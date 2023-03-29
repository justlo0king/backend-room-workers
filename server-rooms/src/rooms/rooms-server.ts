import { Room } from "./room";

export class RoomsController {
  private APP_ID = '';
  private rooms: Record<string, Room> = {};
  
  constructor(params:Record<string, unknown>) {
    if (params.APP_ID) this.APP_ID = params.APP_ID as string;
  }

  public async command(data:Record<string, any>) {
    const { payload, contextId, cmd, cmdId } = data || {};    
    console.log(`RoomsController.command: data:`, data);
    let result:Record<string, unknown>;
    switch(cmd) {
      case 'join':
        result = await this.roomJoin(data);
        break;
    }
    return {
      payload: result,
      contextId, cmd, cmdId
    };

    return {};
  }

  private async roomJoin(data: Record<string, any>) {
    const { payload, contextId, cmd, cmdId } = data || {};
    const roomId:string = String(payload?.roomId || '');
    if (!roomId) {
      return;
    }
    let room = this.rooms[roomId];
    if (!room) {
      room = this.rooms[roomId] = new Room({ id: roomId });
    }
    return room.join(payload);
  }
}