var totalBombs = 0;
var bombsLeft = 0;
var grid = []
var bombCounter = document.getElementById("bombCounter");
var restartPage = document.getElementById("restartPage");
var restartButton = document.getElementById("restartButton");
restartButton.onclick = () => restartNow();
restartPage.oncontextmenu = (e) => {
    e.preventDefault();
    // restartNow();
};
var insults = [
    `Blame <b>{x}</b>! (he/she) is trash!`,
    `Consider <b>{x}</b>'s mom swept`,
    `<b>{x}</b> is a poop`,
    `Meatswept <b>{x}</b>, NOOB!!!!!`,
    `Call the cops because <b>{x}</b> is so bad it's criminal`
]

var socket = io();

socket.on("create", (g) => {
    if (document.getElementsByClassName("board").length == 0) {
        grid = g;
        create();
    } else {
        grid = g;
        restart();
    }
});

socket.on("showRestart", (x, y, name) => {
    restartPage.style.display = 'inline-grid';
    document.getElementById("restartButton").innerHTML = insults[parseInt(Math.random() * insults.length)].replace('{x}', name);
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return;
    var mainBoard = document.getElementById("mainBoard");
    var target = mainBoard.childNodes[x].childNodes[y];
    if (target) {
        target.className = 'bomb';
        target.innerText = 'local_fire_department';
    }
});

socket.on("restart", (g) => {
    restartPage.style.display = "none";
    grid = g;
    restart();
});

socket.on("show", (x, y) => {
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return;
    var mainBoard = document.getElementById("mainBoard");
    var target = mainBoard.childNodes[x].childNodes[y];
    if (target && target.className == "tile_hidden")
        target.className = target.className.replace("_hidden", "");
    else if (target && target.className == "tile_hidden_hover")
        target.className = target.className.replace("_hidden_hover", "");
    else return;

    var tiles = document.getElementsByClassName("tile").length;
    tiles += document.getElementsByClassName("tile_hover").length;
    tiles += document.getElementsByClassName("tile_zero").length;
    tiles += document.getElementsByClassName("tile_zero_hover").length;
    console.log(tiles, totalBombs);
    if (tiles + totalBombs == grid.length * grid[0].length) {
        restartPage.style.display = 'inline-grid';
        restartButton.innerText = 'Good Job! You made it... Finally';
        return;
    }

    var surrounding = checkSurrounding(x, y);
    target.innerText = surrounding;
    if (surrounding == 0) {
        target.innerText = ""
        target.className += "_zero";
        show(x, y + 1)
        show(x + 1, y + 1)
        show(x + 1, y)
        show(x + 1, y - 1)
        show(x, y - 1)
        show(x - 1, y - 1)
        show(x - 1, y)
        show(x - 1, y + 1)
    }
});

socket.on("mark", (x, y) => {
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return;
    var mainBoard = document.getElementById("mainBoard");
    var target = mainBoard.childNodes[x].childNodes[y];
    if (target && target.className.includes("_hidden")) {
        target.className = target.className.replace("_hidden", "_mark");
        target.innerText = "flag";
        bombsLeft--;
    } else if (target && target.className.includes("_mark")) {
        target.className = target.className.replace("_mark", "_hidden");
        target.innerText = "";
        bombsLeft++;
    }
    bombCounter.innerText = `Bombs Left: ${bombsLeft}`
});

socket.on("hover", (x, y, isOver) => {
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return;
    var mainBoard = document.getElementById("mainBoard");
    var target = mainBoard.childNodes[x].childNodes[y];
    if (!target) return;
    if (!target.className.includes("_hover") && isOver) {
        target.className += "_hover";
    } else {
        target.className = target.className.replace("_hover", "");
    }
});

function create() {
    bombsLeft = 0;
    var board = document.createElement('div');
    board.className = "board";
    board.id = "mainBoard";
    for (var x = 0; x < grid.length; x++) {
        var l = document.createElement('div');
        l.className = "line";
        for (var y = 0; y < grid[x].length; y++) {
            var t = document.createElement('div');
            t.className = grid[x][y] ? "bomb_hidden" : "tile_hidden";
            if (grid[x][y]) {
                bombsLeft++;
            }
            t.id = `${x}.${y}`
            t.onclick = (e) => {
                e.preventDefault();
                selection(e.target);
            }
            t.oncontextmenu = (e) => {
                e.preventDefault();
                mark(e.target);
            };
            t.onmouseenter = (e) => socket.emit("hover", e.target.id, true);
            t.onmouseleave = (e) => socket.emit("hover", e.target.id, false);
            l.appendChild(t);
        }
        board.appendChild(l);
    }
    document.body.appendChild(board);
    totalBombs = bombsLeft;
    bombCounter.innerText = `Bombs Left: ${bombsLeft}`
}

function checkSurrounding(x, y) {
    var sum = 0;
    if (grid[x][y - 1])
        sum++;
    if (grid[x][y + 1])
        sum++;
    if (grid[x - 1] && grid[x - 1][y])
        sum++;
    if (grid[x + 1] && grid[x + 1][y])
        sum++;
    if (grid[x + 1] && grid[x + 1][y + 1])
        sum++;
    if (grid[x + 1] && grid[x + 1][y - 1])
        sum++;
    if (grid[x - 1] && grid[x - 1][y + 1])
        sum++;
    if (grid[x - 1] && grid[x - 1][y - 1])
        sum++;
    return sum;
}

function restart() {
    document.getElementsByClassName("board")[0].remove();
    create();
}

function restartNow() {
    restartPage.style.display = 'none';
    socket.emit("restart");
}

function selection(target) {
    var pos = target.id.split('.');
    var x = parseInt(pos[0]);
    var y = parseInt(pos[1]);
    if (document.getElementById('name').value == "") {
        alert("write your damn name so we know who to blame!");
        return;
    }
    if (!target.className.includes('mark')) {
        socket.emit("click", x, y, target.className.includes('bomb'), document.getElementById('name').value);
        show(x, y, target.className.includes('bomb'));
    }
}

function mark(target) {
    var pos = target.id.split('.');
    var x = parseInt(pos[0]);
    var y = parseInt(pos[1]);
    if (document.getElementById('name').value == "") {
        alert("write your damn name so we know who to blame!");
        return;
    }
    socket.emit("mark", x, y)
}

function show(x, y, isBomb) {
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return;

    var mainBoard = document.getElementById("mainBoard");
    var target = mainBoard.childNodes[x].childNodes[y];
    if (!isBomb && target && target.className == "tile_hidden")
        target.className = target.className.replace("_hidden", "");
    else if (!isBomb && target && target.className == "tile_hidden_hover")
        target.className = target.className.replace("_hidden_hover", "");
    else {
        return;
    }

    var tiles = document.getElementsByClassName("tile").length;
    tiles += document.getElementsByClassName("tile_hover").length;
    tiles += document.getElementsByClassName("tile_zero").length;
    tiles += document.getElementsByClassName("tile_zero_hover").length;
    console.log(tiles, totalBombs);
    if (tiles + totalBombs == grid.length * grid[0].length) {
        restartPage.style.display = 'inline-grid';
        restartButton.innerText = 'Good Job! You made it... Finally';
        return;
    }

    var surrounding = checkSurrounding(x, y);
    target.innerText = surrounding;
    if (surrounding == 0) {
        target.innerText = ""
        target.className += "_zero";
        show(x, y + 1)
        show(x + 1, y + 1)
        show(x + 1, y)
        show(x + 1, y - 1)
        show(x, y - 1)
        show(x - 1, y - 1)
        show(x - 1, y)
        show(x - 1, y + 1)
    }
}