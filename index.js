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

const opponentLeft = (roomCode,socket) => {
  socket.to(roomCode).emit("opponent_left",roomCode);
}

io.on("connection", (socket) => {
  console.log("CONNECTED user: " + socket.id);

    socket.on("join_room", (roomCode) => {
      socket.join(roomCode);
      addRoomCount(roomCode);
      setSocketIDtoRoomCode(socket.id,roomCode);
      startGameIfFull(roomCode,socket);
      console.log("JOINED room:" + roomCode + ", users in room: " + countClientsInRoom(roomCode) + ", socket ID: " + socket.id)
    })

    socket.on("send_move", (data) => {
      socket.to(data.roomCode).emit("recieve_move",data);
    })

    socket.on("leave_room", (roomCode) => {
      if(roomCode !== null){

        socket.leave(roomCode);
        removeRoomCountBySocketID(socket.id);
        console.log("LEFT room:" + roomCode + ", users in room: " + countClientsInRoom(roomCode) + ", socket ID: " + socket.id)

        if(countClientsInRoom(roomCode) == 1){
          opponentLeft(roomCode,socket);
        }
      }
    })


    socket.on("disconnect", () => {
      removeRoomCountBySocketID(socket.id);
      console.log("DISCONNETED user: " + socket.id);
      //console.log("Removing user from room: " + socketIdRoomCodeMap.get(socket.id));
     // console.log("Left room, users in room: "+ countClientsInRoom(socketIdRoomCodeMap.get(socket.id)));
    })
});


server.listen(port, () => console.log("server running on port" + port));