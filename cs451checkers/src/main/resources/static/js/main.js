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
    if(stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
}

function sendTurn(boardstate, playerTurn) {
    stompClient.send("/checkers/processturn", {},
        JSON.stringify({
            'board': boardstate,
            'currentTurn': playerTurn,
            'msgType': "move"
        })
    );
}

function showMessageOutput(messageOutput) {
    if (messageOutput.msgType === "move") {
        console.log("Message output from server: ");
        console.log("Board: " + messageOutput.board);
        console.log("Current Turn: " + messageOutput.currentTurn);
        redraw(messageOutput.board, messageOutput.currentTurn);
    } else if (messageOutput.msgType === "init") {
        console.log("Message output from server: ");
        console.log("Team: " + messageOutput.team);
        if (team === -1) {
            team = messageOutput.team;
        }
    }
}

var team = -1;

function redraw(newBoardstate, playerTurn) {
    currentPlayersTurn = playerTurn;
    boardstate = newBoardstate;
    drawBoard();
}

//websocket variables
var boardstate = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [9, 0, 9, 0, 9, 0, 9, 0],
    [0, 9, 0, 9, 0, 9, 0, 9],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
];
var isEndGame = false;
var currentPlayersTurn = 1;

//local
var selectedRow, selectedCol;
var isStillTurn = false;
var endTurn = false;
var hasJumped = false;
var hasAnotherLegalMove = false;
var moved = false;
var blackNum;
var redNum;

//FINAL values, essentially key for comparison/change-positions (do not change values)
var RED_NORMAL = 1;
var BLACK_NORMAL = 2;
var RED_KING = 3;
var BLACK_KING = 4;
var RED_SELECTED = 5;
var BLACK_SELECTED = 6;
var RED_KING_SELECTED = 7;
var BLACK_KING_SELECTED = 8;
var EMPTY_SPACE = 9;

var RED_KING_LINE = 7;
var BLACK_KING_LINE = 0;
var MIN = 0;
var MAX = 7;

function drawSquare(row, col){
	var state = boardstate[row][col];
	if(state > 0){
		//creates button and all css attributes

		var $button = $('<button/>', {
					// class: "square1",
			        click: function () { touch(row, col); }
			    });
		var left = col*100;
		var top = row*100;
		//css
		$button.css("position", "absolute");
		$button.css("outline", "none");
		$button.css("left", left);
		$button.css("top", top);
		$button.css("width", "100px");
		$button.css("height", "100px");
		$button.css("background-color", "#BA7A3A");

		//determines if piece exist, 3 sentinal value
		var blackChecker;
		if(state === RED_KING){  //kinged red
			blackChecker = '<div class="checkerRedKing"></div>';
		} else if (state === BLACK_KING){
			blackChecker = '<div class="checkerBlackKing"></div>';
		} else if(state === RED_SELECTED || state === RED_KING_SELECTED){
			blackChecker = '<div class="checkerRedSelected"></div>';
		} else if(state === BLACK_SELECTED || state === BLACK_KING_SELECTED) {
			blackChecker = '<div class="checkerBlackSelected"></div>';
		} else if(state === RED_NORMAL){
			blackChecker = '<div class="checkerRed"></div>';
		} else if(state === BLACK_NORMAL) {
			blackChecker = '<div class="checkerBlack"></div>';
		}
		$button.html(blackChecker);

		//smacks it onto board
		$(".board").append($button);
	}
}

function drawBoard(){
	$(".board").removeClass("hidden");
	$("#username-page").addClass("hidden");
	//actual checker board
	for(var col = 0; col < boardstate.length; col++){
		for(var row = 0; row < boardstate[col].length; row++){
			drawSquare(col, row);
		}
	}

	//display around board
	var currentTurn = (currentPlayersTurn === 1 ? "Player One" : "Player Two")
	$(".display").html('Current Turn: ' + currentTurn);
	var bgColor = (currentPlayersTurn === 1 ? "#cc0000" : "#111111")
	$("body").css("background-color", bgColor);
	endGame();
}


function changePlayersTurn(){
	selectedCol = null;
	selectedRow = null;
	if(currentPlayersTurn === 1){
		currentPlayersTurn = 2;
	} else {
		currentPlayersTurn = 1;
	}
	deSelectAllPieces();
}

