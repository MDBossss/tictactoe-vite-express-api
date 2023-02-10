const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });


io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log("Joined room " + data)
    })

    socket.on("send_move", (data) => {
      socket.to(data.roomCode).emit("recieve_move",data);
    })

});

server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);