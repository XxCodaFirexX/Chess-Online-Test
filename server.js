const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve your HTML file
app.use(express.static(__dirname));

let players = { white: null, black: null };

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let role = null;
    if (!players.white) {
        players.white = socket.id;
        role = 'white';
    } else if (!players.black) {
        players.black = socket.id;
        role = 'black';
    }

    socket.emit('playerRole', role);

    socket.on('move', (moveData) => {
        socket.broadcast.emit('move', moveData);
    });

    socket.on('chatMessage', (msg) => {
        socket.broadcast.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.white) players.white = null;
        if (socket.id === players.black) players.black = null;
        console.log('User disconnected');
    });
});

// IMPORTANT: Render uses process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
