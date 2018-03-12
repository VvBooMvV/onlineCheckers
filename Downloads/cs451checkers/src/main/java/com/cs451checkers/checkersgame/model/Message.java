package com.cs451checkers.checkersgame.model;


public class Message {
    private String content;

    public Message() {
        //Apparently these are necessary for spring...
    }

    public Message(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
