// 游戏状态管理
class PasswordPuzzleGame {
    constructor() {
        this.password = [];
        this.guesses = [];
        this.isHardMode = false;
        this.colorPoolSize = 5;
        this.maxAttempts = 7;
        this.currentAttempts = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.currentGuess = [null, null, null, null]; // 当前正在构建的猜测
        this.selectedSlot = 0; // 当前选中的位置
        
        // 颜色定义
        this.colors = [
            { name: '深绿', hex: '#2E7D32' },
            { name: '红色', hex: '#D32F2F' },
            { name: '天蓝', hex: '#74efc6' },
            { name: '黄色', hex: '#F57C00' },
            { name: '蓝色', hex: '#1976D2' },
            { name: '紫色', hex: '#7B1FA2' },
            { name: '青色', hex: '#0097A7' }
        ];
        
        this.initializeEventListeners();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 模式选择按钮
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.startGame(mode);
            });
        });
        
        // 新游戏按钮
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.showModeSelection();
        });
        
        // 提交猜测按钮
        document.getElementById('submit-guess').addEventListener('click', () => {
            this.submitGuess();
        });
        
        // 清空猜测按钮
        document.getElementById('clear-guess').addEventListener('click', () => {
            this.clearCurrentGuess();
        });
        
        // 游戏规则切换
        document.getElementById('rules-toggle').addEventListener('click', () => {
            this.toggleRules();
        });
        
        // 模态框按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.closeModal();
            this.showModeSelection();
        });
        
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeModal();
        });
        
        // 点击模态框背景关闭
        document.getElementById('game-over-modal').addEventListener('click', (e) => {
            if (e.target.id === 'game-over-modal') {
                this.closeModal();
            }
        });
    }
    
    // 开始游戏
    startGame(mode) {
        this.isHardMode = mode === 'hard';
        this.colorPoolSize = this.isHardMode ? 7 : 5;
        this.maxAttempts = 7;
        this.currentAttempts = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.guesses = [];
        this.currentGuess = [null, null, null, null];
        this.selectedSlot = 0;
        
        // 生成密码
        this.password = this.generatePassword();
        
        // 生成默认提示
        this.generateDefaultHints();
        
        // 显示游戏界面
        this.showGameContainer();
        
        // 更新UI
        this.updateGameInfo();
        this.renderColorPalette();
        this.renderColorSelectionPalette();
        this.renderCurrentGuess();
        this.renderGuesses();
    }
    
    // 生成密码
    generatePassword() {
        const colors = new Set();
        while (colors.size < 4) {
            const color = Math.floor(Math.random() * this.colorPoolSize);
            colors.add(color);
        }
        
        const colorArray = Array.from(colors);
        // 打乱顺序
        for (let i = colorArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colorArray[i], colorArray[j]] = [colorArray[j], colorArray[i]];
        }
        
        return colorArray;
    }
    
    // 生成默认提示
    generateDefaultHints() {
        const hintCount = Math.floor(Math.random() * 5) + 1; // 1-5个提示
        
        for (let i = 0; i < hintCount; i++) {
            let hint;
            do {
                hint = [];
                for (let j = 0; j < 4; j++) {
                    hint.push(Math.floor(Math.random() * this.colorPoolSize));
                }
            } while (this.arraysEqual(hint, this.password));
            
            this.guesses.push({
                colors: hint,
                feedback: this.calculateFeedback(hint),
                isHint: true
            });
            this.currentAttempts++;
        }
    }
    
    // 计算反馈
    calculateFeedback(guess) {
        if (this.isHardMode) {
            return this.calculateHardModeFeedback(guess);
        } else {
            return this.calculateEasyModeFeedback(guess);
        }
    }
    
    // 简单模式反馈计算
    calculateEasyModeFeedback(guess) {
        const feedback = [];
        
        for (let i = 0; i < 4; i++) {
            if (guess[i] === this.password[i]) {
                feedback.push('correct');
            } else if (this.password.includes(guess[i])) {
                feedback.push('wrong-position');
            } else {
                feedback.push('wrong');
            }
        }
        
        return feedback;
    }
    
    // 困难模式反馈计算
    calculateHardModeFeedback(guess) {
        let correct = 0;
        let wrongPosition = 0;
        
        // 计算位置和颜色都正确的数量
        for (let i = 0; i < 4; i++) {
            if (guess[i] === this.password[i]) {
                correct++;
            }
        }
        
        // 计算颜色正确但位置错误的数量
        const passwordColors = new Map();
        const guessColors = new Map();
        
        for (let i = 0; i < 4; i++) {
            if (guess[i] !== this.password[i]) {
                passwordColors.set(this.password[i], (passwordColors.get(this.password[i]) || 0) + 1);
                guessColors.set(guess[i], (guessColors.get(guess[i]) || 0) + 1);
            }
        }
        
        for (const [color, count] of guessColors) {
            const passwordCount = passwordColors.get(color) || 0;
            wrongPosition += Math.min(count, passwordCount);
        }
        
        const wrong = 4 - correct - wrongPosition;
        
        return { correct, wrongPosition, wrong };
    }
    
    // 提交猜测
    submitGuess() {
        if (this.gameOver) return;
        
        // 检查当前猜测是否完整
        if (this.currentGuess.some(color => color === null)) {
            this.showMessage('请完成所有4个位置的颜色选择！', 'error');
            return;
        }
        
        // 检查是否重复猜测
        const isDuplicate = this.guesses.some(g => 
            !g.isHint && this.arraysEqual(g.colors, this.currentGuess)
        );
        
        if (isDuplicate) {
            this.showMessage('你已经猜过这个组合了！', 'error');
            return;
        }
        
        // 添加猜测
        this.guesses.push({
            colors: [...this.currentGuess],
            feedback: this.calculateFeedback(this.currentGuess),
            isHint: false
        });
        
        this.currentAttempts++;
        
        // 检查是否获胜
        if (this.arraysEqual(this.currentGuess, this.password)) {
            this.gameWon = true;
            this.gameOver = true;
            this.showGameOverModal(true);
        } else if (this.currentAttempts >= this.maxAttempts) {
            this.gameOver = true;
            this.showGameOverModal(false);
        }
        
        // 清空当前猜测
        this.clearCurrentGuess();
        
        // 更新UI
        this.updateGameInfo();
        this.renderGuesses();
    }
    
    // 清空当前猜测
    clearCurrentGuess() {
        this.currentGuess = [null, null, null, null];
        this.selectedSlot = 0;
        this.renderCurrentGuess();
        this.updateSubmitButton();
    }
    
    // 选择颜色
    selectColor(colorIndex) {
        if (this.gameOver) return;
        
        this.currentGuess[this.selectedSlot] = colorIndex;
        
        // 自动移动到下一个空位置
        for (let i = 0; i < 4; i++) {
            if (this.currentGuess[i] === null) {
                this.selectedSlot = i;
                break;
            }
        }
        
        this.renderCurrentGuess();
        this.updateSubmitButton();
    }
    
    // 选择位置
    selectSlot(slotIndex) {
        if (this.gameOver) return;
        this.selectedSlot = slotIndex;
        this.renderCurrentGuess();
    }
    
    // 渲染颜色选择调色板
    renderColorSelectionPalette() {
        const palette = document.getElementById('color-selection-palette');
        palette.innerHTML = '';
        
        for (let i = 0; i < this.colorPoolSize; i++) {
            const colorBtn = document.createElement('div');
            colorBtn.className = 'color-selection-btn';
            colorBtn.style.backgroundColor = this.colors[i].hex;
            colorBtn.dataset.colorIndex = i;
            
            const colorNumber = document.createElement('div');
            colorNumber.className = 'color-number';
            colorNumber.textContent = i + 1;
            
            colorBtn.appendChild(colorNumber);
            
            // 添加点击事件
            colorBtn.addEventListener('click', () => {
                this.selectColor(i);
            });
            
            palette.appendChild(colorBtn);
        }
    }
    
    // 渲染当前猜测
    renderCurrentGuess() {
        const slots = document.querySelectorAll('.guess-slot');
        
        slots.forEach((slot, index) => {
            const placeholder = slot.querySelector('.slot-placeholder');
            const colorBlock = slot.querySelector('.color-block');
            
            // 移除旧的选中状态
            slot.classList.remove('selected');
            
            if (this.currentGuess[index] !== null) {
                // 显示颜色
                placeholder.style.display = 'none';
                if (!colorBlock) {
                    const newColorBlock = document.createElement('div');
                    newColorBlock.className = 'color-block';
                    slot.appendChild(newColorBlock);
                }
                slot.querySelector('.color-block').style.backgroundColor = this.colors[this.currentGuess[index]].hex;
            } else {
                // 显示占位符
                placeholder.style.display = 'flex';
                if (colorBlock) {
                    colorBlock.remove();
                }
            }
            
            // 标记当前选中的位置
            if (index === this.selectedSlot) {
                slot.classList.add('selected');
            }
            
            // 添加点击事件来选择位置
            slot.addEventListener('click', () => {
                this.selectSlot(index);
            });
        });
    }
    
    // 更新提交按钮状态
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-guess');
        const isComplete = this.currentGuess.every(color => color !== null);
        submitBtn.disabled = !isComplete || this.gameOver;
    }
    
    // 显示游戏容器
    showGameContainer() {
        document.getElementById('mode-selection').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
    }
    
    // 显示模式选择
    showModeSelection() {
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('mode-selection').classList.remove('hidden');
    }
    
    // 更新游戏信息
    updateGameInfo() {
        document.getElementById('current-mode').textContent = 
            this.isHardMode ? '困难模式' : '简单模式';
        document.getElementById('remaining-attempts').textContent = 
            this.maxAttempts - this.currentAttempts;
    }
    
    // 渲染颜色调色板
    renderColorPalette() {
        const palette = document.getElementById('color-palette');
        palette.innerHTML = '';
        
        for (let i = 0; i < this.colorPoolSize; i++) {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = this.colors[i].hex;
            
            const colorNumber = document.createElement('div');
            colorNumber.className = 'color-number';
            colorNumber.textContent = i + 1;
            
            colorItem.appendChild(colorBlock);
            colorItem.appendChild(colorNumber);
            palette.appendChild(colorItem);
        }
    }
    
    // 渲染猜测结果
    renderGuesses() {
        const container = document.getElementById('guesses-container');
        container.innerHTML = '';
        
        this.guesses.forEach((guess, index) => {
            const row = document.createElement('div');
            row.className = 'guess-row';
            
            // 猜测编号
            const number = document.createElement('div');
            number.className = 'guess-number';
            number.textContent = `猜测 ${index + 1}`;
            
            // 颜色方块
            const colors = document.createElement('div');
            colors.className = 'guess-colors';
            
            guess.colors.forEach(colorIndex => {
                const colorBlock = document.createElement('div');
                colorBlock.className = 'guess-color';
                colorBlock.style.backgroundColor = this.colors[colorIndex].hex;
                colors.appendChild(colorBlock);
            });
            
            // 反馈
            const feedback = document.createElement('div');
            feedback.className = 'feedback';
            
            if (this.isHardMode) {
                const { correct, wrongPosition, wrong } = guess.feedback;
                
                for (let i = 0; i < correct; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'feedback-dot correct';
                    feedback.appendChild(dot);
                }
                
                for (let i = 0; i < wrongPosition; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'feedback-dot wrong-position';
                    feedback.appendChild(dot);
                }
                
                for (let i = 0; i < wrong; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'feedback-dot wrong';
                    feedback.appendChild(dot);
                }
            } else {
                guess.feedback.forEach(fb => {
                    const dot = document.createElement('div');
                    dot.className = `feedback-dot ${fb}`;
                    feedback.appendChild(dot);
                });
            }
            
            row.appendChild(number);
            row.appendChild(colors);
            row.appendChild(feedback);
            container.appendChild(row);
        });
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    }
    
    // 切换游戏规则显示
    toggleRules() {
        const rulesContent = document.getElementById('rules-content');
        rulesContent.classList.toggle('hidden');
    }
    
    // 显示游戏结束模态框
    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const icon = document.getElementById('modal-icon');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const passwordDisplay = document.getElementById('correct-password');
        
        if (won) {
            icon.textContent = '🎉';
            title.textContent = '恭喜！';
            message.textContent = '你成功破解了密码！';
        } else {
            icon.textContent = '😔';
            title.textContent = '游戏结束';
            message.textContent = '很遗憾，你没有在限定次数内破解密码。';
        }
        
        // 显示正确密码
        passwordDisplay.innerHTML = '';
        this.password.forEach(colorIndex => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = this.colors[colorIndex].hex;
            passwordDisplay.appendChild(colorBlock);
        });
        
        modal.classList.remove('hidden');
    }
    
    // 关闭模态框
    closeModal() {
        document.getElementById('game-over-modal').classList.add('hidden');
    }
    
    // 显示消息
    showMessage(text, type = 'info') {
        // 创建临时消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#D32F2F' : '#4CAF50'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
    
    // 工具方法：比较两个数组是否相等
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new PasswordPuzzleGame();
});
