package com.cs451checkers.checkersgame.controller;

import com.cs451checkers.checkersgame.model.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Message sendMessage(Message message) {
        return new Message("This is test content");
    }
}
