export class Room {
  private _id: string;

  get id(): string {
    return this._id;
  }

  constructor(params:Record<string, unknown>) {
    const { id } = params;
    this._id = String(params.id) || '';
  }

  public async join(data:Record<string, unknown>) {
    console.log(`Room.join: data:`, data);
    return {
      joined: true, roomId: this._id
    };
  }

}