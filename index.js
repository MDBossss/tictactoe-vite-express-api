require('dotenv').config();
const port = process.env.PORT || 5000;

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors({origin: "*"}));

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {cors: { origin: '*'}});

const roomCodeUserCountMap = new Map();
const socketIdRoomCodeMap = new Map();

const countClientsInRoom = (room) => {
  return roomCodeUserCountMap.get(room);
}

const addRoomCount = (room) => {
  if(!roomCodeUserCountMap.has(room)){
    roomCodeUserCountMap.set(room,0);
  }
  roomCodeUserCountMap.set(room,roomCodeUserCountMap.get(room) + 1);
}

const removeRoomCountBySocketID = (id) => {
  var room = socketIdRoomCodeMap.get(id);
  roomCodeUserCountMap.set(room,roomCodeUserCountMap.get(room) - 1);
}

const setSocketIDtoRoomCode = (id,room) => {
  if(socketIdRoomCodeMap.has(id)){
    return;
  }
  socketIdRoomCodeMap.set(id,room);
}

const startGameIfFull = (roomCode, socket) => {
  if(countClientsInRoom(roomCode) == 2){
    socket.to(roomCode).emit("start_game");
    socket.emit("start_game");
  }
}


io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join_room", (roomCode) => {
      socket.join(roomCode);
      addRoomCount(roomCode);
      setSocketIDtoRoomCode(socket.id,roomCode);
      startGameIfFull(roomCode,socket);
      //console.log("Joined room:" + data + ", users in room: " + countClientsInRoom(data) + ", socket ID: " + socket.id)
    })

    socket.on("send_move", (data) => {
      //console.log(countClientsInRoom(data))
      socket.to(data.roomCode).emit("recieve_move",data);
    })


    socket.on("disconnect", () => {
      removeRoomCountBySocketID(socket.id);
      //console.log("Removing user from room: " + socketIdRoomCodeMap.get(socket.id));
     // console.log("Left room, users in room: "+ countClientsInRoom(socketIdRoomCodeMap.get(socket.id)));
    })
});


server.listen(port, () => console.log("server running on port" + port));