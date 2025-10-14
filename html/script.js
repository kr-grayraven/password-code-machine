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
            { name: '樱花粉', hex: '#ff9a9e' },
            { name: '薰衣草紫', hex: '#a8edea' },
            { name: '天空蓝', hex: '#fed6e3' },
            { name: '珊瑚橙', hex: '#ffecd2' },
            { name: '薄荷绿', hex: '#fcb69f' },
            { name: '紫罗兰', hex: '#d299c2' },
            { name: '天青色', hex: '#89f7fe' }
        ];
        
        this.initializeEventListeners();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 模式选择按钮
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.playModeSelectionEffect(e.currentTarget, mode);
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
            this.toggleFloatingRules();
        });
        
        // 关闭浮动规则窗口
        document.getElementById('close-rules-btn').addEventListener('click', () => {
            this.hideFloatingRules();
        });
        
        // 关于信息切换
        document.getElementById('about-toggle').addEventListener('click', () => {
            this.toggleFloatingAbout();
        });
        
        // 关闭浮动关于信息窗口
        document.getElementById('close-about-btn').addEventListener('click', () => {
            this.hideFloatingAbout();
        });
        
        // 点击浮动窗口外部关闭
        document.getElementById('floating-rules-window').addEventListener('click', (e) => {
            if (e.target.id === 'floating-rules-window') {
                this.hideFloatingRules();
            }
        });
        
        // 点击关于信息窗口外部关闭
        document.getElementById('floating-about-window').addEventListener('click', (e) => {
            if (e.target.id === 'floating-about-window') {
                this.hideFloatingAbout();
            }
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
    
    // 播放模式选择特效
    playModeSelectionEffect(button, mode) {
        // 禁用按钮防止重复点击
        button.disabled = true;
        
        // 添加点击特效
        this.createMagicParticles(button, mode);
        
        // 播放按钮动画
        button.style.animation = 'modeSelectionMagic 1.2s ease-in-out';
        
        // 显示魔法消息
        const modeText = mode === 'easy' ? '魔法新手' : '魔法大师';
        this.showMessage(`✨ 欢迎来到${modeText}的世界！✨`, 'success');
        
        // 延迟启动游戏，让特效完成
        setTimeout(() => {
            this.startGame(mode);
            button.disabled = false;
            button.style.animation = '';
        }, 1200);
    }
    
    // 创建魔法粒子特效
    createMagicParticles(button, mode) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建多个粒子
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'magic-particle';
            
            // 随机位置和角度
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 8px;
                height: 8px;
                background: ${mode === 'easy' ? '#ff9a9e' : '#ff6b9d'};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 0 10px ${mode === 'easy' ? '#ff9a9e' : '#ff6b9d'};
                animation: magicParticleFly 1.2s ease-out forwards;
                --target-x: ${x}px;
                --target-y: ${y}px;
            `;
            
            document.body.appendChild(particle);
            
            // 清理粒子
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1200);
        }
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
            this.showMessage('请完成所有4个位置的魔法色彩选择！', 'error');
            return;
        }
        
        // 检查是否重复猜测
        const isDuplicate = this.guesses.some(g => 
            !g.isHint && this.arraysEqual(g.colors, this.currentGuess)
        );
        
        if (isDuplicate) {
            this.showMessage('你已经尝试过这个魔法组合了！', 'error');
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
        // 检查是否有颜色需要清空
        const hasColors = this.currentGuess.some(color => color !== null);
        
        if (!hasColors) {
            this.showMessage('当前没有魔法色彩需要重新组合！', 'info');
            return;
        }
        
        // 添加清空特效
        this.playClearEffect();
        
        this.currentGuess = [null, null, null, null];
        this.selectedSlot = 0;
        this.renderCurrentGuess();
        this.updateSubmitButton();
        
        this.showMessage('魔法组合已重新整理！', 'success');
    }
    
    // 播放清空特效
    playClearEffect() {
        const slots = document.querySelectorAll('.guess-slot');
        
        slots.forEach((slot, index) => {
            if (this.currentGuess[index] !== null) {
                // 添加闪烁效果
                slot.style.animation = 'clearFlash 0.6s ease-in-out';
                
                // 延迟移除动画
                setTimeout(() => {
                    slot.style.animation = '';
                }, 600);
            }
        });
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
        const modeSelection = document.getElementById('mode-selection');
        const gameContainer = document.getElementById('game-container');
        
        // 先隐藏模式选择，然后显示游戏容器
        modeSelection.classList.add('fade-out-down');
        
        setTimeout(() => {
            modeSelection.classList.add('hidden');
            modeSelection.classList.remove('fade-out-down');
            
            gameContainer.classList.remove('hidden');
            gameContainer.classList.add('slide-in-right');
            
            // 清理动画类
            setTimeout(() => {
                gameContainer.classList.remove('slide-in-right');
            }, 600);
        }, 400);
    }
    
    // 显示模式选择
    showModeSelection() {
        const gameContainer = document.getElementById('game-container');
        const modeSelection = document.getElementById('mode-selection');
        
        // 先隐藏游戏容器，然后显示模式选择
        gameContainer.classList.add('slide-out-left');
        
        setTimeout(() => {
            gameContainer.classList.add('hidden');
            gameContainer.classList.remove('slide-out-left');
            
            modeSelection.classList.remove('hidden');
            modeSelection.classList.add('fade-in-up');
            
            // 清理动画类
            setTimeout(() => {
                modeSelection.classList.remove('fade-in-up');
            }, 600);
        }, 400);
    }
    
    // 更新游戏信息
    updateGameInfo() {
        document.getElementById('current-mode').textContent = 
            this.isHardMode ? '魔法大师' : '魔法新手';
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
            number.textContent = `魔法 ${index + 1}`;
            
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
        
        // 滚动到底部 - 使用平滑滚动
        setTimeout(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
            
            // 检查是否需要显示滚动提示
            this.updateScrollIndicator(container);
        }, 100);
    }
    
    // 更新滚动指示器
    updateScrollIndicator(container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        if (isScrollable) {
            container.classList.add('scrollable');
        } else {
            container.classList.remove('scrollable');
        }
    }
    
    // 切换浮动规则窗口
    toggleFloatingRules() {
        const floatingWindow = document.getElementById('floating-rules-window');
        const rulesToggle = document.getElementById('rules-toggle');
        
        if (floatingWindow.classList.contains('hidden')) {
            this.showFloatingRules();
        } else {
            this.hideFloatingRules();
        }
    }
    
    // 显示浮动规则窗口
    showFloatingRules() {
        const floatingWindow = document.getElementById('floating-rules-window');
        const rulesToggle = document.getElementById('rules-toggle');
        
        floatingWindow.classList.remove('hidden');
        floatingWindow.classList.add('slide-in-from-bottom-right');
        
        // 更新按钮文本
        rulesToggle.textContent = '📜 关闭规则';
        
        // 清理动画类
        setTimeout(() => {
            floatingWindow.classList.remove('slide-in-from-bottom-right');
        }, 600);
    }
    
    // 隐藏浮动规则窗口
    hideFloatingRules() {
        const floatingWindow = document.getElementById('floating-rules-window');
        const rulesToggle = document.getElementById('rules-toggle');
        
        floatingWindow.classList.add('slide-out-to-bottom-right');
        
        // 更新按钮文本
        rulesToggle.textContent = '📜 魔法规则';
        
        setTimeout(() => {
            floatingWindow.classList.add('hidden');
            floatingWindow.classList.remove('slide-out-to-bottom-right');
        }, 600);
    }
    
    // 切换浮动关于信息窗口
    toggleFloatingAbout() {
        const floatingWindow = document.getElementById('floating-about-window');
        const aboutToggle = document.getElementById('about-toggle');
        
        if (floatingWindow.classList.contains('hidden')) {
            this.showFloatingAbout();
        } else {
            this.hideFloatingAbout();
        }
    }
    
    // 显示浮动关于信息窗口
    showFloatingAbout() {
        const floatingWindow = document.getElementById('floating-about-window');
        const aboutToggle = document.getElementById('about-toggle');
        
        floatingWindow.classList.remove('hidden');
        floatingWindow.classList.add('slide-in-from-bottom-right');
        
        // 更新按钮文本
        aboutToggle.textContent = 'ℹ️ 关闭关于';
        
        // 清理动画类
        setTimeout(() => {
            floatingWindow.classList.remove('slide-in-from-bottom-right');
        }, 600);
    }
    
    // 隐藏浮动关于信息窗口
    hideFloatingAbout() {
        const floatingWindow = document.getElementById('floating-about-window');
        const aboutToggle = document.getElementById('about-toggle');
        
        floatingWindow.classList.add('slide-out-to-bottom-right');
        
        // 更新按钮文本
        aboutToggle.textContent = 'ℹ️ 关于信息';
        
        setTimeout(() => {
            floatingWindow.classList.add('hidden');
            floatingWindow.classList.remove('slide-out-to-bottom-right');
        }, 600);
    }
    
    // 显示游戏结束模态框
    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const icon = document.getElementById('modal-icon');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        const passwordDisplay = document.getElementById('correct-password');
        
        if (won) {
            icon.textContent = '✨';
            title.textContent = '魔法成功！';
            message.textContent = '你成功破解了魔法密码！';
        } else {
            icon.textContent = '😔';
            title.textContent = '魔法失败';
            message.textContent = '很遗憾，你没有在限定次数内破解魔法密码。';
        }
        
        // 显示正确密码
        passwordDisplay.innerHTML = '';
        this.password.forEach(colorIndex => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = this.colors[colorIndex].hex;
            passwordDisplay.appendChild(colorBlock);
        });
        
        // 显示模态框并添加转场特效
        modal.classList.remove('hidden');
        modal.classList.add('modal-fade-in');
        
        // 清理动画类
        setTimeout(() => {
            modal.classList.remove('modal-fade-in');
        }, 400);
    }
    
    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('game-over-modal');
        
        // 添加关闭动画
        modal.classList.add('modal-fade-out');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-fade-out');
        }, 300);
    }
    
    // 显示消息
    showMessage(text, type = 'info') {
        // 创建临时消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.textContent = text;
        
        // 根据类型设置不同的样式
        let bgColor, icon;
        switch(type) {
            case 'error':
                bgColor = '#D32F2F';
                icon = '❌';
                break;
            case 'success':
                bgColor = '#4CAF50';
                icon = '✅';
                break;
            case 'info':
                bgColor = '#2196F3';
                icon = 'ℹ️';
                break;
            default:
                bgColor = '#4CAF50';
                icon = '✅';
        }
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // 添加图标
        const iconSpan = document.createElement('span');
        iconSpan.textContent = icon;
        messageDiv.insertBefore(iconSpan, messageDiv.firstChild);
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
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
