//constants
const insults = [
    `Blame <b>{x}</b>! (he/she) is trash!`,
    `Consider <b>{x}</b>'s mom swept`,
    `<b>{x}</b> is a poop`,
    `Meatswept <b>{x}</b>, NOOB!!!!!`,
    `Call the cops because <b>{x}</b> is so bad it's criminal`,
];

//game
var totalBombs = 0;
var bombsLeft = 0;
var time = 0;
var grid = [];
var start = true;

//elements
var bombCounter = document.getElementById("bombCounter");
var restartPage = document.getElementById("restartPage");
var restartButton = document.getElementById("restartButton");
var nameInput = document.getElementById("name");
var timer = document.getElementById("timer");
var sizeX = document.getElementById("sizeX");
var sizeY = document.getElementById("sizeY");
var amountOfBombs = document.getElementById("bombAmount");

//start
var socket = io();
setupRestartPage();
setupResize();

//socket
socket.on("create", (g) => {
    setPlayArea(g);
});
socket.on("restart", (g) => {
    setPlayArea(g);
});
socket.on("show", (x, y) => {
    show(x, y);
});
socket.on("mark", (x, y) => {
    setTargetState(x, y, "mark");
});
socket.on("hover", (x, y, isOver) => {
    setTargetState(x, y, isOver ? "hover" : "unHover");
});
socket.on("showRestart", (x, y, name) => {
    showEndScreen(name, false);
    setTargetState(x, y, "bomb");
});

function create() {
    bombsLeft = 0;
    time = 0;
    start = false;
    var board = document.createElement("div");
    board.className = "board";
    board.id = "mainBoard";
    for (var x = 0; x < grid.length; x++) {
        var l = document.createElement("div");
        l.className = "line";
        for (var y = 0; y < grid[x].length; y++) {
            var t = document.createElement("div");
            t.className = grid[x][y] ? "bomb_hidden" : "tile_hidden";
            if (grid[x][y]) {
                bombsLeft++;
            }
            t.id = `${x}.${y}`;
            t.onclick = (e) => {
                e.preventDefault();
                selection(e.target);
            };
            t.oncontextmenu = (e) => {
                e.preventDefault();
                mark(e.target);
            };
            t.onwheel = (e) => {
                e.preventDefault();
                mark(e.target);
            };
            t.onmouseenter = (e) =>
                socket.emit(
                    "hover",
                    parseInt(e.target.id.split(".")[0]),
                    parseInt(e.target.id.split(".")[1]),
                    true
                );
            t.onmouseleave = (e) =>
                socket.emit(
                    "hover",
                    parseInt(e.target.id.split(".")[0]),
                    parseInt(e.target.id.split(".")[1]),
                    false
                );
            l.appendChild(t);
        }
        board.appendChild(l);
    }
    document.body.appendChild(board);
    totalBombs = bombsLeft;
    bombCounter.innerText = `Bombs Left: ${bombsLeft}`;
    start = true;
    timerStart();
}

function checkSurrounding(x, y) {
    var sum = 0;
    if (grid[x][y - 1]) sum++;
    if (grid[x][y + 1]) sum++;
    if (grid[x - 1] && grid[x - 1][y]) sum++;
    if (grid[x + 1] && grid[x + 1][y]) sum++;
    if (grid[x + 1] && grid[x + 1][y + 1]) sum++;
    if (grid[x + 1] && grid[x + 1][y - 1]) sum++;
    if (grid[x - 1] && grid[x - 1][y + 1]) sum++;
    if (grid[x - 1] && grid[x - 1][y - 1]) sum++;
    return sum;
}

function selection(target) {
    if (hasName() && !target.className.includes("mark")) {
        var pos = parseId(target.id);
        var b = isBomb(target);
        socket.emit("click", pos[0], pos[1], b, nameInput.value);
    }
}

function mark(target) {
    if (hasName()) {
        var pos = parseId(target.id);
        socket.emit("mark", pos[0], pos[1]);
    }
}

function setupRestartPage() {
    restartButton.onclick = () => {
        hide(restartPage);
        socket.emit("restart");
    };
    restartPage.oncontextmenu = (e) => {
        e.preventDefault();
        hide(restartPage);
        socket.emit("restart");
    };
}

