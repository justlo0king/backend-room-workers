const { io } = require('socket.io-client');
const uuid = require('uuid');
const ROOM_ID = process.env.ROOM_ID || `rooms01-abc`;
const socket = io(`http://localhost:${process.env.PORT || 8080}`);

socket.on('connect', () => {
  console.log(`connected`);
  setTimeout(async () => {
    check();
  }, 2000);
});

const check = async () => {
  console.log(`check: requesting`);
  command('join',  { roomId: ROOM_ID }).then((response) => {
    console.log(`check: response:`, response);
  }).catch((error) => {
    console.error(`check: error:`, error);
  });
}

socket.on('message', (data) => { 
  console.log(`message:`, data);
});
socket.on('join', (data) => { 
  console.log(`join:`, data);
});

socket.on('leave', (data) => { 
  console.log(`leave:`, data);
});

socket.on('command-result', async (data) => { 
  const { cmdId } = data || {};
  const { resolve, reject } = commandCallbacks[cmdId] || {};
  if (resolve) {
    try {
      await resolve(data);
    } catch(error) {
      console.error(`failed to resolve result, error:`, error);
    }
    setTimeout(() => {
      delete commandCallbacks[cmdId];
    }, 1000);
  }
});

const commandCallbacks = {};
const command = async (cmd, payload) => {
  return new Promise((resolve, reject) => {
    const cmdId = uuid.v4();
    commandCallbacks[cmdId] = { resolve, reject };
    socket.emit('command', { 
      cmdId, cmd, payload
    });
  });
}


