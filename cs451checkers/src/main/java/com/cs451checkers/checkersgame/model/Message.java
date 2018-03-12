package com.cs451checkers.checkersgame.model;

//Used to join the server
public class Message {
    private String msgType;

    public Message() {
        //Apparently these are necessary for spring...
    }

    public Message(String msgType) {
        this.msgType = msgType;
    }

    public String getMsgType() {
        return msgType;
    }

    public void setMsgType(String msgType) {
        this.msgType = msgType;
    }
}
