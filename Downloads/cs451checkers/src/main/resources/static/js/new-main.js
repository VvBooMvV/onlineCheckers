/*
HEAVILY RELIES ON THIS GUY'S IMPLEMENTATION: https://github.com/codethejason/checkers
I'm going to change names and some functionality, but it's unlikely a lot of it will change.
I think the biggest issue will be we just have to add spring and reloadable functionality.


 */

window.onload = function() {
    var boardstate = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]
    ];

    var pieces = [];
    var tiles = [];
    var ActionEnum = Object.freeze({"move":456, "jump":123});
    var PlayerTurnEnum = Object.freeze({"red":100, "black":101});

    //distance formula
    var distance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    };

    function Piece(linkedElement, color) {
        //TODO: going to have to initialize pieces and tiles in nested for loop.  That way, it can have both as a
        //comparable ij value.
        this.position = undefined;
        this.linkedElement = linkedElement;
        this.kinged = false;
        //TODO: enforce 0 for black, 1 for red?
        this.owner = color;
        this.makeKing = function () {
            this.kinged = true;
            //TODO: change visual
            //TODO: call update board state
        };
        this.move = function (tile) {
            //TODO: check if it's a valid move.
            //Hand a tile in, use the current tile position this piece has to check for validity
            //If it's not a valid move, just eat it.
            if (Board.isValidMove(tile.position[0], tile.position[y])) {
                if (owner === 0 && !this.kinged) {
                    //Checks for unkinged piece moving backwards for black
                    if (tile.position < this.position) {
                        return false;
                    }
                } else if (owner === 1 && !this.kinged) {
                    //Checks for unkinged piece moving backwards for red
                    if (tile.position > this.position) {
                        return false;
                    }
                }

                //Set new position to tile position
                this.position = tile.position;

                //TODO: add board functionality to keep track of player tiles
                //TODO: add board functionality to update which player is on which tile

                Board.switchTurn();
                Board.redraw();
                //TODO: use websocket to send spring whatever new information via board object
                return true;
            } else {
                //TODO: eat it
                return false;
            }
        };
        this.canJump = function (newTile) {
            var dx = newTile.position[1] - this.position[1];
            var dy = newTile.position[0] - this.position[0];
            if (owner === 0 && !this.kinged) {
                //Checks for unkinged piece moving backwards for black
                if (newTile.position < this.position) {
                    return false;
                }
            } else if (owner === 1 && !this.kinged) {
                //Checks for unkinged piece moving backwards for red
                if (newTile.position > this.position) {
                    return false;
                }
            }

            if (newTile.position[0] > 7 || newTile.position[1] > 7
                || newTile.position[0] < 0 || newTile.position[1] < 0) {
                //out of bounds check
                return false;
            }

            //Get piece in between
            var tileToCheckx = this.position[1] + dx / 2;
            var tileToChecky = this.position[0] + dy / 2;
            if (!Board.isValidMove(tileToCheckx, tileToChecky) && Board.isValidMove(newTile.position[0], newTile.position[1])) {
                return true;
            } else {
                return false;
            }
        };
        this.jump = function (tile) {
            //TODO: calculate piece to be removed
            //if there is one, kill it, else false.
            var canJump = this.canJump(tile);
            if (canJump) {
                for (pieceIndex in pieces) {
                    if (pieces[pieceIndex].position[0] === tileToChecky && pieces[pieceIndex].position[1] === tileToCheckx) {
                        if (this.owner !== pieces[pieceIndex].owner) {
                            pieces[pieceIndex].remove();
                            return true;
                        }
                    }
                }
                //TODO: somehow we didn't find the piece, is this possible?
                return false;
            } else {
                return false;
            }

        };
        //TODO: add check for jump capability
        this.remove = function () {
            //TODO: set css to removed, add this to player's conquered pieces
            //TODO: update global board state to remove this piece
            //TODO: reset piece position
            Board.redraw();
            //TODO: use websocket to send spring whatever new information via board object
        };
    }

    function Tile(linkedElement, position) {
        this.element = element;
        this.position = undefined;
        //This shit is absolute magic.
        this.validTile = function (piece) {
            if (distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) === Math.sqrt(2)) {
                return ActionEnum.move;
            } else if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) === 2 * Math.sqrt(2)) {

                return ActionEnum.jump;
            }
        };
    }

    var Board = {
        board: gameBoard,
        playerTurn: PlayerTurnEnum.red,
        //TODO: potentially useless????
        titlesElement: $('div.titles'),
        //TODO: potential fucking magic?
        //dictionary to convert position in Board.board to the viewport units
        dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
        //initialize board
        initalize: function () {
            var pieceCount = 0;
            var tileCount = 0;
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index
                    //whole set of if statements control where the tiles and pieces should be placed on the board
                    if(row%2 === 1) {
                        if(column%2 === 0) {
                            this.tilesElement.append("<div class='tile' id='tile" + tileCount+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                            tiles[tileCount] = new Tile($("#tile"+tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    } else {
                        if(column%2 === 1) {
                            this.tilesElement.append("<div class='tile' id='tile"+tileCount+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                            tiles[tileCount] = new Tile($("#tile"+tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    }
                    if(this.board[row][column] === 1) {
                        $('.player1pieces').append("<div class='piece' id='"+pieceCount+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[pieceCount] = new Piece($("#"+pieceCount), [parseInt(row), parseInt(column)]);
                        pieceCount += 1;
                    } else if(this.board[row][column] === 2) {
                        $('.player2pieces').append("<div class='piece' id='"+pieceCount+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[pieceCount] = new Piece($("#"+pieceCount), [parseInt(row), parseInt(column)]);
                        pieceCount += 1;
                    }
                }
            }
        },
        //check if the location has an object
        isValidMove: function (row, column) {
            console.log(row); console.log(column); console.log(this.board);
            return this.board[row][column] === 0;
        },
        //change the active player - also changes div.turn's CSS
        switchTurn: function () {
            if(this.playerTurn === PlayerTurnEnum.red) {
                this.playerTurn = PlayerTurnEnum.black;
                //TODO: are these ones necessary?
                $('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%)");
            } else if(this.playerTurn === PlayerTurnEnum.black) {
                this.playerTurn = PlayerTurnEnum.red;
                $('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
            }
        },
        //reset the game
        clear: function () {
            //TODO: resets the game board???? toggleable via switch?
            location.reload();
        }
    };

    //initialize the board
    Board.initalize();

    /***
     Events
     ***/

    //select the piece on click if it is the player's turn
    $('.piece').on("click", function () {
        var selected;
        //TODO: not sure what this does
        var isPlayersTurn = ($(this).parent().attr("class").split(' ')[0] === "player" + Board.playerTurn + "pieces");
        if(isPlayersTurn) {
            if($(this).hasClass('selected')) {
                selected = true;
            }
            $('.piece').each(function(index) {$('.piece').eq(index).removeClass('selected')});
            if(!selected) {
                $(this).addClass('selected');
            }
        }
    });

    //reset game when clear button is pressed
    //TODO: yeah sure, but we're going to have to fix the menu location and stuff.
    $('#cleargame').on("click", function () {
        Board.clear();
    });

    //move piece when tile is clicked
    $('.tile').on("click", function () {
        //make sure a piece is selected
        if($('.selected').length !== 0) {
            //find the tile object being clicked
            var tileID = $(this).attr("id").replace(/tile/, '');
            var tile = tiles[tileID];
            //find the piece being selected
            var piece = pieces[$('.selected').attr("id")];
            //check if the tile is in range from the object
            var inRange = tile.validTile(piece);
            if(inRange) {
                //if the move needed is jump, then move it but also check if another move can be made (double and triple jumps)
                if(inRange === ActionEnum.jump) {
                    if(piece.jump(tile)) {
                        piece.move(tile);
                        //TODO: this logic is garbage, change it to be that if a player jumps, instead check for more jumps.
                        //TODO: if there are, don't do anything and let them click, and give option to move, otherwise end turn
                        /*if(piece.canJumpAny()) {
                            Board.switchTurn(); //change back to original since another turn can be made
                            piece.element.addClass('selected');
                        }*/
                    }
                    //if it's regular then move it if no jumping is available
                } else if(inRange === ActionEnum.move) {
                    piece.move(tile);
                }
            }
        }
    });

}
};