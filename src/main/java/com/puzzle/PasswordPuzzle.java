package com.puzzle;

import com.puzzle.util.ANSIColors;

import java.util.*;
import java.util.logging.Logger;

public class PasswordPuzzle {
    private static final int TOTAL_ROWS = 7; // 总行数
    private int[] password;
    private final List<int[]> guesses = new ArrayList<>();
    private boolean isHardMode;
    private int colorPoolSize;

    Logger log = Logger.getLogger(PasswordPuzzle.class.getName());

    public void start() {
        boolean playAgain = true;

        try (Scanner scanner = new Scanner(System.in)) {
            while (playAgain) {
                // 选择难度
                System.out.println(ANSIColors.BLUE + "是否启用困难模式？ 输入 [1] 或 [是] 确认" + ANSIColors.RESET);
                System.out.println("提示：简单模式显示每个颜色与位置是否正确，困难模式只会显示有几个颜色正确或几个颜色与位置都正确");
                String difficultyInput = scanner.nextLine().trim();

                // 处理难度选择，true为困难，false为简单，程序默认为简单难度
                isHardMode = false;
                if (!difficultyInput.isEmpty()) {
                    if (difficultyInput.equals("1") || difficultyInput.equalsIgnoreCase("是")) {
                        isHardMode = true;
                    } else {
                        System.out.println("无效的输入，使用默认难度简单模式");
                    }
                }
                if (isHardMode) {
                    System.out.println(ANSIColors.RED + "困难模式启用" + ANSIColors.RESET);
                } else {
                    System.out.println(ANSIColors.CYAN + "简单模式启用" + ANSIColors.RESET);
                }
                colorPoolSize = isHardMode ? 7 : 4;

                // 生成密码
                password = generatePassword(colorPoolSize);

                // 生成默认提示行（1~5行，不含密码）
                int defaultHintsCount = (int) (Math.random() * 5) + 1; // 1~5
                List<int[]> defaultHints = generateDefaultHints(colorPoolSize, password, defaultHintsCount);
                guesses.clear();
                guesses.addAll(defaultHints);

                // 剩余尝试次数
                int remainingAttempts = TOTAL_ROWS - guesses.size();

                // 游戏主循环
                boolean gameWon = false;
                while (remainingAttempts > 0) {
                    displayHints();
                    // 这行用于加粗显示剩余猜测次数
                    System.out.println("剩余猜测次数: " + ANSIColors.GREEN + "\033[1m" + remainingAttempts + "\033[0m" + ANSIColors.RESET);
                    if (getUserGuess(scanner)) {
                        if (Arrays.equals(guesses.getLast(), password)) {
                            System.out.println(ANSIColors.CYAN + "恭喜！你破解了密码！" + ANSIColors.RESET);
                            displayPasswordAndIndex();
                            gameWon = true;
                            break;
                        }
                        remainingAttempts--;
                    }
                }

                // 游戏失败
                if (!gameWon) {
                    System.out.println(ANSIColors.RED + "尝试次数用完，游戏失败！" + ANSIColors.RESET);
                    displayPasswordAndIndex();
                }

                // 询问是否再次游戏
                System.out.println("\n是否再次游戏？输入 [1] 或 [是] 确认，输入其他任意内容退出游戏");
                String playAgainInput = scanner.nextLine().trim();
                if (!(playAgainInput.equals("1") || playAgainInput.equalsIgnoreCase("是"))) {
                    playAgain = false;
                    System.out.println(ANSIColors.GREEN + "感谢游戏！再见！" + ANSIColors.RESET);
                }
            }
        } catch (Exception e) {
            System.out.println(ANSIColors.RED + "发生错误，详情请看日志信息！" + ANSIColors.RESET);
            log.severe(e.getMessage());
        } finally {
            System.out.println(ANSIColors.GREEN + "游戏结束，输入程序关闭成功！" + ANSIColors.RESET);
        }
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
            // 将索引从0开始改为从1开始便于理解
            password[i] = colorList.get(i) + 1;
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
            // 调整比较逻辑以适应新的索引系统
            for (int i = 0; i < guess.length; i++) {
                // 将索引从0开始改为从1开始便于理解
                guess[i] += 1;
            }
            if (!Arrays.equals(guess, password)) {
                hints.add(guess);
            }
        }
        return hints;
    }

    // 显示所有提示行
    private void displayHints() {
        // 显示颜色索引提示
        displayColorIndex();
        // 显示当前所有猜测结果
        System.out.println("\n当前提示：");
        for (int i = 0; i < guesses.size(); i++) {
            int[] guess = guesses.get(i);
            System.out.print("猜测 " + (i + 1) + ": ");

            // 显示彩色方块
            for (int color : guess) {
                // 调整颜色索引以适应ANSIColors中的颜色映射
                System.out.print(ANSIColors.getColorBlock(color - 1) + "  ");
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
                    // 调整颜色索引以进行正确比较
                    if (guess[j] != password[j]) {
                        passwordColors.put(password[j] - 1, passwordColors.getOrDefault(password[j] - 1, 0) + 1);
                        guessColors.put(guess[j] - 1, guessColors.getOrDefault(guess[j] - 1, 0) + 1);
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
                // 简单模式：显示每个位置的详细反馈
                System.out.print("| ");
                // 统计密码中各颜色的数量
                Map<Integer, Integer> passwordColorCount = new HashMap<>();
                for (int color : password) {
                    passwordColorCount.put(color, passwordColorCount.getOrDefault(color, 0) + 1);
                }

                // 统计猜测中各颜色的数量
                Map<Integer, Integer> guessColorCount = new HashMap<>();
                for (int color : guess) {
                    guessColorCount.put(color, guessColorCount.getOrDefault(color, 0) + 1);
                }

                for (int j = 0; j < 4; j++) {
                    if (guess[j] == password[j]) {
                        // 位置和颜色都正确
                        System.out.print(ANSIColors.GREEN + "● " + ANSIColors.RESET);
                    } else if (passwordColorCount.containsKey(guess[j]) && passwordColorCount.get(guess[j]) > 0) {
                        // 颜色正确但位置错误
                        System.out.print(ANSIColors.WHITE + "● " + ANSIColors.RESET);
                        // 减少密码中该颜色的可用计数
                        passwordColorCount.put(guess[j], passwordColorCount.get(guess[j]) - 1);
                    } else {
                        // 颜色和位置都不正确
                        System.out.print(ANSIColors.WHITE + "○ " + ANSIColors.RESET);
                    }
                }
                System.out.println();
                System.out.println();
            }
        }
    }

    // 获取用户输入
    private boolean getUserGuess(Scanner scanner) {
        System.out.println("请输入你的猜测（4个颜色数字索引，用空格分隔或直接输入，例如：1 2 3 4 或 1234）：");
        String input = scanner.nextLine().trim();

        // 解析输入，支持两种格式：空格分隔或连续数字
        String[] parts;
        if (input.contains(" ")) {
            // 使用空格分隔的格式
            parts = input.split("\\s+");
        } else {
            // 使用连续数字的格式
            if (input.length() != 4) {
                System.out.println();
                System.out.println(ANSIColors.YELLOW + "输入必须包含4个颜色数字索引！" + ANSIColors.RESET);
                return false;
            }
            parts = new String[4];
            for (int i = 0; i < 4; i++) {
                parts[i] = String.valueOf(input.charAt(i));
            }
        }

        if (parts.length != 4) {
            System.out.println();
            System.out.println(ANSIColors.YELLOW + "输入必须包含4个颜色数字索引！" + ANSIColors.RESET);
            return false;
        }

        int[] guess = new int[4];
        try {
            for (int i = 0; i < 4; i++) {
                guess[i] = Integer.parseInt(parts[i]);
            }
        } catch (NumberFormatException e) {
            System.out.println();
            System.out.println(ANSIColors.YELLOW + "输入的猜测必须是颜色数字索引！" + ANSIColors.RESET);
            return false;
        }

        // 检查颜色索引是否在有效范围内（现在是从1开始，不是0）
        for (int color : guess) {
            if (color < 1 || color > colorPoolSize) {
                System.out.println();
                System.out.println(ANSIColors.YELLOW + "合法的颜色索引必须在1~" + colorPoolSize + "之间！" + ANSIColors.RESET);
                return false;
            }
        }

        guesses.add(guess);
        return true;
    }

    // 显示带颜色的密码
    private void displayPasswordWithColors(int[] password) {
        for (int color : password) {
            // 调整颜色索引以适应ANSIColors中的颜色映射
            System.out.print(ANSIColors.getColorBlock(color - 1) + " ");
        }
        System.out.println();
    }

    // 显示颜色索引提示
    private void displayColorIndex() {
        // 这个换行输出用于格式化文本，避免与输入练字
        System.out.println();
        System.out.println("谜题颜色索引提示：");
        // 从1开始显示索引
        for (int i = 1; i <= colorPoolSize; i++) {
            // 调整索引以适应颜色映射
            System.out.print(i + ": " + ANSIColors.getColorBlock(i - 1));
            System.out.print(" ");
        }
        System.out.println();
    }

    // 显示正确密码并输出密码索引
    private void displayPasswordAndIndex() {
        System.out.print("正确密码是：");
        displayPasswordWithColors(password);
        System.out.print("索引序列为：");
        System.out.println(Arrays.toString(password));
    }
}