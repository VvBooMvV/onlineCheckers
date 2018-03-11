package com.cs451checkers.checkersgame.model;

public class TestModel {

    //Incoming, updated board state
    private int[][] board;

    //Current player's turn
    //TODO: I have a feeling the server will have to switch turns and clients will just end their own
    private int currentTurn;

    private String msgType;

    public TestModel() {
        //for spring
    }

    public TestModel(int[][] board, int currentTurn) {
        this.board = board;
        this.currentTurn = currentTurn;
        this.msgType = "move";
    }

    public int[][] getBoard() {
        return board;
    }

    public void setBoard(int[][] newBoard) {
        this.board = newBoard;
    }

    public int getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(int newTurn) {
        this.currentTurn = newTurn;
    }

    public String getMsgType() {
        return msgType;
    }

    public void setMsgType(String msgType) {
        this.msgType = msgType;
    }
}
