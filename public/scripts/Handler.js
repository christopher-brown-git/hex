import {changeColor, checkWin} from "./helper.js"
import Board from "./Board.js"

export class Handler{
    myColor;
    board; 
    constructor(board, color){
        this.myColor = color
        this.board = board
    }

    async getTurn() {
        try {
            let res = await axios({
                url: 'http://localhost:3000/turn',
                method: 'get',
                timeout: 8000,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (res.status == 200){
                console.log(res.status)
            }
            return res.data
        }
        catch (e){
            console.error(e);
        }
    }

    async setTurn(newTurn){
        try{
            let res = await axios({
                url: 'http://localhost:3000/turn',
                method: 'post',
                timeout: 8000,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                            turn: newTurn
                        }
            })
            if (res.status == 200){
                console.log(res.status)
            }
            return res.data 
        }
        catch (e){
            console.error(e);
        }
    }

    getButtonHandler() {
        return evt => {
            if (evt.target != null && evt.target instanceof Element){
                let test_arr = (evt.target.id).split('_');

                let r  = test_arr[0];
                let r_coord  = parseInt(test_arr[1]);
                let c = test_arr[2];
                let c_coord  = parseInt(test_arr[3]);
                
                const div_id = 'r_' + r_coord + '_c_' + c_coord;
                
                if (r === 'r' && document.getElementById(div_id).className === "free"){
                    
                    this.getTurn().then(res => {
                        return res
                    }).then( (turn) => {
                        if (turn === this.myColor){

                            changeColor(r_coord, c_coord, this.myColor, this.board.tile_array);
                            

                            this.board.socket.emit("colorChange", {row: r_coord, col: c_coord, myColor: this.myColor})

                            let win = checkWin(this.myColor, this.board.tile_array, this.board.g);

                            if (win){
                                if (this.myColor === "red"){
                                    window.alert("Red has won!")
                                    console.log("Red has won! Press the restart button to play again!")
                                }
                                else{
                                    window.alert("Blue has won!")
                                    console.log("Blue has won! Press the restart button to play again!")
                                }
                            }  
                            document.getElementById("curr").innerText = (turn === "red") ? "Blue" : "Red";

                            //make post request to change current turn
                            let newTurn = (turn === "red" ? "blue" : "red")

                            this.setTurn(newTurn)
                        }
                        document.getElementById(div_id).className = "taken"
                    })
                }
            }
            evt.stopPropagation();
        }
    }

    getStartHandler(){
        return (evt) => {
            document.getElementById("curr").innerText="Red";

            let r = 2;
            while (r <= 12){
                let c = 2;
                while (c <= 12){
                    let hex_container_id = 'r_' + r + '_c_' + c;
                    let hex_container = document.querySelector("#" + hex_container_id);
                    if (hex_container?.className == "taken"){
                        hex_container.className = "free";

                        let hex_upper = document.getElementById(hex_container_id + "_upper");
                        let hex_middle = document.getElementById(hex_container_id + "_middle");
                        let hex_lower = document.getElementById(hex_container_id + "_lower");  

                        if (hex_upper != null){
                            hex_upper.style.borderBottomColor = "#6C8";
                        }
                        //middle
                        if (hex_middle != null){
                            hex_middle.style.background = "#6C8";
                        }
                        //bottom
                        if (hex_lower != null){
                            hex_lower.style.borderTopColor = "#6C8";
                        }
                    }
                    c += 1;
                }
                r += 1;
            }
            let i = 0;
            while (i < 11){
                let k = 0;
                while (k < 11){
                    this.board.tile_array[i][k].set_color("#6C8");
                    k += 1;
                }
                i += 1;
            }
        }
    }
}

export default Handler