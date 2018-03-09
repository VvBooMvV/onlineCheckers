package com.cs451checkers.checkersgame.controller;

import com.cs451checkers.checkersgame.model.Message;
import com.cs451checkers.checkersgame.model.MoveModel;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MoveController {

    @MessageMapping("/join")
    @SendTo("/game/init")
    public Message sendMessage(Message message) {
        return new Message("This is a new connection");
    }

    @MessageMapping("/processturn")
    @SendTo("/game/init")
    public MoveModel sendTurnResponse(MoveModel latestMove) {
        //TODO: store move stuff here
        return latestMove;
    }
}
