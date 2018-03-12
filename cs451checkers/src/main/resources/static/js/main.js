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

        //positions in board state in array form: [row, column]
        this.position = position;

        //owner of the piece 1 for red, 2 for black
        this.player = player;

        //Unique id to each checker piece, used for redrawing the board properly...hacky?
        this.id = id;

        //Whether piece is a king or not
        this.king = false;

        //Makes piece a king
        this.makeKing = function () {
            //TODO: change visuals for king
            //this.element.css("backgroundImage", "url('king"+this.player+".png')");
            this.king = true;
            if (!Board.kingedPieces.includes(this.id)) {
                Board.kingedPieces.push(this.id);
            }
            return true;
        };

        //moves the piece
        this.move = function (tile) {
            this.element.removeClass('selected');
            if(!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) {
                return false;
            }
            //make sure piece doesn't go backwards if it's not a king
            if(this.player === 1 && this.king === false) {
                if (tile.position[0] < this.position[0]) {
                    console.log("Going backwards for red");
                    return false;
                }
            } else if (this.player === 2 && this.king === false) {
                if (tile.position[0] > this.position[0]) {
                    console.log("Going backwards for black");
                    return false;
                }
            }

            //remove the piece from board state and put it in the new spot
            Board.board[this.position[0]][this.position[1]] = 0;
            Board.board[tile.position[0]][tile.position[1]] = this.id;

            //Set new position
            this.position = [tile.position[0], tile.position[1]];

            //change the css using board's dictionary of pieces
            this.element.css('top', Board.dictionary[this.position[0]]);
            this.element.css('left', Board.dictionary[this.position[1]]);
            //if piece reaches the end of the row on opposite side crown it a king (can move all directions)
            if(!this.king && (this.position[0] === 0 || this.position[0] === 7 )) {
                this.makeKing();
            }
            return true;
        };

        //Tests is piece can jump in any direction from its current location
        this.canJump = function () {
            if (this.canOpponentJump([this.position[0]+2, this.position[1]+2]) ||
                this.canOpponentJump([this.position[0]+2, this.position[1]-2]) ||
                this.canOpponentJump([this.position[0]-2, this.position[1]+2]) ||
                this.canOpponentJump([this.position[0]-2, this.position[1]-2])) {
                return true;
            } else {
                return false;
            }
        };

        //Tests if jump can be performed
        this.canOpponentJump = function(newPosition) {
            //Calculate what the displacement is
            var dx = newPosition[1] - this.position[1];
            var dy = newPosition[0] - this.position[0];
            //make sure object doesn't go backwards if not a king
            if (this.player === 1 && this.king === false) {
                if (newPosition[0] < this.position[0]) {
                    return false;
                }
            } else if (this.player === 2 && this.king === false) {
                if (newPosition[0] > this.position[0]) {
                    return false;
                }
            }
            //must be in bounds of board
            if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) {
                return false;
            }

            //middle tile where the piece to be jumped sits
            var tileToCheckX = this.position[1] + dx/2;
            var tileToCheckY = this.position[0] + dy/2;
            //Check if there is a piece to be jumped, and no piece on landing tile
            if(!Board.isValidPlacetoMove(tileToCheckY, tileToCheckX) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
                //find which object instance is sitting there
                for(pieceIndex in pieces) {
                    if(pieces[pieceIndex].position[0] === tileToCheckY && pieces[pieceIndex].position[1] === tileToCheckX) {
                        if(this.player !== pieces[pieceIndex].player) {
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
                //Javascript magic allows for you to use this even though it's from elsewhere? Sure.
                pieces[pieceIndex].remove();
                return true;
            }
            return false;
        };

        this.remove = function () {
            //hide piece
            this.element.css("display", "none");

            //TODO:　Probably remove this
            if(this.player === 1) {
                $('#player2').append("<div class='capturedPiece'></div>");
            }
            if(this.player === 2) {
                $('#player1').append("<div class='capturedPiece'></div>");
            }
            //Set board state to not have this piece
            Board.board[this.position[0]][this.position[1]] = 0;
            this.position = [];

            //Add it to removed pieces list.
            //TODO: consider making this stateful so that the clients don't have to deal with this kind of validation
            Board.removedPieces.push(this.id);
        }
    }

    function Tile (element, position) {
        //linked DOM element
        this.element = element;

        //position in board state
        this.position = position;

        //if tile is in range from the piece
        this.isInRangeOfTile = function(piece) {
            if(distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) === Math.sqrt(2)) {
                //regular move
                return 'regular';
            } else if(distance(this.position[0], this.position[1], piece.position[0], piece.position[1]) === 2*Math.sqrt(2)) {
                //jump move
                return 'jump';
            }
        };
    }

    //Board object - controls logistics of game
    var Board = {
        //the board state
        board: gameBoard,
        //Who's turn it currently is.  Changes based on values receieved from server
        playerTurn: 1,
        //Set by initial ack received from server.  1 for red, 2 for black
        team: -1,
        //Winning team is set by message
        winningTeam: -1,
        //The list of tiles
        tilesElement: $('div.tiles'),
        //dictionary to convert position in Board.board to the viewport units
        dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
        //These feel bad, but that's part of the problem with maintaining state client side.
        removedPieces: [],
        kingedPieces: [],
        //initialize the board
        initalize: function () {
            var pieceCount = 0;
            var tileCount = 0;
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index

                    //Creates tiles for the board.
                    if((row % 2) === 1) {
                        if((column % 2) === 0) {
                            this.tilesElement.append("<div class='tile' id='tile" + tileCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                            tiles[tileCount] = new Tile($("#tile" + tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    } else {
                        if((column % 2) === 1) {
                            this.tilesElement.append("<div class='tile' id='tile" + tileCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                            tiles[tileCount] = new Tile($("#tile" + tileCount), [parseInt(row), parseInt(column)]);
                            tileCount += 1;
                        }
                    }

                    //Generate pieces with ids to match the initial board state above.
                    if(this.board[row][column] !== 0 && row < 3) {
                        $('.player1pieces').append("<div class='piece' id='" + pieceCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], 1, pieceCount + 1);
                        pieceCount += 1;
                    } else if(this.board[row][column] !== 0 && row > 4) {
                        $('.player2pieces').append("<div class='piece' id='" + pieceCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], 2, pieceCount + 1);
                        pieceCount += 1;
                    }
                }
            }
        },
        drawBoard: function() {
            var pieceCount = 0;

            //Remove each piece
            pieces.forEach( function(piece) {
                piece.element.css("display", "none");
            });

            //Clear the divs which had pieces in them before
            $('.player1pieces').html("");
            $('.player2pieces').html("");

            //Generate a new board based on the new state from the server
            for (row in this.board) { //row is the index
                for (column in this.board[row]) { //column is the index
                    //Keep unique id the same, keep div id the same.  This way board can be redrawn
                    if (this.board[row][column] !== 0 && this.board[row][column] < 13) {
                        $('.player1pieces').append("<div class='piece' id='" + pieceCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], 1, this.board[row][column]);
                        pieceCount += 1;
                    } else if (this.board[row][column] !== 0 && this.board[row][column] >= 13) {
                        $('.player2pieces').append("<div class='piece' id='" + pieceCount + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
                        pieces[pieceCount] = new Piece($("#" + pieceCount), [parseInt(row), parseInt(column)], 2, this.board[row][column]);
                        shouldKing = false;
                        pieceCount += 1;
                    }
                }
            }

            //Reset listeners, since after being removed this needs to be set again
            $('.piece').on("click", function () {
                var selected;
                var isPlayersTurn = (Board.playerTurn === Board.team) && ($(this).parent().attr("class") === "player" + Board.playerTurn + "pieces");
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
                if (Board.removedPieces !== undefined && Board.removedPieces.includes(piece.id)) {
                    $("#" + (piece.id - 1)).off("click");
                    $("#" + (piece.id - 1)).html("");
                }
                if(Board.kingedPieces !== undefined && Board.kingedPieces.includes(piece.id)) {
                    piece.makeKing();
                }
            });
        },
        //check if the location has an object
        isValidPlacetoMove: function (row, column) {
            return this.board[row][column] === 0;
        },
        //reset the game
        clear: function () {
            location.reload();
        },
        redraw: function(newBoardstate, newTurn, removedPieces, kingedPieces) {
            this.board = newBoardstate;
            this.playerTurn = newTurn;
            this.removedPieces = removedPieces;
            this.kingedPieces = kingedPieces;
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

    function sendTurn(board, playerTurn, removedPieces, kingedPieces) {
        stompClient.send("/checkers/processturn", {},
            JSON.stringify({
                'board': board,
                'currentTurn': playerTurn,
                'removedPieces': removedPieces,
                'kingedPieces': kingedPieces,
                'msgType': "move"
            })
        );
    }

    function showMessageOutput(messageOutput) {
        if (messageOutput.msgType === "move") {
            console.log("Message output from server: ");
            console.log("Board: " + messageOutput.board);
            console.log("Current Turn: " + messageOutput.currentTurn);
            console.log("Removed pieces: " + messageOutput.removedPieces);
            console.log("Kinged pieces: " + messageOutput.kingedPieces);
            Board.redraw(messageOutput.board, messageOutput.currentTurn, messageOutput.removedPieces, messageOutput.kingedPieces);
        } else if (messageOutput.msgType === "init") {
            console.log("Message output from server: ");
            console.log("Team: " + messageOutput.team);
            if (Board.team === -1) {
                Board.team = messageOutput.team;
            } else {
                console.log("Fuck off");
            }
        } else if (messageOutput.msgType === "win") {
            Board.winningTeam = messageOutput.team;
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
        //TODO: is this really how we're going to do this?
        if($('.selected').length !== 0) {
            if (Board.playerTurn === Board.team) {
                //find the tile object being clicked
                var tileID = $(this).attr("id").replace(/tile/, '');
                var tile = tiles[tileID];
                //find the piece being selected
                var piece = pieces[$('.selected').attr("id")];
                //check if the tile is in range from the object
                var isInRangeOfTile = tile.isInRangeOfTile(piece);
                if (isInRangeOfTile) {
                    //check if move is a jump.  Perform it if it can, then move it but also check if another jump can be made
                    if (isInRangeOfTile === "jump") {
                        if (piece.opponentJump(tile)) {
                            piece.move(tile);
                            if (Board.winningTeam !== -1) {

                            } else if (piece.canJump()) {
                                piece.element.addClass("selected");
                            } else {
                                console.log("Sending next turn");
                                if (Board.team === 1){
                                    var otherTeam = 2;
                                } else {
                                    var otherTeam = 1;
                                }
                                sendTurn(Board.board, otherTeam, Board.removedPieces, Board.kingedPieces);
                            }
                        }
                    }
                    } else if (isInRangeOfTile === "regular") {
                        if (piece.move(tile)) {
                            console.log("Sending next turn");
                            if (Board.team === 1) {
                                var otherTeam = 2;
                            } else {
                                var otherTeam = 1;
                            }
                            sendTurn(Board.board, otherTeam, Board.removedPieces, Board.kingedPieces);
                        }
                    }
                }
            }
        }
    });

    //select the piece on click if it is the player's turn
    $('.piece').on("click", function () {
        var selected;
        var isPlayersTurn = (Board.playerTurn === Board.team) && ($(this).parent().attr("class") === "player" + Board.playerTurn + "pieces");
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

