/*
HEAVILY RELIES ON THIS GUY'S IMPLEMENTATION: https://github.com/codethejason/checkers
I'm going to change names and some functionality, but it's unlikely a lot of it will change.
I think the biggest issue will be we just have to add spring and reloadable functionality.
*/

window.onload = function() {
    //The initial setup
    /*var gameBoard = [
        [  0,  1,  0,  1,  0,  1,  0,  1 ],
        [  1,  0,  1,  0,  1,  0,  1,  0 ],
        [  0,  1,  0,  1,  0,  1,  0,  1 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  2,  0,  2,  0,  2,  0,  2,  0 ],
        [  0,  2,  0,  2,  0,  2,  0,  2 ],
        [  2,  0,  2,  0,  2,  0,  2,  0 ]
    ];*/
    var gameBoard = [
        [  0,  1,  0,  2,  0,  3,  0,  4 ],
        [  5,  0,  6,  0,  7,  0,  8,  0 ],
        [  0,  9,  0,  10,  0,  11,  0,  12 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  13,  0,  14,  0,  15,  0,  16,  0 ],
        [  0,  17,  0,  18,  0,  19,  0,  20 ],
        [  21,  0,  22,  0,  23,  0,  24,  0 ]
    ];

    /*var gameBoard = [
        [  "0",  "1",  "0",  "2",  "0",  "3",  "0",  "4" ],
        [  "5",  "0",  "6",  "0",  "7",  "0",  "8",  "0" ],
        [  "0",  "9",  "0",  "10",  "0",  "11",  "0",  "12" ],
        [  "0",  "0",  "0",  "0",  "0",  "0",  "0",  "0" ],
        [  "0",  "0",  "0",  "0",  "0",  "0",  "0",  "0" ],
        [  "13",  "0",  "14",  "0",  "15",  "0",  "16",  "0" ],
        [  "0",  "17",  "0",  "18",  "0",  "19",  "0",  "20" ],
        [  "21",  "0",  "22",  "0",  "23",  "0",  "24",  "0" ]
    ];*/
    //arrays to store the instances
    var pieces = [];
    var tiles = [];

    //distance formula
    var distance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2));
    };

    //Piece object - there are 24 instances of them in a checkers game
    function Piece (element, position, player, id) {
        //linked DOM element
        this.element = element;
        //positions on gameBoard array in format row, column
        this.position = position;
        //which player's piece i it
        this.player = player;
        this.id = id;
        //makes object a king
        this.king = false;
        //TODO: have to remake object as king if king
        this.makeKing = function () {
            //this.element.css("backgroundImage", "url('king"+this.player+".png')");
            this.king = true;
        };
        //moves the piece
        this.move = function (tile) {
            this.element.removeClass('selected');
            if(!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;
            //make sure piece doesn't go backwards if it's not a king
            if(this.player == 1 && this.king == false) {
                if(tile.position[0] < this.position[0]) {
                    console.log("Going backwards for red");
                    return false;
                }
            } else if (this.player == 2 && this.king == false) {
                if(tile.position[0] > this.position[0]) {
                    console.log("Going backwards for black");
                    return false;
                }
            }
            //remove the mark from Board.board and put it in the new spot
            Board.board[this.position[0]][this.position[1]] = 0;
            Board.board[tile.position[0]][tile.position[1]] = this.id;
            this.position = [tile.position[0], tile.position[1]];
            //change the css using board's dictionary
            this.element.css('top', Board.dictionary[this.position[0]]);
            this.element.css('left', Board.dictionary[this.position[1]]);
            //if piece reaches the end of the row on opposite side crown it a king (can move all directions)
            if(!this.king && (this.position[0] == 0 || this.position[0] == 7 ))
                this.makeKing();
            //Board.changePlayerTurn();

            return true;
        };

        //tests if piece can jump anywhere
        this.canJumpAny = function () {
            if(this.canOpponentJump([this.position[0]+2, this.position[1]+2]) ||
                this.canOpponentJump([this.position[0]+2, this.position[1]-2]) ||
                this.canOpponentJump([this.position[0]-2, this.position[1]+2]) ||
                this.canOpponentJump([this.position[0]-2, this.position[1]-2])) {
                return true;
            } return false;
        };

        //tests if an opponent jump can be made to a specific place
        this.canOpponentJump = function(newPosition) {
            //find what the displacement is
            var dx = newPosition[1] - this.position[1];
            var dy = newPosition[0] - this.position[0];
            //make sure object doesn't go backwards if not a king
            if(this.player == 1 && this.king == false) {
                if(newPosition[0] < this.position[0]) {
                    return false;
                }
            } else if (this.player == 2 && this.king == false) {
                if(newPosition[0] > this.position[0]) {
                    return false;
                }
            }
            //must be in bounds
            if(newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;
            //middle tile where the piece to be conquered sits
            var tileToCheckx = this.position[1] + dx/2;
            var tileToChecky = this.position[0] + dy/2;
            //if there is a piece there and there is no piece in the space after that
            if(!Board.isValidPlacetoMove(tileToChecky, tileToCheckx) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
                //find which object instance is sitting there
                for(pieceIndex in pieces) {
                    if(pieces[pieceIndex].position[0] == tileToChecky && pieces[pieceIndex].position[1] == tileToCheckx) {
                        if(this.player != pieces[pieceIndex].player) {
                            //return the piece sitting there
                            return pieces[pieceIndex];
                        }
                    }
                }
            }
            return false;
        };

        this.opponentJump = function (tile) {
            var pieceToRemove = this.canOpponentJump(tile.position);
            //if there is a piece to be removed, remove it
            if(pieceToRemove) {
                pieces[pieceIndex].remove();
                return true;
            }
            return false;
        };

        this.remove = function () {
            //remove it and delete it from the gameboard
            this.element.css("display", "none");
            if(this.player == 1) {
                $('#player2').append("<div class='capturedPiece'></div>");
            }
            if(this.player == 2) {
                $('#player1').append("<div class='capturedPiece'></div>");
            }
            Board.board[this.position[0]][this.position[1]] = 0;
            //reset position so it doesn't get picked up by the for loop in the canOpponentJump method
            this.position = [];
            Board.removedPieces.push(this.id);
        }
    }

    function Tile (element, position) {
        //linked DOM element
        this.element = element;
        //position in gameboard
        this.position = position;
        //if tile is in range from the piece
        this.inRange = function(piece) {
            if(distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2)) {
                //regular move
                return 'regular';
            } else if(distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2*Math.sqrt(2)) {
                //jump move
                return 'jump';
            }
        };
    }

    //Board object - controls logistics of game
    var Board = {
        board: gameBoard,
        playerTurn: 1,
        team: -1,
        tilesElement: $('div.tiles'),
        //dictionary to convert position in Board.board to the viewport units
        dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
        removedPieces: [],
        //initialize the 8x8 board
        initalize: function () {
            var countPieces = 0;
            var countTiles = 0;
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index
                    //whole set of if statements control where the tiles and pieces should be placed on the board
                    if(row%2 == 1) {
                        if(column%2 == 0) {
                            this.tilesElement.append("<div class='tile' id='tile"+countTiles+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                            tiles[countTiles] = new Tile($("#tile"+countTiles), [parseInt(row), parseInt(column)]);
                            countTiles += 1;
                        }
                    } else {
                        if(column%2 == 1) {
                            this.tilesElement.append("<div class='tile' id='tile"+countTiles+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                            tiles[countTiles] = new Tile($("#tile"+countTiles), [parseInt(row), parseInt(column)]);
                            countTiles += 1;
                        }
                    }
                    /*if(this.board[row][column] == 1) {
                        $('.player1pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 1, countPieces + 1);
                        countPieces += 1;
                    } else if(this.board[row][column] == 2) {
                        $('.player2pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 2, countPieces + 1);
                        countPieces += 1;
                    }*/
                    if(this.board[row][column] != 0 && row < 3) {
                        $('.player1pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 1, countPieces + 1);
                        countPieces += 1;
                    } else if(this.board[row][column] != 0 && row > 4) {
                        $('.player2pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 2, countPieces + 1);
                        countPieces += 1;
                    }
                }
            }
        },
        drawBoard: function() {
            var countPieces = 0;
            pieces.forEach( function(piece) {
                piece.element.css("display", "none");
            });
            $('.player1pieces').html("");
            $('.player2pieces').html("");
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index
                    /*if(this.board[row][column] != 0 && pieces[countPieces].player == 1) {
                        $('.player1pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 1, countPieces + 1);
                        countPieces += 1;
                    } else if(this.board[row][column] != 0 && pieces[countPieces].player == 2) {
                        $('.player2pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 2, countPieces + 1);
                        countPieces += 1;
                    }*/
                    if (this.board[row][column] != 0 && this.board[row][column] < 13) {
                        $('.player1pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 1, this.board[row][column]);
                        countPieces += 1;
                    } else if (this.board[row][column] != 0 && this.board[row][column] >= 13) {
                        $('.player2pieces').append("<div class='piece' id='"+countPieces+"' style='top:"+this.dictionary[row]+";left:"+this.dictionary[column]+";'></div>");
                        pieces[countPieces] = new Piece($("#"+countPieces), [parseInt(row), parseInt(column)], 2, this.board[row][column]);
                        countPieces += 1;
                    }
                }
            }

            $('.piece').on("click", function () {
                var selected;
                var isPlayersTurn = (Board.playerTurn === Board.team) && ($(this).parent().attr("class").split(' ')[0] === "player" + Board.playerTurn + "pieces");
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


            pieces.forEach( function(piece) {
                if (this.removedPieces !== undefined && this.removedPieces.includes(piece.id)) {
                    $("#" + (piece.id - 1)).off("click");
                    $("#" + (piece.id - 1)).html("");
                }
            })
        },
        //check if the location has an object
        isValidPlacetoMove: function (row, column) {
            console.log(row); console.log(column); console.log(this.board);
            return this.board[row][column] == 0;
        },
        //change the active player - also changes div.turn's CSS
        changePlayerTurn: function () {
            // send the turn
            sendTurn(this.board, this.playerTurn);
            // wait on response from other player
        },
        //reset the game
        clear: function () {
            location.reload();
        },
        redraw: function(newBoardstate, newTurn, removedPieces) {
            this.board = newBoardstate;
            this.playerTurn = newTurn;
            this.removedPieces = removedPieces;
            this.drawBoard();
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
            sendInit();
        });
    }

    function sendInit() {
        stompClient.send("/checkers/join", {},
            JSON.stringify({
                'msgType': "join",
                'team': -1
            })
        );
    }

    function disconnect() {
        if(stompClient != null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    function sendTurn(board, playerTurn, removedPieces) {
        stompClient.send("/checkers/processturn", {},
            JSON.stringify({
                'board': board,
                'currentTurn': playerTurn,
                'removedPieces': removedPieces,
                'msgType': "move"
            })
        );
    }

    function showMessageOutput(messageOutput) {
        if (messageOutput.msgType == "move") {
            console.log("Message output from server: ");
            console.log("Board: " + messageOutput.board);
            console.log("Current Turn: " + messageOutput.currentTurn);
            console.log("Removed pieces: " + messageOutput.removedPieces);
            //Board.playerTurn = messageOutput.playerTurn
            Board.redraw(messageOutput.board, messageOutput.currentTurn, messageOutput.removedPieces);
        } else if (messageOutput.msgType == "init") {
            console.log("Message output from server: ");
            console.log("Team: " + messageOutput.team);
            if (Board.team == -1) {
                Board.team = messageOutput.team;
            } else {
                console.log("Fuck off");
            }
        }
    }

    $(function() {
        $( "#connect" ).on("click", function() { connect(); });
        $( "#disconnect" ).on("click", function() { disconnect() });
        $( "#testing" ).on("click", function() { sendMessage() });
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
        if($('.selected').length != 0) {
            if (Board.playerTurn == Board.team) {
                //find the tile object being clicked
                var tileID = $(this).attr("id").replace(/tile/, '');
                var tile = tiles[tileID];
                //find the piece being selected
                var piece = pieces[$('.selected').attr("id")];
                //check if the tile is in range from the object
                var inRange = tile.inRange(piece);
                if (inRange) {
                    //if the move needed is jump, then move it but also check if another move can be made (double and triple jumps)
                    if (inRange == "jump") {
                        if (piece.opponentJump(tile)) {
                            piece.move(tile);
                            if (piece.canJumpAny()) {
                                //Board.changePlayerTurn(); //change back to original since another turn can be made
                                piece.element.addClass("selected");
                            } else {
                                console.log("Sending next turn");
                                if (Board.team == 1){
                                    var otherTeam = 2;
                                } else {
                                    var otherTeam = 1;
                                }
                                sendTurn(Board.board, otherTeam, Board.removedPieces);
                            }
                        }
                        //if it's regular then move it if no jumping is available
                    } else if (inRange == "regular") {
                        //if (!piece.canJumpAny()) {
                            //piece.move(tile);
                        /*} else {
                            alert("You must jump when possible!");
                        }*/

                        if (piece.move(tile)) {
                            console.log("Sending next turn");
                            if (Board.team == 1) {
                                var otherTeam = 2;
                            } else {
                                var otherTeam = 1;
                            }
                            sendTurn(Board.board, otherTeam, Board.removedPieces);
                        }
                    }
                }
            }
        }
    });

    //select the piece on click if it is the player's turn
    $('.piece').on("click", function () {
        var selected;
        var isPlayersTurn = (Board.playerTurn === Board.team) && ($(this).parent().attr("class").split(' ')[0] === "player" + Board.playerTurn + "pieces");
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
};

