import { Server } from "socket.io";
import { Game } from "./Game";
export class EventManager {
    io: Server;
    game: Game;

    constructor(io: Server) {
        this.io = io;
        this.game = new Game(30, 16, 100);
    }

    start() {
        this.io.on('connection', (socket) => {
            this.io.emit("create", this.game.create());
            socket.on('click', (x, y, isBomb, name) => {
                this.onClick(x,y,isBomb,name)
            });
            socket.on('mark', (x: number, y: number) => {
                this.io.emit("mark", x, y);
            });
            socket.on('hover', (x: number, y: number, isOver: boolean) => {
                this.io.emit("hover", x, y, isOver);
            });
            socket.on('restart', () => {
                this.io.emit("restart", this.game.create());
            });
        });
    }

    onClick(x: number, y: number, isBomb: boolean, name: string) {
        if (!isBomb) {
            this.io.emit("show", x, y);
        } else {
            this.io.emit("showRestart", x, y, name);
        }
    }
}