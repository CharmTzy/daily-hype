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
function getChatRoomName(roomId) {
    if (!roomId) {
        return null;
    }

    return `chat-room:${roomId}`;
}

chatNamespace.on("connection", (socket) => {
    const initialRoomId = String(socket.handshake.query.roomId || "").trim();
    const initialRoomName = getChatRoomName(initialRoomId);

    if (initialRoomName) {
        socket.join(initialRoomName);
        socket.data.roomId = initialRoomId;
    }

    socket.on("join-room", (roomId) => {
        const roomName = getChatRoomName(String(roomId || "").trim());
        if (!roomName) {
            return;
        }

        socket.join(roomName);
        socket.data.roomId = String(roomId);
    });

    socket.on("leave-room", (roomId) => {
        const roomName = getChatRoomName(String(roomId || "").trim());
        if (!roomName) {
            return;
        }

        socket.leave(roomName);
    });

    socket.on("message", (messageData) => {
        const targetRoomId = String(messageData?.roomId || socket.data.roomId || "").trim();
        const targetRoomName = getChatRoomName(targetRoomId);

        if (!targetRoomName) {
            return;
        }

        chatNamespace.to(targetRoomName).emit("message", {
            ...messageData,
            roomId: targetRoomId,
        });
    });
    socket.on("disconnect", () => {
    });
});
server.listen(port, () => {
});

