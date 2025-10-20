const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let videoLink = "";

io.on("connection", (socket) => {
  console.log("Yeni istifadəçi qoşuldu");
  socket.emit("video-link", videoLink);

  socket.on("set-video-link", (link) => {
    videoLink = link;
    io.emit("video-link", link);
  });

  socket.on("send-message", (msg) => {
    io.emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("İstifadəçi ayrıldı");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
