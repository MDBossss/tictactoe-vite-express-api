const io = require("socket.io")(5000,{cors: {origin:"*"}});


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