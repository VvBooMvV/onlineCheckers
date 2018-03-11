package com.cs451checkers.checkersgame.controller;

import com.cs451checkers.checkersgame.model.Message;
import com.cs451checkers.checkersgame.model.MoveModel;
import com.cs451checkers.checkersgame.model.TestModel;
import com.cs451checkers.checkersgame.model.TurnModel;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MoveController {

    //1 is red, 2 is black
    int initialTeam = 1;

    @MessageMapping("/join")
    @SendTo("/game/init")
    public TurnModel sendMessage(TurnModel message) {
        if (initialTeam <= 2) {
            TurnModel responseMessage = new TurnModel("init", initialTeam);
            initialTeam++;
            return responseMessage;
        } else {
            return new TurnModel("full", -1);
        }
    }

    @MessageMapping("/processturn")
    @SendTo("/game/init")
    public TestModel sendTurnResponse(TestModel latestMove) {
        return latestMove;
    }

}
