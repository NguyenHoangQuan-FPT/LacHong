const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setIo } = require('./src/socket/io');
const socketHandler = require('./src/socket/socket');

const server = http.createServer(app);

const effectiveAllowedOrigins = app.get('effectiveAllowedOrigins') || [
    'http://localhost:5173',
    'http://localhost:3000'
];

const io = new Server(server, {
    // Keep polling enabled as fallback; websocket will be preferred automatically.
    transports: ['websocket', 'polling'],
    cors: {
        origin: effectiveAllowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true
    }
});

setIo(io);
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
