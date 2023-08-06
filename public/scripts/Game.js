import { drawBoard, createTiles } from "./gameBoard.js";
import { changeColor, checkWin } from "./helper.js";
export class Game {
    constructor(socket) {
        this.turn = 0;
        this.tile_array = drawBoard(this.buttonHandler, this.startHandler);
        this.g = createTiles(this.tile_array);
        this.socket = socket;
    }
    get getSocket() {
        return this.socket;
    }
    get getTileArray() {
        return this.tile_array;
    }
    get getTileGraph() {
        return this.g;
    }
    get getTurn() {
        return this.turn;
    }
    set incrementTurn(val) {
        this.turn += 1;
    }
    set buttonHandler(evt) {
        if (evt.target != null && evt.target instanceof Element) {
            let test_arr = (evt.target.id).split('_');
            let r = test_arr[0];
            let r_coord = parseInt(test_arr[1]);
            let c = test_arr[2];
            let c_coord = parseInt(test_arr[3]);
            //RECONSTRUCT hex_id
            if (r === 'r' && c === 'c') {
                const num = this.getTurn;
                let color = (num % 2) == 0 ? "red" : "blue";
                console.log(this.tile_array);
                changeColor(r_coord, c_coord, color, this.tile_array);
                console.log(this.tile_array);
                this.getSocket.emit("colorChange", { row: r_coord, col: c_coord, color: color });
                let win = checkWin(color, this.tile_array, this.g);
                if (win) {
                    if (color == "red") {
                        window.alert("Red has won!");
                        console.log("Red has won! Press the restart button to play again!");
                    }
                    else {
                        window.alert("Blue has won!");
                        console.log("Blue has won! Press the restart button to play again!");
                    }
                }
                this.incrementTurn;
            }
            evt.stopPropagation();
        }
    }
    set startHandler(evt) {
        let r = 2;
        while (r <= 12) {
            let c = 2;
            while (c <= 12) {
                let hex_container_id = 'r_' + r + '_c_' + c;
                let hex_container = document.querySelector("#" + hex_container_id);
                if ((hex_container === null || hex_container === void 0 ? void 0 : hex_container.className) == "true") {
                    hex_container.className = "false";
                    let hex_upper = document.getElementById(hex_container_id + "_upper");
                    let hex_middle = document.getElementById(hex_container_id + "_middle");
                    let hex_lower = document.getElementById(hex_container_id + "_lower");
                    if (hex_upper != null) {
                        hex_upper.style.borderBottomColor = "#6C8";
                    }
                    //middle
                    if (hex_middle != null) {
                        hex_middle.style.background = "#6C8";
                    }
                    //bottom
                    if (hex_lower != null) {
                        hex_lower.style.borderTopColor = "#6C8";
                    }
                }
                c += 1;
            }
            r += 1;
        }
        let i = 0;
        while (i < 11) {
            let k = 0;
            while (k < 11) {
                this.tile_array[i][k].set_color("#6C8");
                k += 1;
            }
            i += 1;
        }
    }
}
export default Game;
