require('dotenv').config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const port = process.env.PORT || 5000;
const io = require("socket.io")(server, {cors: { origin: "*"}});


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


server.listen(port, () => console.log("server running on port" + port));