const express = require("express");
const app = express();
const http = require("http").Server(app);


const io = require("socket.io")(http);


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


http.listen(5000, () => console.log("server running on port 5000"));