function endGame(){
	blackNum = 0;
	redNum = 0;
	for(var col = 0; col < boardstate.length; col++){
		for(var row = 0; row < boardstate[col].length; row++){
			if(boardstate[row][col] === RED_KING || boardstate[row][col] === RED_KING_SELECTED ||
					boardstate[row][col] === RED_NORMAL || boardstate[row][col] === RED_SELECTED ){
				redNum++;
			} else if (boardstate[row][col] === BLACK_KING || boardstate[row][col] === BLACK_KING_SELECTED ||
					boardstate[row][col] === BLACK_NORMAL || boardstate[row][col] === BLACK_SELECTED ){
				blackNum++;
			}
		}
	}

	if(blackNum === 0){
		$(".display").html("Player One Wins!");
		$("body").css("background-color", "#cc0000");
		isEndGame = true;
	} else if(redNum === 0){
		$(".display").html("Player Two Wins!");
		$("body").css("background-color", "#111111");
		isEndGame = true;
	}
}

function findSelectedExist(){
	for(var col = 0; col < boardstate.length; col++){
		for(var row = 0; row < boardstate[col].length; row++){
			if(boardstate[row][col] === BLACK_KING_SELECTED){
				return true;
			} else if(boardstate[row][col] === BLACK_SELECTED){
				return true;
			} else if(boardstate[row][col] === RED_KING_SELECTED){
				return true;
			} else if(boardstate[row][col] === RED_SELECTED){
				return true;
			}
		}
	}
	return false;
}

function deSelectAllPieces(){
	for(var col = 0; col < boardstate.length; col++){
		for(var row = 0; row < boardstate[col].length; row++){
			if(boardstate[row][col] === BLACK_KING_SELECTED){
				boardstate[row][col] = BLACK_KING;
			} else if(boardstate[row][col] === BLACK_SELECTED){
				boardstate[row][col] = BLACK_NORMAL;
			} else if(boardstate[row][col] === RED_KING_SELECTED){
				boardstate[row][col] = RED_KING;
			} else if(boardstate[row][col] === RED_SELECTED){
				boardstate[row][col] = RED_NORMAL;
			}
		}
	}
}



