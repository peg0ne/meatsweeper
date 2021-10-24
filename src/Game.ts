import { random } from "./Utils";

export class Game {
    sizeX: number;
    sizeY: number;
    bombs: number;
    constructor(sizeY: number, sizeX: number, bombs: number) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.bombs = bombs;
    }
    
    create() {
        var taken: number = 0;
        var grid: any = [];
        for (var x = 0; x < this.sizeX; x++) {
            grid.push([])
            for (var y = 0; y < this.sizeY; y++) {
                grid[x].push(false);
            }
        }
        while (taken < this.bombs) {
            var x = random(0, this.sizeX);
            var y = random(0, this.sizeY);
            if (!grid[x][y]) {
                grid[x][y] = true;
                taken++;
            }
        }
        return grid;
    }

    resize(x: number, y:number, bombs: number) {
         this.sizeX = x;
	 this.sizeY = y;
	 this.bombs = bombs;
    }
}
