package com.puzzle;

import com.puzzle.util.ANSIColors;

import java.util.*;

public class PasswordPuzzle {
    private static final int TOTAL_ROWS = 7; // 总行数
    private int[] password;
    private final List<int[]> guesses = new ArrayList<>();
    private boolean isHardMode;
    private int colorPoolSize;

    public void start() {
        Scanner scanner = new Scanner(System.in);

        // 选择难度
        System.out.println("请输入难度（简单/困难），默认为简单难度：");
        String difficulty = scanner.nextLine().trim();
        isHardMode = difficulty.equalsIgnoreCase("困难");
        colorPoolSize = isHardMode ? 7 : 4;

        // 显示颜色索引提示
        displayColorIndex();

        // 生成密码
        password = generatePassword(colorPoolSize);

        // 生成默认提示行（1~5行，不含密码）
        int defaultHintsCount = (int) (Math.random() * 5) + 1; // 1~5
        List<int[]> defaultHints = generateDefaultHints(colorPoolSize, password, defaultHintsCount);
        guesses.addAll(defaultHints);

        // 剩余尝试次数
        int remainingAttempts = TOTAL_ROWS - guesses.size();

        // 游戏主循环
        while (remainingAttempts > 0) {
            displayHints();
            if (getUserGuess(scanner)) {
                if (Arrays.equals(guesses.getLast(), password)) {
                    System.out.println("恭喜！你破解了密码！");
                    return;
                }
                remainingAttempts--;
            }
        }

        // 游戏失败
        System.out.println("尝试次数用完，游戏失败！");
        System.out.print("正确密码是：");
        displayPasswordWithColors(password);
    }

    // 生成密码（4个不重复的颜色）
    private int[] generatePassword(int colorPoolSize) {
        Set<Integer> colors = new HashSet<>();
        while (colors.size() < 4) {
            int color = (int) (Math.random() * colorPoolSize);
            colors.add(color);
        }
        List<Integer> colorList = new ArrayList<>(colors);
        Collections.shuffle(colorList);
        int[] password = new int[4];
        for (int i = 0; i < 4; i++) {
            password[i] = colorList.get(i);
        }
        return password;
    }

    // 生成默认提示行（不含密码）
    private List<int[]> generateDefaultHints(int colorPoolSize, int[] password, int maxHints) {
        List<int[]> hints = new ArrayList<>();
        while (hints.size() < maxHints) {
            int[] guess = new int[4];
            for (int i = 0; i < 4; i++) {
                guess[i] = (int) (Math.random() * colorPoolSize);
            }
            if (!Arrays.equals(guess, password)) {
                hints.add(guess);
            }
        }
        return hints;
    }

    // 显示所有提示行
    private void displayHints() {
        System.out.println("\n当前提示：");
        for (int i = 0; i < guesses.size(); i++) {
            int[] guess = guesses.get(i);
            System.out.print("猜测 " + (i + 1) + ": ");
            
            // 显示彩色方块
            for (int color : guess) {
                System.out.print(ANSIColors.getColorBlock(color) + "  ");
            }

            if (isHardMode) {
                int green = 0, white = 0;

                // 计算绿灯（颜色和位置都正确）
                for (int j = 0; j < 4; j++) {
                    if (guess[j] == password[j]) {
                        green++;
                    }
                }

                // 计算白灯（颜色正确但位置错误）
                Map<Integer, Integer> passwordColors = new HashMap<>();
                Map<Integer, Integer> guessColors = new HashMap<>();

                for (int j = 0; j < 4; j++) {
                    if (guess[j] != password[j]) {
                        passwordColors.put(password[j], passwordColors.getOrDefault(password[j], 0) + 1);
                        guessColors.put(guess[j], guessColors.getOrDefault(guess[j], 0) + 1);
                    }
                }

                // 白灯数 = 各颜色在密码和猜测中的最小出现次数之和
                for (Map.Entry<Integer, Integer> entry : guessColors.entrySet()) {
                    int color = entry.getKey();
                    int countInGuess = entry.getValue();
                    int countInPassword = passwordColors.getOrDefault(color, 0);
                    white += Math.min(countInGuess, countInPassword);
                }

                System.out.println(" | " + ANSIColors.GREEN + " ● ".repeat(green) +
                                 ANSIColors.WHITE + " ● ".repeat(white) +
                                 ANSIColors.RESET + " ○ ".repeat(4 - green - white));
                System.out.println();
            } else {
                // 简单模式：直接显示每个位置是否正确
                System.out.print("| ");
                for (int j = 0; j < 4; j++) {
                    if (guess[j] == password[j]) {
                        System.out.print(ANSIColors.GREEN + "✓ " + ANSIColors.RESET);
                    } else {
                        System.out.print(ANSIColors.RED + "✗ " + ANSIColors.RESET);
                    }
                }
                System.out.println();
                System.out.println();
            }
        }
    }

    // 获取用户输入
    private boolean getUserGuess(Scanner scanner) {
        System.out.println("请输入你的猜测（4个颜色数字索引，用空格分隔，例如：1 2 3 4）：");
        String input = scanner.nextLine().trim();
        String[] parts = input.split("\\s+");

        if (parts.length != 4) {
            System.out.println("输入必须包含4个颜色数字索引！");
            return false;
        }

        int[] guess = new int[4];
        try {
            for (int i = 0; i < 4; i++) {
                guess[i] = Integer.parseInt(parts[i]);
            }
        } catch (NumberFormatException e) {
            System.out.println("输入的猜测必须是颜色数字索引！");
            return false;
        }

        // 检查颜色是否在有效范围内
        for (int color : guess) {
            if (color < 0 || color >= colorPoolSize) {
                System.out.println("颜色必须在 0~" + (colorPoolSize - 1) + " 之间！");
                return false;
            }
        }

        guesses.add(guess);
        return true;
    }
    
    // 显示带颜色的密码
    private void displayPasswordWithColors(int[] password) {
        for (int color : password) {
            System.out.print(ANSIColors.getColorBlock(color) + " ");
        }
        System.out.println();
    }
    
    // 显示颜色索引提示
    private void displayColorIndex() {
        System.out.println("颜色索引提示：");
        for (int i = 0; i < colorPoolSize; i++) {
            System.out.print(i + ": " + ANSIColors.getColorBlock(i));
            System.out.print(" ");
        }
        System.out.println();
    }
}