//checking relative to the parameter row and col. This function is dependent to selectedRow and selectCol, they must be set.
function isLegalMove(row, col){
	var out = false;
	if(boardstate[row][col] === EMPTY_SPACE){
		if( boardstate[selectedRow][selectedCol] === RED_KING_SELECTED){
			if((selectedRow + 1) === row && (selectedCol + 1) === col){
				//bottom right
				out = true;
				pieceMove(row, col, RED_KING);
			} else if((selectedRow + 1) === row && (selectedCol - 1) === col){
				//bottom left
				out = true;
				pieceMove(row, col, RED_KING);
			} else if((selectedRow - 1) === row && (selectedCol + 1) === col){
				//top right
				out = true;
				pieceMove(row, col, RED_KING);
			} else if ((selectedRow - 1) === row && (selectedCol - 1) === col){
				//top left
				out = true;
				pieceMove(row, col, RED_KING);
			} else if( (selectedRow + 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow + 1][selectedCol + 1] === BLACK_NORMAL ||
							boardstate[selectedRow + 1][selectedCol + 1] === BLACK_KING) ) {
				//bottom right jump red piece
				out = true;
				pieceJump(row, col, selectedRow + 1, selectedCol + 1, RED_KING);
			} else if((selectedRow + 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow + 1][selectedCol - 1] === BLACK_NORMAL ||
							boardstate[selectedRow + 1][selectedCol - 1] === BLACK_KING)){
				//bottom left jump red piece
				out = true;
				pieceJump(row, col, selectedRow + 1, selectedCol - 1, RED_KING);
			} else if( (selectedRow - 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow - 1][selectedCol + 1] === BLACK_NORMAL ||
							boardstate[selectedRow - 1][selectedCol + 1] === BLACK_KING) ) {
				//top right jump red piece
				out = true;
				pieceJump(row, col, selectedRow - 1, selectedCol + 1, RED_KING);
			} else if((selectedRow - 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow - 1][selectedCol - 1] === BLACK_NORMAL ||
							boardstate[selectedRow - 1][selectedCol - 1] === BLACK_KING)){
				//top left jump red piece
				out = true;
				pieceJump(row, col, selectedRow - 1, selectedCol - 1, RED_KING);
			}
		} else if( boardstate[selectedRow][selectedCol] === BLACK_KING_SELECTED){
			if((selectedRow + 1) === row && (selectedCol + 1) === col){
				//bottom right
				out = true;
				pieceMove(row, col, BLACK_KING);
			} else if((selectedRow + 1) === row && (selectedCol - 1) === col){
				//bottom left
				out = true;
				pieceMove(row, col, BLACK_KING);
			} else if((selectedRow - 1) === row && (selectedCol + 1) === col){
				//top right
				out = true;
				pieceMove(row, col, BLACK_KING);
			} else if ((selectedRow - 1) === row && (selectedCol - 1) === col){
				//top left
				out = true;
				pieceMove(row, col, BLACK_KING);
			} else if( (selectedRow + 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow + 1][selectedCol + 1] === RED_NORMAL ||
							boardstate[selectedRow + 1][selectedCol + 1] === RED_KING) ) {
				//bottom right jump red piece
				out = true;
				pieceJump(row, col, selectedRow + 1, selectedCol + 1, BLACK_KING);
			} else if((selectedRow + 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow + 1][selectedCol - 1] === RED_NORMAL ||
							boardstate[selectedRow + 1][selectedCol - 1] === RED_KING)){
				//bottom left jump red piece
				out = true;
				pieceJump(row, col, selectedRow + 1, selectedCol - 1, BLACK_KING);
			} else if( (selectedRow - 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow - 1][selectedCol + 1] === RED_NORMAL ||
							boardstate[selectedRow - 1][selectedCol + 1] === RED_KING) ) {
				//top right jump red piece
				out = true;
				pieceJump(row, col, selectedRow - 1, selectedCol + 1, BLACK_KING);
			} else if((selectedRow - 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow - 1][selectedCol - 1] === RED_NORMAL ||
							boardstate[selectedRow - 1][selectedCol - 1] === RED_KING)){
				//top left jump red piece
				out = true;
				pieceJump(row, col, selectedRow - 1, selectedCol - 1, BLACK_KING);
			}
		} else if(boardstate[selectedRow][selectedCol] === RED_SELECTED){
			if((selectedRow + 1) === row && (selectedCol + 1) === col){
				//bottom right
				out = true;
				if(row === RED_KING_LINE){
					pieceMove(row, col, RED_KING);
				} else {
					pieceMove(row, col, RED_NORMAL);
				}
			} else if((selectedRow + 1) === row && (selectedCol - 1) === col){
				//bottom left
				out = true;
				if(row === RED_KING_LINE){
					pieceMove(row, col, RED_KING);
				} else {
					pieceMove(row, col, RED_NORMAL);
				}
			} else if( (selectedRow + 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow + 1][selectedCol + 1] === BLACK_NORMAL ||
							boardstate[selectedRow + 1][selectedCol + 1] === BLACK_KING) ) {
				//bottom right jump red piece
				out = true;
				if(row === RED_KING_LINE){
					pieceJump(row, col, selectedRow + 1, selectedCol + 1, RED_KING);
				} else {
					pieceJump(row, col, selectedRow + 1, selectedCol + 1, RED_NORMAL);
				}
			} else if((selectedRow + 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow + 1][selectedCol - 1] === BLACK_NORMAL ||
							boardstate[selectedRow + 1][selectedCol - 1] === BLACK_KING)){
				//bottom left jump red piece
				out = true;
				if(row === RED_KING_LINE){
					pieceJump(row, col, selectedRow + 1, selectedCol - 1, RED_KING);
				} else {
					pieceJump(row, col, selectedRow + 1, selectedCol - 1, RED_NORMAL);
				}
			}
		} else if(boardstate[selectedRow][selectedCol] === BLACK_SELECTED){
			if((selectedRow - 1) === row && (selectedCol + 1) === col){
				//top right
				out = true;
				if(row === BLACK_KING_LINE){
					pieceMove(row, col, BLACK_KING);
				} else {
					pieceMove(row, col, BLACK_NORMAL);
				}
			} else if ((selectedRow - 1) === row && (selectedCol - 1) === col){
				//top left
				out = true;
				if(row === BLACK_KING_LINE){
					pieceMove(row, col, BLACK_KING);
				} else {
					pieceMove(row, col, BLACK_NORMAL);
				}
			} else if( (selectedRow - 2) === row && (selectedCol + 2) === col &&
						(boardstate[selectedRow - 1][selectedCol + 1] === RED_NORMAL ||
							boardstate[selectedRow - 1][selectedCol + 1] === RED_KING) ) {
				//top right jump red piece
				out = true;
				if(row === BLACK_KING_LINE){
					pieceJump(row, col, selectedRow - 1, selectedCol + 1, BLACK_KING);
				} else {
					pieceJump(row, col, selectedRow - 1, selectedCol + 1, BLACK_NORMAL);
				}
			} else if((selectedRow - 2) === row && (selectedCol - 2) === col &&
						(boardstate[selectedRow - 1][selectedCol - 1] === RED_NORMAL ||
							boardstate[selectedRow - 1][selectedCol - 1] === RED_KING)){
				//top left jump red piece
				out = true;
				if(row === BLACK_KING_LINE){
					pieceJump(row, col, selectedRow - 1, selectedCol - 1, BLACK_KING);
				} else {
					pieceJump(row, col, selectedRow - 1, selectedCol - 1, BLACK_NORMAL);
				}
			}
		}
	}

	return out;
}

