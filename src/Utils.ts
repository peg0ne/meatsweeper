export function random(min: number, max:number) {
    return Math.floor(Math.random() * (max-min));
}

export function parseTargetId(id: string): Vector2 {
    var pos: string[] = id.split('.');
    var x: number = parseInt(pos[0]);
    var y: number = parseInt(pos[1]);
    return new Vector2(x,y);
}

export class Vector2 {
    x: number;
    y: number;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }
}
