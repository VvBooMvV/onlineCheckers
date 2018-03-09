package com.cs451checkers.checkersgame.model;

public class MoveModel {

    //Incoming, updated board state
    private int[][] board;

    //Current player's turn
    //TODO: I have a feeling the server will have to switch turns and clients will just end their own
    private int currentTurn;

    //The list of moves the player took in the last turn
    //This is in the format:
    //owner pieceid jump startY startX newY newX
    //owner pieceid move startY startX newY newX
    //owner pieceid king
    private String[] moves;

    public MoveModel() {
        //for spring
    }

    public MoveModel(int[][] board, int currentTurn, String[] moves) {
        this.board = board;
        this.currentTurn = currentTurn;
        this.moves = moves;
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

    public String[] getMoves() {
        return moves;
    }

    public void setMoves(String[] newMoves) {
        this.moves = newMoves;
    }
}
