/*require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, function () {
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${port}`);
});*/

// server.js

//const express = require('express');

require("dotenv").config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

//const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Your existing routes and middleware can go here

// Handle the default namespace '/'
io.on('connection', (socket) => {
  console.log('A user connected to the default namespace');

  // Listen for incoming messages
  socket.on('message', (message) => {
    // Broadcast the message to all connected clients
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from the default namespace');
  });
});

// Handle the '/chat' namespace
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  const deliveryId = socket.handshake.query.deliveryId; // Access the dynamic parameter from the query
  console.log('A user connected to the chat namespace');

  // Listen for incoming messages in the chat namespace
  // Handle incoming messages
  socket.on("message", (messageData) => {
    console.log("Received message:", messageData.text);
    console.log("User ID:", messageData.speakerId);

    // Broadcast the message to all connected clients in the chat namespace
    chatNamespace.emit('message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from the chat namespace');
  });
});

const port = process.env.PORT || 5001;

//const mainlink = process.env.BACK_END_URL || "http://localhost:5001";

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



