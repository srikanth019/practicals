import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user has connected", socket.id);
  //   socket.on("disconnect", () => {
  //     console.log("user disconnected");
  //   });
  socket.on("clint-chat-message", (msg) => {
    console.log("Clint chat message: " + msg);
    io.emit("clint-chat-message", msg);
  });
  socket.on("hello", (arg) => {
    console.log(arg); // 'world'
  });
  //   socket.on("test-json", (data) => {
  //     console.log(/data/, data);
  //   });

  socket.emit("test-json", { message: "This message is from server." });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
