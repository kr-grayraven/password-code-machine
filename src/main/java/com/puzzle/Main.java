package com.puzzle;


import com.puzzle.util.ANSIColors;

public class Main {
    public static void main(String[] args) {
        PasswordPuzzle game = new PasswordPuzzle();
        System.out.println(ANSIColors.GREEN + "初始化成功！" + ANSIColors.RESET);
        game.start();
    }
}