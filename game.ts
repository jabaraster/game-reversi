const enum DiskKind {
    White = 0,
    Black = 1,
    Undecided = 2,
}

class Vec2 {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    scanAll(operation: (x:number, y: number) => void) {
        for (let yy = 0; yy < this.y; ++yy) {
            this.scanRow((x) => {
                operation(x, yy)
            });
        }
    }
    mapAll<R>(operation: (x:number, y: number) => R): R[][] {
        const ret: R[][] = []
        for (let yy = 0; yy < this.y; ++yy) {
            ret[yy] = this.mapRow((x) => {
                return operation(x, yy);
            });
        }
        return ret;
    }
    scanRow(operation: (x: number) => void) {
        for (let xx = 0; xx < this.x; ++xx) {
            operation(xx);
        }
    }
    mapRow<R>(operation: (x: number) => R): R[] {
        const ret: R[] = [];
        for (let xx = 0; xx < this.x; ++xx) {
            ret[xx] = operation(xx);
        }
        return ret;
    }
    up(): Vec2 {
        return this.y === 0 ? this :  new Vec2(this.x, this.y - 1);
    }
    down(maxY: number): Vec2 {
        return this.y + 1 >= maxY ? this : new Vec2(this.x, this.y + 1);
    }
    left(): Vec2 {
        return this.x === 0 ? this : new Vec2(this.x - 1, this.y);
    }
    right(maxX: number): Vec2 {
        return this.x + 1 >= maxX ? this : new Vec2(this.x + 1, this.y);
    }
}
class Game {

    readonly board = new Vec2(8, 8);
    readonly manual = "[w: ↑][a: ←][d: →][s: ↓]";
    readonly diskStates: DiskKind[][] = this.board.mapAll((x, y) => {
        return DiskKind.Undecided;
    });

    turn = DiskKind.Black;
    cursorPosition = new Vec2(0, 0);
    message = "";

    constructor() {
        this.diskStates[3][3] = DiskKind.White;
        this.diskStates[3][4] = DiskKind.Black;
        this.diskStates[4][3] = DiskKind.Black;
        this.diskStates[4][4] = DiskKind.White;
    }
    cursorPositionDiskKind(): DiskKind {
        return this.diskStates[this.cursorPosition.x][this.cursorPosition.y];
    }
}

document.addEventListener("keydown", (evt) => {
    handleKeyEvent(evt);    
});

let game: Game;
const init = function() {
    game = new Game();
    draw();
};
const handleKeyEvent = function(evt: KeyboardEvent) {
    switch (evt.key) {
        case "W":
        case "w":
            game.cursorPosition = game.cursorPosition.up();
            break;
        case "a":
        case "A":
            game.cursorPosition = game.cursorPosition.left();
            break;
        case "s":
        case "S":
            game.cursorPosition = game.cursorPosition.down(game.board.y);
            break;
        case "d":
        case "D":
            game.cursorPosition = game.cursorPosition.right(game.board.x);
            break;
        default:
            putDisk();
            break;
    }
    draw();
};
const putDisk = function() {
    if(!canPut()) {
        game.message = "そこに石は置けません。";
        return;
    }
    game.message = "";
    game.diskStates[game.cursorPosition.x][game.cursorPosition.y] = game.turn;
    game.turn = game.turn === DiskKind.Black ? DiskKind.White : DiskKind.Black;
};
const canPut = function(): boolean {
    if (game.cursorPositionDiskKind() === DiskKind.Undecided) {
        return true;
    }
    // 挟める位置かどうか
    return false;
}

const display = document.getElementById("display")!;
const message = document.getElementById("message")!;
const DISK_CHARS = ["〇", "●", "・"]
const DISK_CHAR_NAMES = ["白", "黒"]
const draw = function() {
    let html = "";

    // 盤面描画
    html += "　";
    game.board.scanRow((x) => {
        html += x === game.cursorPosition.x ? "|↓" : "|　";
    });
    html += "|";
    game.board.scanAll((x, y) => {
        if (x === 0) {
            html += "<br>"
            html += y === game.cursorPosition.y ? "→|" : "　|";
        }

        if (x === game.cursorPosition.x && y === game.cursorPosition.y) {
            html += `<span style="color:red;">${DISK_CHARS[game.diskStates[x][y]]}</span>|`
        } else {
            html += `${DISK_CHARS[game.diskStates[x][y]]}|`
        }
    });

    // メッセージと操作方法描画
    html += `<br>${DISK_CHAR_NAMES[game.turn]}の番です。`
    html += `<br>${game.message}<br>${game.manual}`;

    display.innerHTML = html;
};

init();