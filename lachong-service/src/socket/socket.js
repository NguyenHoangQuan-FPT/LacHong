
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("🔌 Connected:", socket.id);

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // Nếu muốn test gửi qua socket, chỉ log và emit lại (không lưu DB)
        socket.on("sendMessage", (data) => {
            console.log('Socket sendMessage event:', data);
            // Demo: emit lại cho room, không lưu DB
            io.to(data.roomId).emit("receiveMessage", {
                ...data,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString()
            });
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.id);
        });
    });
};
