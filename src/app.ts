import http from 'http';
import { Server } from "socket.io";
import { EventManager } from "./EventManager";
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const eventManager = new EventManager(io);

eventManager.start();

app.use(express.static(__dirname + '/public'));

app.get('/', (req: any, res: any) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(8080, "0.0.0.0", () => {
    console.log('listening on 0.0.0.0:8080');
});