require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const port = Number(process.env.PORT || 5001);
const frontendUrl = process.env.FRONT_END_URL || "http://localhost:3000";
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: frontendUrl,
        credentials: true,
    },
});
io.on("connection", (socket) => {
    socket.on("message", (message) => {
        io.emit("message", message);
    });
    socket.on("disconnect", () => {
    });
});
const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
    socket.on("message", (messageData) => {
        chatNamespace.emit("message", messageData);
    });
    socket.on("disconnect", () => {
    });
});
server.listen(port, () => {
});

