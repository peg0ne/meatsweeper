const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const game = require("./game")
var g = game.create();
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    io.emit("create", g);
    socket.on('click', (x, y, isBomb, name) => {
        if (!isBomb) {
            io.emit("show", x, y);
        } else {
            io.emit("showRestart", x, y, name);
        }
    });
    socket.on('mark', (x, y) => {
        io.emit("mark", x, y);
    });
    socket.on('hover', (id, isOver) => {
        var pos = id.split('.');
        var x = parseInt(pos[0]);
        var y = parseInt(pos[1]);
        io.emit("hover", x, y, isOver)
    });
    socket.on('restart', () => {
        g = game.create();
        io.emit("restart", g);
    });
});

server.listen(8080, "0.0.0.0", () => {
    console.log('listening on *:3000');
});