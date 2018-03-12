package com.cs451checkers.checkersgame.model;

public class TurnModel {

    private int team;

    private String msgType;

    public TurnModel() {
        //for spring
    }

    public TurnModel(String msgType, int team) {
        this.msgType = msgType;
        this.team = team;
    }

    public int getTeam() {
        return team;
    }

    public void setTeam(int team) {
        this.team = team;
    }

    public String getMsgType() {
        return msgType;
    }

    public void setMsgType(String msgType) {
        this.msgType = msgType;
    }
}
