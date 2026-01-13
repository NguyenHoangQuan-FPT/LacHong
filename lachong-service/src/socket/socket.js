
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        socket.on("joinRoom", (roomId) => {
            if (!roomId) {
                return;
            }
            const roomStr = String(roomId);
            socket.join(roomStr);
        });

        socket.on("leaveRoom", (roomId) => {
            if (!roomId) return;
            const roomStr = String(roomId);
            socket.leave(roomStr);
        });

        socket.on("sendMessage", (data) => {
            const roomStr = String(data.roomId);
            io.to(roomStr).emit("receiveMessage", {
                ...data,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString()
            });
        });

        socket.on("disconnect", (reason) => {
        });

        socket.on("error", (error) => {
        });
    });
};