function pieceMove(row, col, piece){
	boardstate[selectedRow][selectedCol] = EMPTY_SPACE;
	selectedCol = col;
	selectedRow = row;
	boardstate[row][col] = piece;
}

function pieceJump(row, col, jRow, jCol, piece){
	boardstate[selectedRow][selectedCol] = EMPTY_SPACE;  //current spot turns empty
	boardstate[jRow][jCol] = EMPTY_SPACE; //jump piece disappers
	selectedPieceRowCol(row, col);
	boardstate[row][col] = piece;  //move current piece
	hasJumped = true;
}

function doesJumpMoveExist(row, col, hasJumped){
	var out = [];

	if( boardstate[row][col] === RED_KING){
		if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if (row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col+2] === EMPTY_SPACE &&
			(boardstate[row + 1][col + 1] === BLACK_NORMAL ||
				boardstate[row + 1][col + 1] === BLACK_KING)){ //bot right
			out.push(true);
		}

		if(row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col-2] === EMPTY_SPACE &&
			(boardstate[row + 1][col - 1] === BLACK_NORMAL ||
				boardstate[row + 1][col - 1] === BLACK_KING)){  //bot left
			out.push(true);
		}

		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if( boardstate[row-2][col + 2] === EMPTY_SPACE  &&
				(boardstate[row - 1][col + 1] === BLACK_NORMAL ||
					boardstate[row - 1][col + 1] === BLACK_KING) ) { //top right
				out.push(true);
		}

 		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if(col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if( (boardstate[row - 2][col - 2] === EMPTY_SPACE) &&
					(boardstate[row - 1][col - 1] === BLACK_NORMAL ||
						boardstate[row - 1][col - 1] === BLACK_KING)){ //top left
			out.push(true);
		}
	} else if( boardstate[row][col] === BLACK_KING){
		if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if (row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col+2] === EMPTY_SPACE &&
			(boardstate[row + 1][col + 1] === RED_NORMAL ||
				boardstate[row + 1][col + 1] === RED_KING)){ //bot right
			out.push(true);
		}

		if(row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col-2] === EMPTY_SPACE &&
			(boardstate[row + 1][col - 1] === RED_NORMAL ||
				boardstate[row + 1][col - 1] === RED_KING)){  //bot left
			out.push(true);
		}

		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if( boardstate[row-2][col+2] === EMPTY_SPACE  &&
				(boardstate[row-1][col+1] === RED_NORMAL ||
					boardstate[row - 1][col + 1] === RED_KING) ) { //top right
				out.push(true);
		}

 		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if(col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if( (boardstate[row - 2][col - 2] === EMPTY_SPACE) &&
					(boardstate[row - 1][col - 1] === RED_NORMAL ||
						boardstate[row - 1][col - 1] === RED_KING)){ //top left
			out.push(true);
		}
	} else if(boardstate[row][col] === RED_NORMAL){
		if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if (row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col+2] === EMPTY_SPACE &&
			(boardstate[row + 1][col + 1] === BLACK_NORMAL ||
				boardstate[row + 1][col + 1] === BLACK_KING)){ //bot right
			out.push(true);
		}

		if(row+2 > MAX || row+2 < MIN){  //array out of bounds
			out.push(false);
		} else if (row+1 > MAX || row+1 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if (boardstate[row+2][col-2] === EMPTY_SPACE &&
			(boardstate[row + 1][col - 1] === BLACK_NORMAL ||
				boardstate[row + 1][col - 1] === BLACK_KING)){  //bot left
			out.push(true);
		}
	} else if(boardstate[row][col] === BLACK_NORMAL){
		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+1 > MAX || col+1 < MIN){ //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if(col+2 > MAX || col+2 < MIN){ //array out of bounds
			out.push(false);
		} else if( boardstate[row-2][col + 2] === EMPTY_SPACE  &&
				(boardstate[row - 1][col + 1] === RED_NORMAL ||
					boardstate[row - 1][col + 1] === RED_KING) ) { //top right
				out.push(true);
		}

 		if(row-1 > MAX || row-1 < MIN){  //array out of bounds
			out.push(false);
		} else if(row-2 > MAX || row-2 < MIN){  //array out of bounds
			out.push(false);
		} else if (col-1 > MAX || col-1 < MIN){ //array out of bounds
			out.push(false);
		} else if(col-2 > MAX || col-2 <MIN){ //array out of bounds
			out.push(false);
		} else if( (boardstate[row - 2][col - 2] === EMPTY_SPACE) &&
					(boardstate[row - 1][col - 1] === RED_NORMAL ||
						boardstate[row - 1][col - 1] === RED_KING)){ //top left
			out.push(true);
		}
	}

	//checks to see if there is at least one more possible move
	var temp = false;
	for(var i = 0; i < out.length; i++){
		if(out[i] === true){
			temp = true;
			break;
		}
	}
	return temp;
}

