![alt text](https://github.com/justlo0king/backend-room-workers/blob/main/room_workers.png?raw=true)

# Node.js workers for room logic and user connections

## Run instructions:
- Run `rabbitmq` by docker-compose:
```
docker-compose up -d
```

- Run room workers:
```
cd server-front
# npm install
APP_ID=rooms01 npm run dev
# new terminal
APP_ID=rooms02 npm run dev
```

- Run connection workers. APP_ID defines namespace for a set of rooms to handle them by related server.
```
cd server-rooms
# npm install
PORT=3030 npm run dev
# new terminal
PORT=3031 npm run dev
```

- Run clients. PORT defines connection server to connect to. ROOM_ID starts with APP_ID of a room server. 
```
cd client
# npm install
PORT=3030 ROOM_ID=rooms01-01 node client.js
# new terminal
PORT=3031 ROOM_ID=rooms02-01 node client.js
```

Once connected, client sends request to join a room. Connection worker directs it to related room worker and then passes response back to the user.