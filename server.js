const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = { white: null, black: null };

io.on('connection', (socket) => {
    console.log('New Connection:', socket.id);

    let role = null;
    if (!players.white) {
        players.white = socket.id;
        role = 'white';
    } else if (!players.black) {
        players.black = socket.id;
        role = 'black';
    }

    socket.emit('playerRole', role);
    console.log(`Assigned ${role} to ${socket.id}`);

    // The move relay
    socket.on('move', (moveData) => {
        console.log('Relaying move:', moveData);
        socket.broadcast.emit('move', moveData);
    });

    // The chat relay
    socket.on('chatMessage', (msg) => {
        socket.broadcast.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.white) players.white = null;
        if (socket.id === players.black) players.black = null;
        console.log('User disconnected');
    });
});

server.listen(3000, () => console.log('Chess Server: http://localhost:3000'));