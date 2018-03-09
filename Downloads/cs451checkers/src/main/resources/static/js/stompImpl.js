var stompClient = null;

function connect() {
    var socket = new SockJS('/checkers-ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/greetings', function(messageOutput) {
            showMessageOutput(JSON.parse(messageOutput.body).content);
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
    stompClient.send("/app/hello", {}, JSON.stringify({'content': 'passing it back'}));
}

function showMessageOutput(messageOutput) {
    console.log("Message output from server: " + messageOutput);
}

$(function() {
    $( "#connect" ).on("click", function() { connect() });
    $( "#disconnect" ).on("click", function() { disconnect() });
    $( "#testing" ).on("click", function() { sendMessage() });
});