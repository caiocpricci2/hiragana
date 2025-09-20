// On-screen keyboard for hiragana practice
class OnScreenKeyboard {
    constructor() {
        this.keys = [
            // Alphabetical layout with backspace in position 9
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'BACKSPACE'],
            ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q'],
            ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        ];
        this.currentInput = '';
        this.targetAnswer = '';
        this.onCorrectCallback = null;
        this.onInputChangeCallback = null;
    }

    render(containerId) {
        const container = document.getElementById(containerId);

        let keyboardHTML = '<div class="keyboard-container">';

        // Input display
        keyboardHTML += `
            <div class="typing-input-display" id="typing-display">
                <span id="typed-text"></span>
                <span class="cursor">|</span>
            </div>
            <div class="target-display" id="target-display" style="font-size: 12px; color: #666; margin-bottom: 10px; text-align: center; display: ${window.debugMode ? 'block' : 'none'};">
                Target: <span id="target-text"></span>
            </div>
        `;

        // Keyboard rows
        this.keys.forEach((row, rowIndex) => {
            keyboardHTML += `<div class="keyboard-row">`;

            row.forEach(key => {
                if (key === 'BACKSPACE') {
                    keyboardHTML += `
                        <button class="keyboard-key key-backspace" onclick="keyboard.backspace()">
                            ⌫
                        </button>
                    `;
                } else {
                    keyboardHTML += `
                        <button class="keyboard-key" onclick="keyboard.typeKey('${key}')" data-key="${key}">
                            ${key.toUpperCase()}
                        </button>
                    `;
                }
            });

            keyboardHTML += '</div>';
        });


        keyboardHTML += '</div>';

        container.innerHTML = keyboardHTML;
        this.updateDisplay();
    }

    typeKey(key) {
        this.currentInput += key.toLowerCase();
        this.updateDisplay();
        this.checkAnswer();

        if (this.onInputChangeCallback) {
            this.onInputChangeCallback(this.currentInput);
        }
    }

    backspace() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateDisplay();

            if (this.onInputChangeCallback) {
                this.onInputChangeCallback(this.currentInput);
            }
        }
    }

    clear() {
        this.currentInput = '';
        this.updateDisplay();

        if (this.onInputChangeCallback) {
            this.onInputChangeCallback(this.currentInput);
        }
    }


    updateDisplay() {
        const typedTextElement = document.getElementById('typed-text');
        if (typedTextElement) {
            typedTextElement.textContent = this.currentInput;
        }

        const targetTextElement = document.getElementById('target-text');
        if (targetTextElement) {
            targetTextElement.textContent = this.targetAnswer;
        }
    }

    updateDebugDisplay() {
        const targetDisplay = document.getElementById('target-display');
        if (targetDisplay) {
            targetDisplay.style.display = window.debugMode ? 'block' : 'none';
        }
    }

    setTargetAnswer(answer) {
        this.targetAnswer = answer.toLowerCase();
        this.currentInput = '';
        this.onCorrectCallback = null; // Clear previous callback
        this.updateDisplay();
    }

    checkAnswer() {
        // Check if we have a complete match
        if (this.currentInput === this.targetAnswer) {
            // Correct answer
            if (this.onCorrectCallback) {
                this.onCorrectCallback();
            }
            return;
        }
    }

    showFeedback(isCorrect) {
        const display = document.getElementById('typing-display');
        if (display) {
            display.classList.remove('correct', 'incorrect');
            display.classList.add(isCorrect ? 'correct' : 'incorrect');

            setTimeout(() => {
                display.classList.remove('correct', 'incorrect');
            }, 1000);
        }
    }

    setOnCorrectCallback(callback) {
        this.onCorrectCallback = callback;
    }

    setOnInputChangeCallback(callback) {
        this.onInputChangeCallback = callback;
    }

    reset() {
        this.currentInput = '';
        this.targetAnswer = '';
        this.updateDisplay();
    }

    hide() {
        const container = document.querySelector('.keyboard-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    show() {
        const container = document.querySelector('.keyboard-container');
        if (container) {
            container.style.display = 'block';
        }
    }
}

// Global keyboard instance
let keyboard = new OnScreenKeyboard();

// Physical keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    // Handle letter keys
    if (key.match(/^[a-z]$/)) {
        event.preventDefault();
        keyboard.typeKey(key);
    }
    // Handle backspace
    else if (key === 'backspace') {
        event.preventDefault();
        keyboard.backspace();
    }
});