package com.puzzle.util;

public class ANSIColors {
    // 重置
    public static final String RESET = "\u001B[0m";
    
    // 常规颜色
    public static final String RED = "\u001B[31m";
    public static final String GREEN = "\u001B[32m";
    public static final String YELLOW = "\u001B[33m";
    public static final String BLUE = "\u001B[34m";
    public static final String CYAN = "\u001B[36m";
    public static final String WHITE = "\u001B[37m";
    
    // 背景色
    public static final String BG_BLACK = "\u001B[40m";
    public static final String BG_RED = "\u001B[41m";
    public static final String BG_GREEN = "\u001B[42m";
    public static final String BG_YELLOW = "\u001B[43m";
    public static final String BG_BLUE = "\u001B[44m";
    public static final String BG_PURPLE = "\u001B[45m";
    public static final String BG_CYAN = "\u001B[46m";
    public static final String BG_WHITE = "\u001B[47m";
    
    // 自定义颜色 - 深绿色（在256色中选择一个与现有颜色明显不同的颜色）
    public static final String BG_DARK_GREEN = "\u001B[48;5;22m"; // 深绿色
    
    // 彩色方块字符
    public static final String BLACK_BLOCK = BG_DARK_GREEN + "  " + RESET;
    public static final String RED_BLOCK = BG_RED + "  " + RESET;
    public static final String GREEN_BLOCK = BG_GREEN + "  " + RESET;
    public static final String YELLOW_BLOCK = BG_YELLOW + "  " + RESET;
    public static final String BLUE_BLOCK = BG_BLUE + "  " + RESET;
    public static final String PURPLE_BLOCK = BG_PURPLE + "  " + RESET;
    public static final String CYAN_BLOCK = BG_CYAN + "  " + RESET;
    public static final String WHITE_BLOCK = BG_WHITE + "  " + RESET;
    
    // 获取对应颜色的方块
    public static String getColorBlock(int colorIndex) {
        return switch (colorIndex) {
            case 0 -> BLACK_BLOCK; // 0索引现在显示为深绿色而不是黑色
            case 1 -> RED_BLOCK;
            case 2 -> GREEN_BLOCK;
            case 3 -> YELLOW_BLOCK;
            case 4 -> BLUE_BLOCK;
            case 5 -> PURPLE_BLOCK;
            case 6 -> CYAN_BLOCK;
            default -> WHITE_BLOCK;
        };
    }
}