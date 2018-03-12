package com.cs451checkers.checkersgame.controller;

import com.cs451checkers.checkersgame.model.CheckerModel;
import com.cs451checkers.checkersgame.model.TurnModel;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MoveController {

    //1 is red, 2 is black
    int initialTeam = 1;
    boolean initialConnection = true;


    @MessageMapping("/join")
    @SendTo("/game/init")
    public TurnModel sendMessage(TurnModel message) {
        if (message.getMsgType().equals("concede")) {
            return message;
        }
        if (initialTeam <= 2) {
            TurnModel responseMessage = new TurnModel("init", initialTeam);
            initialTeam++;
            return responseMessage;
        } else {
            initialTeam = 1;
            return new TurnModel("init", initialTeam);
        }
    }

    @MessageMapping("/processturn")
    @SendTo("/game/init")
    public CheckerModel sendTurnResponse(CheckerModel latestMove) {
        return latestMove;
    }

}