function setupResize() {
    sizeX.onchange = (e) => {
	start = false;
        socket.emit("resize", sizeX.value, sizeY.value, amountOfBombs.value);
    };
    sizeY.onchange = (e) => {
	start = false;
        socket.emit("resize", sizeX.value, sizeY.value, amountOfBombs.value);
    };
    amountOfBombs.onchange = (e) => {
        start = false;
        socket.emit("resize", sizeX.value, sizeY.value, amountOfBombs.value);
    };
}

function setPlayArea(g) {
    grid = g;
    hide(restartPage);
    if (document.getElementsByClassName("board").length > 0) {
        document.getElementsByClassName("board")[0].remove();
    }
    create();
}

function parseId(id) {
    var pos = id.split(".");
    var x = parseInt(pos[0]);
    var y = parseInt(pos[1]);
    return [x, y];
}

function hasName() {
    if (nameInput.value == "") {
        alert("write your damn name so we know who to blame!");
        return false;
    }
    return true;
}

function hide(ele) {
    ele.style.display = "none";
}

function setDisplay(ele, state) {
    ele.style.display = state;
}

function isBomb(target) {
    return target.className.includes("bomb");
}

function isWithinBounds(x, y) {
    if (x >= grid.length || y >= grid[0].length || y < 0 || x < 0) return false;
    else return true;
}

function targetExists(x, y) {
    var mainBoard = document.getElementById("mainBoard");
    if (!mainBoard) return false;
    else if (!mainBoard.childNodes[x]) return false;
    else if (!mainBoard.childNodes[x].childNodes[y]) return false;
    else return true;
}

function show(x, y) {
    if (!isWithinBounds(x, y) || !targetExists(x, y)) return;
    var target = mainBoard.childNodes[x].childNodes[y];
    if (isBomb(target) || isVisible(target)) return;
    setTargetState(x, y, "show");
    var surrounding = checkSurrounding(x, y);
    target.innerText = surrounding;
    if (surrounding == 0) {
        target.innerText = "";
        target.className += "_zero";
        show(x, y + 1);
        show(x + 1, y + 1);
        show(x + 1, y);
        show(x + 1, y - 1);
        show(x, y - 1);
        show(x - 1, y - 1);
        show(x - 1, y);
        show(x - 1, y + 1);
    }
}

function setTargetState(x, y, state) {
    if (!isWithinBounds(x, y) || !targetExists(x, y)) return;
    var target = mainBoard.childNodes[x].childNodes[y];
    switch (state) {
        case "bomb":
            target.className = "bomb";
            target.innerText = "local_fire_department";
            break;
        case "show":
            showHidden(target);
            if (hasWon()) {
                showEndScreen(nameInput.value, true);
            }
            break;
        case "mark":
            if (
                !target.className.includes("_mark") &&
                target.className.includes("_hidden")
            ) {
                target.className = target.className.replace("_hidden", "_mark");
                target.innerText = "flag";
                bombsLeft--;
            } else if (target.className.includes("_mark")) {
                target.className = target.className.replace("_mark", "_hidden");
                target.innerText = "";
                bombsLeft++;
            }
            bombCounter.innerText = `Bombs Left: ${bombsLeft}`;
            break;
        case "hover":
            if (!target.className.includes("_hover"))
                target.className += "_hover";
            break;
        case "unHover":
            target.className = target.className.replace("_hover", "");
            break;
        default:
            break;
    }
}

function isVisible(target) {
    return !target.className.includes("_hidden", "");
}

function showHidden(target) {
    target.className = target.className
        .replace("_hidden", "")
        .replace("_hover", "");
}

function hasWon() {
    var tiles = document.getElementsByClassName("tile").length;
    tiles += document.getElementsByClassName("tile_hover").length;
    tiles += document.getElementsByClassName("tile_zero").length;
    tiles += document.getElementsByClassName("tile_zero_hover").length;
    if (tiles + totalBombs == grid.length * grid[0].length) {
        return true;
    }
    return false;
}

function showEndScreen(name, success) {
    start = false;
    setDisplay(restartPage, "inline-grid");
    var text = "";
    if (success) {
	// add best time
        text = "Good Job! You made it... Finally";
    }
    else
        text = insults[parseInt(Math.random() * insults.length)].replace(
            "{x}",
            name
        );
    restartButton.innerHTML = text;
}

function timerStart() {
    if (!start) return;
    time += 1;
    timer.innerText = `Time: ${time}`;
    setTimeout(() => {
        if (start) timerStart();
    }, 1000);
}
