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
    var PlayerTurnEnum = Object.freeze({"red":1, "black":2});

    //distance formula
    var distance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    };

    function Piece(linkedElement, position, color, id) {
        //TODO: going to have to initialize pieces and tiles in nested for loop.  That way, it can have both as a
        //comparable ij value.
        this.position = position;
        this.linkedElement = linkedElement;
        //piece id, unique to each
        this.id = id;
        this.kinged = false;
        this.owner = color;
        this.makeKing = function () {
            this.kinged = true;
            //TODO: change visual
            //TODO: call update board state
        };
        this.move = function (tile) {
            this.linkedElement.removeClass('selected');
            //Hand a tile in, use the current tile position this piece has to check for validity
            //If it's not a valid move, just eat it.
            if (Board.isValidMove(tile.position[0], tile.position[1])) {
                if (this.owner === PlayerTurnEnum.red && this.kinged === false) {
                    //Checks for unkinged piece moving backwards for red
                    if (tile.position < this.position) {
                        return false;
                    }
                } else if (this.owner === PlayerTurnEnum.black && this.kinged === false) {
                    //Checks for unkinged piece moving backwards for black
                    if (tile.position > this.position) {
                        return false;
                    }
                }

                var oldPosition0 = this.position[0];
                var oldPosition1 = this.position[1];
                //Set board state to proper move
                Board.board[this.position[0]][this.position[1]] = 0;
                Board.board[tile.position[0]][tile.position[1]] = this.owner;

                //Set new position to tile position
                this.position = [tile.position[0], tile.position[1]];

                this.linkedElement.css('top', Board.dictionary[this.position[0]]);
                this.linkedElement.css('left', Board.dictionary[this.position[1]]);

                var moveString = this.owner.toString() + " " + this.id + " move " +
                    + oldPosition0 + " " + oldPosition1 + " " + this.position[0] + " " + this.position[1];
                Board.moves.push(moveString);
                console.log(moveString);

                if(!this.king && (this.position[0] === 0 || this.position[0] === 7)) {
                    this.makeKing();
                    Board.moves.push(this.owner.toString() + " " + this.id + " king");
                }

                //Board.switchTurn();
                //Board.redraw();
                //TODO: use websocket to send spring whatever new information via board object
                return true;
            } else {
                console.log("Not a valid move");
                return false;
            }
        };

        this.positionMove = function (tile) {
            this.linkedElement.removeClass('selected');
            //Hand a tile in, use the current tile position this piece has to check for validity
            //If it's not a valid move, just eat it.
            if (Board.isValidMove(tile[0], tile[1])) {
                if (this.owner === PlayerTurnEnum.red && this.kinged === false) {
                    //Checks for unkinged piece moving backwards for red
                    if (tile[0] < this.position) {
                        return false;
                    }
                } else if (this.owner === PlayerTurnEnum.black && this.kinged === false) {
                    //Checks for unkinged piece moving backwards for black
                    if (tile[0] > this.position) {
                        return false;
                    }
                }

                var oldPosition0 = this.position[0];
                var oldPosition1 = this.position[1];
                //Set board state to proper move
                Board.board[this.position[0]][this.position[1]] = 0;
                Board.board[tile[0]][tile[1]] = this.owner;

                //Set new position to tile position
                this.position = [tile[0], tile[1]];

                this.linkedElement.css('top', Board.dictionary[this.position[0]]);
                this.linkedElement.css('left', Board.dictionary[this.position[1]]);

                var moveString = this.owner.toString() + " " + this.id + " move " +
                    + oldPosition0 + " " + oldPosition1 + " " + this.position[0] + " " + this.position[1];
                Board.moves.push(moveString);
                console.log(moveString);

                if(!this.king && (this.position[0] === 0 || this.position[0] === 7)) {
                    this.makeKing();
                    Board.moves.push(this.owner.toString() + " " + this.id + " king");
                }

                //Board.switchTurn();
                //Board.redraw();
                //TODO: use websocket to send spring whatever new information via board object
                return true;
            } else {
                console.log("Not a valid move");
                return false;
            }
        };

        //tests if piece can jump again from current location
        this.canJumpAgain = function (looking) {
            return (this.canJump([this.position[0] + 2, this.position[1] + 2], looking) ||
                this.canJump([this.position[0] + 2, this.position[1] - 2], looking) ||
                this.canJump([this.position[0] - 2, this.position[1] + 2], looking) ||
                this.canJump([this.position[0] - 2, this.position[1] - 2], looking));
        };

        this.canJump = function (newTile, looking) {
            var dx = newTile[1] - this.position[1];
            var dy = newTile[0] - this.position[0];
            if (this.owner === PlayerTurnEnum.red && this.kinged === false) {
                //Checks for unkinged piece moving backwards for red
                if (newTile[0] < this.position[0]) {
                    return false;
                }
            } else if (this.owner === PlayerTurnEnum.black && this.kinged === false) {
                //Checks for unkinged piece moving backwards for black
                if (newTile[0] > this.position[0]) {
                    return false;
                }
            }

            if (newTile[0] > 7 || newTile[1] > 7
                || newTile[0] < 0 || newTile[1] < 0) {
                //out of bounds check
                return false;
            }

            //Get piece in between
            var tileToCheckx = this.position[1] + dx / 2;
            var tileToChecky = this.position[0] + dy / 2;
            if (!Board.isValidMove(tileToChecky, tileToCheckx) && Board.isValidMove(newTile[0], newTile[1])) {
                for (pieceIndex in pieces) {
                    if (pieces[pieceIndex].position[0] === tileToChecky && pieces[pieceIndex].position[1] === tileToCheckx) {
                        if (this.owner !== pieces[pieceIndex].owner) {
                            if (!looking) {
                                var moveString = this.owner.toString() + " " + this.id + " jump "
                                    + this.position[0] + " " + this.position[1] + " " + newTile[0] + " " + newTile[1];
                                Board.moves.push(moveString);
                            }
                            return pieces[pieceIndex];
                        }
                    }
                }
            } else {
                return false;
            }
        };
        this.jump = function (tile) {
            //TODO: calculate piece to be removed
            //if there is one, kill it, else false.
            var canJump = this.canJump(tile.position);
            //Get piece in between
            if (canJump) {
                //TODO: for now I'm going to implement jump as a valid move.  Think about whether or not this is necessary
                //What could happen is you do a move and a remove and just reload the board instead of attempting to animate this garbage.
                console.log("can jump");
                canJump.remove();
                return true;
            } else {
                console.log("can't jump");
                return false;
            }

        };
        //TODO: add check for jump capability
        this.remove = function () {
            //Board.redraw();
            //TODO: use websocket to send spring whatever new information via board object
            this.linkedElement.css("display", "none");
            Board.board[this.position[0]][this.position[1]] = 0;
            //reset position so it doesn't get picked up by the for loop in the canOpponentJump method
            this.position = [];
            //TODO: determine winner
        };
    }

    function Tile(linkedElement, position) {
        this.element = linkedElement;
        this.position = position;
        //This shit is absolute magic.
        this.validTile = function (piece) {
            if (distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) === Math.sqrt(2)) {
                return ActionEnum.move;
            } else if (distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) === 2 * Math.sqrt(2)) {
                return ActionEnum.jump;
            }
        };
    }

    var Board = {
        moves: [],
        board: boardstate,
        playerTurn: PlayerTurnEnum.red,
        tilesElement: $('div.tiles'),
        //dictionary to convert position in Board.board to the viewport units
        dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
        //initialize board
        initalize: function () {
            var pieceCount = 0;
            var tileCount = 0;
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index
                    //whole set of if statements control where the tiles and pieces should be placed on the board
                    if(row % 2 === 1) {
                        if(column % 2 === 0) {
                            this.tilesElement.append("<div class='tile' id='tile" + tileCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                            tiles[tileCount] = new Tile($("#tile"+tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    } else {
                        if(column % 2 === 1) {
                            this.tilesElement.append("<div class='tile' id='tile" + tileCount + "' style='top:" + this.dictionary[row] + ";left:"+this.dictionary[column]+  ";'></div>");
                            tiles[tileCount] = new Tile($("#tile"+tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    }
                    if(this.board[row][column] === 1) {
                        $('.player1pieces').append("<div class='piece' id='" + pieceCount + "' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], PlayerTurnEnum.red, pieceCount);
                        pieceCount += 1;
                    } else if(this.board[row][column] === 2) {
                        $('.player2pieces').append("<div class='piece' id='" + pieceCount+ "' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], PlayerTurnEnum.black, pieceCount);
                        pieceCount += 1;
                    }
                }
            }
        },
        //check if the location has an object
        isValidMove: function (row, column) {
            //console.log(row); console.log(column); console.log(this.board);
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
        endTurn: function() {
            sendTurn(this.board, this.playerTurn, this.moves);
            this.switchTurn();
        },
        //resets the game board
        clear: function () {
            //location.reload();
            //TODO: DISABLED RELOAD FOR NOW
            //TODO: reset both boards and distribute message
        },
        //This function will basically enact the last turn's moves provided by the server and perform them.
        redraw: function (moveSet) {
            //TODO: new plan b is redo the board every turn
            //Do nothing, you were the last person to go.  Clear the move list and prepare for the next turn
            if (moveSet.moves === Board.moves) {
                Board.moves = [];
                return;
            } else {
                moveSet.moves.forEach( function(move) {
                    //REMINDER: These stings are in the format:
                    //  0      1      2     3     4     5    6
                    //owner pieceid jump startY startX newY newX
                    //owner pieceid move startY startX newY newX
                    //owner pieceid king
                    var protocolString = move.split(" ");
                    if (protocolString[2] === "move") {
                        pieces[parseInt(protocolString[1])].positionMove([protocolString[5], protocolString[6]]);
                    } else if (protocolString[2] === "jump") {
                        pieces[parseInt(protocolString[1])].jump([protocolString[5], protocolString[6]]);
                    } else if (protocolString[2] === "king") {
                        //TODO: possibly redundant since check is already in move.
                        pieces[parseInt(protocolString[1])].makeKing();
                    }

                });
            }
        }
    };

    //initialize the board
    Board.initalize();


    //STOMP STUFF
    //TODO: IT IS QUESTIONABLE WHETHER THIS SHOULD BE HERE
    var stompClient = null;

    function connect() {
        var socket = new SockJS('/checkers-ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function(frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/game/init', function(messageOutput) {
                showMessageOutput(JSON.parse(messageOutput.body));
            });
        });
    }

    function disconnect() {
        if(stompClient != null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    function sendMessage() {
        stompClient.send("/checkers/saveboard", {}, JSON.stringify({'content': 'passing it back'}));
    }

    function sendTurn(board, turn, moves) {
        stompClient.send("/checkers/processturn", {},
            JSON.stringify({
                'board': board,
                'currentTurn': turn,
                'moves': moves
            })
        );
    }

    function showMessageOutput(messageOutput) {
        console.log("Message output from server: ");
        console.log("Board: " + messageOutput.board);
        console.log("Current Turn: " + messageOutput.currentTurn);
        console.log("Moves: " + messageOutput.moves);
        Board.redraw(messageOutput);
    }

    $(function() {
        $( "#connect" ).on("click", function() { connect() });
        $( "#disconnect" ).on("click", function() { disconnect() });
        $( "#testing" ).on("click", function() { sendMessage() });
    });

    //select the piece on click if it is the player's turn
    $('.piece').on("click", function () {
        var selected;
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

    /*End of stomp stuff*/





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
                    if(piece.jump(tile, false)) {
                        //TODO: can select another piece after valid first jump
                        piece.move(tile);
                        if (piece.canJumpAgain(true)) {
                            //Board.switchTurn();
                            piece.linkedElement.addClass('selected');
                        } else {
                            Board.endTurn();
                        }
                    }
                    //if it's regular then move it if no jumping is available
                } else if(inRange === ActionEnum.move) {
                    console.log("move");
                    piece.move(tile);
                    Board.endTurn();
                }
            }
        }
    });
};