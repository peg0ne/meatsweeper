var sizeY = 30; //30
var sizeX = 16; //16
var bombs = 1;

function create() {
    var taken = 0;
    var grid = [];
    for (var x = 0; x < sizeX; x++) {
        grid.push([])
        for (var y = 0; y < sizeY; y++) {
            grid[x].push(false);
        }
    }
    while (taken < bombs) {
        var x = parseInt(Math.random() * sizeX);
        var y = parseInt(Math.random() * sizeY);
        if (!grid[x][y]) {
            grid[x][y] = true;
            taken++;
        }
    }
    bombs++;
    return grid;
}

module.exports = {
    create
}