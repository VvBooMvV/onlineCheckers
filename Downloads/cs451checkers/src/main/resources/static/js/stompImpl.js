/*var stompClient = null;

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
    Board.redraw();
}

$(function() {
    $( "#connect" ).on("click", function() { connect() });
    $( "#disconnect" ).on("click", function() { disconnect() });
    $( "#testing" ).on("click", function() { sendMessage() });
});*/