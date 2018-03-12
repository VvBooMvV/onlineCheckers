package com.cs451checkers.checkersgame.model;

public class CheckerModel {

    //Incoming, updated board state
    private int[][] board;

    //Current player's turn
    //TODO: I have a feeling the server will have to switch turns and clients will just end their own
    private int currentTurn;

    private String msgType;

    private int[] removedPieces;
    private int[] kingedPieces;

    public CheckerModel() {
        //for spring
    }

    public CheckerModel(int[][] board, int currentTurn, int[] removedPieces, int[] kingedPieces) {
        this.board = board;
        this.currentTurn = currentTurn;
        this.msgType = "move";
        this.removedPieces = removedPieces;
        this.kingedPieces = kingedPieces;
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

    public int[] getRemovedPieces() {
        return removedPieces;
    }

    public void setRemovedPieces(int[] removedPieces) {
        this.removedPieces = removedPieces;
    }

    public int[] getKingedPieces() {
        return kingedPieces;
    }

    public void setKingedPieces(int[] kingedPieces) {
        this.kingedPieces = kingedPieces;
    }
}