function selectedPieceRowCol(row, col){
	selectedCol = col;
	selectedRow = row;
}

function touch(row, col){
	if (currentPlayersTurn !== team) {
	    return false;
    }

	var piece = boardstate[row][col];
	var isSelectedPiece = findSelectedExist();
	if(piece === EMPTY_SPACE && isSelectedPiece){
		moved = isLegalMove(row, col);
		if(moved){  //move
			if(hasJumped){
				hasAnotherLegalMove = doesJumpMoveExist(selectedRow, selectedCol);
				if(hasAnotherLegalMove) {
					hasJumped = true;
					if(boardstate[row][col] === RED_NORMAL || boardstate[row][col] === BLACK_NORMAL){
						boardstate[row][col] = (currentPlayersTurn === 1) ? RED_SELECTED : BLACK_SELECTED;
					} else if (boardstate[row][col] === RED_KING || boardstate[row][col] === BLACK_KING){
						boardstate[row][col] = (currentPlayersTurn === 1) ? RED_KING_SELECTED : BLACK_KING_SELECTED;
					}
					selectedCol = col;
					selectedRow = row;
				} else {
					hasAnotherLegalMove = false;
					hasJumped = false;
					moved = false;
					changePlayersTurn();
                    sendTurn(boardstate, currentPlayersTurn);
                }
			} else {
				hasAnotherLegalMove = false;
				hasJumped = false;
				moved = false;
				changePlayersTurn();
                sendTurn(boardstate, currentPlayersTurn);
            }
		}
	} else if(piece%2 === 0 && currentPlayersTurn === 2 && !isStillTurn && !hasJumped){
		//selecting a piece during player 2s turn
		deSelectAllPieces();
		if(piece === BLACK_KING){
			boardstate[row][col] = BLACK_KING_SELECTED;
			selectedPieceRowCol(row, col);
		} else if(piece === BLACK_NORMAL) {
			boardstate[row][col] = BLACK_SELECTED;
			selectedPieceRowCol(row, col);
		}
	} else if (piece%2 === 1 && currentPlayersTurn === 1 && !isStillTurn && !hasJumped){
		// selecting a piece during player 1s turns
		deSelectAllPieces();
		if(piece === RED_KING){
			boardstate[row][col] = RED_KING_SELECTED;
			selectedPieceRowCol(row, col);
		} else if(piece === RED_NORMAL) {
			boardstate[row][col] = RED_SELECTED;
			selectedPieceRowCol(row, col);
		}
	}
	drawBoard();
}

function resetBoard(){
    //Can only reset if it's their turn? Who knows the effectiveness of this.
    if (currentPlayersTurn === team) {
        selectedCol = 0;
        selectedRow = 0;
        isStillTurn = false;
        isEndGame = false;
        currentPlayersTurn = 1;
        boardstate = [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [9, 0, 9, 0, 9, 0, 9, 0],
            [0, 9, 0, 9, 0, 9, 0, 9],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0]
        ];
        sendTurn(boardstate, currentPlayersTurn);
    }
}


$(document).ready(function(){
	drawBoard();
	connect();
    $('.reset').on("click", function() { resetBoard(); });
});





