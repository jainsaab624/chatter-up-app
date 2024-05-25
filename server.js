import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import chatModel from "./chats.schema.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let userCount = 0;
let users = [];

// when user connected
io.on("connection", (socket) => {
  console.log("connection established");

  socket.on("user-joined", async (userName) => {
    // emitting welcome message
    socket.emit("welcome-message", { userName });

    const newUsers = { userName, socketId: socket.id };
    users.push(newUsers);
    console.log(`${userName.userName} joined`);
    userCount++;
    // emitting new user joined
    io.emit("user-joined", userName.userName);

    // Broadcast to other users that a new user has joined
    socket.broadcast.emit("user-joined-message", { userName });

    // Emitting the users array for the newly joined user.
    io.emit(
      "users-list",
      users.map((user) => user.userName)
    );

    // users chat history find
    const chats = await chatModel.find().sort({ createdAt: 1 });
    // users chat history emit
    socket.emit("chat-history", chats);

    // emit users count
    io.emit("users-count", userCount);
  });

  socket.on("user-typing", (userName) => {
    socket.broadcast.emit("user-typing", userName);
  });

  // Listen for "user-stopped-typing" event from clients
  socket.on("user-stopped-typing", (userName) => {
    // Broadcast "user-stopped-typing" event to all other clients
    socket.broadcast.emit("user-stopped-typing", userName);
  });

  socket.on("new-message", async (userMessage) => {
    try {
      const newMessage = new chatModel({
        user: userMessage.user,
        message: userMessage.message,
        avatar: userMessage.avatar,
        createdAt: new Date().toUTCString(),
      });
      await newMessage.save();
      console.log(newMessage);

      socket.broadcast.emit("broadcast-messages", newMessage);

      socket.emit("new-message-received");
    } catch (error) {
      throw new Error("unable to get the new messages");
    }
  });

  //   when user disconnected..
  socket.on("disconnect", () => {
    console.log("user disconnected");

    userCount--;

    // emit users count
    io.emit("users-count", userCount);

    // Remove the disconnected user from the list
    const disconnectedSocketId = socket.id;
    // console.log(disconnectedSocketId)
    const index = users.findIndex(
      (user) => user.socketId === disconnectedSocketId
    );

    if (index !== -1) {
      const disconnectedUser = users.splice(index, 1)[0];
      // console.log(disconnectedUser)
      // Emit the updated user list to all clients
      io.emit(
        "users-list",
        users.map((user) => user.userName)
      );
      //   console.log(`${userName.userName} disconnected`);

        // Broadcast that the user has disconnected
    io.emit("user-disconnected", disconnectedUser.userName);
    }
  });
});

export default server;
