// Hiragana data organized by learning order
const hiraganaData = [
    {
        group: "Vowels",
        letters: [
            { hiragana: "あ", romaji: "a" },
            { hiragana: "い", romaji: "i" },
            { hiragana: "う", romaji: "u" },
            { hiragana: "え", romaji: "e" },
            { hiragana: "お", romaji: "o" }
        ]
    },
    {
        group: "K-sounds",
        letters: [
            { hiragana: "か", romaji: "ka" },
            { hiragana: "き", romaji: "ki" },
            { hiragana: "く", romaji: "ku" },
            { hiragana: "け", romaji: "ke" },
            { hiragana: "こ", romaji: "ko" }
        ]
    },
    {
        group: "S-sounds",
        letters: [
            { hiragana: "さ", romaji: "sa" },
            { hiragana: "し", romaji: "shi" },
            { hiragana: "す", romaji: "su" },
            { hiragana: "せ", romaji: "se" },
            { hiragana: "そ", romaji: "so" }
        ]
    },
    {
        group: "T-sounds",
        letters: [
            { hiragana: "た", romaji: "ta" },
            { hiragana: "ち", romaji: "chi" },
            { hiragana: "つ", romaji: "tsu" },
            { hiragana: "て", romaji: "te" },
            { hiragana: "と", romaji: "to" }
        ]
    },
    {
        group: "N-sounds",
        letters: [
            { hiragana: "な", romaji: "na" },
            { hiragana: "に", romaji: "ni" },
            { hiragana: "ぬ", romaji: "nu" },
            { hiragana: "ね", romaji: "ne" },
            { hiragana: "の", romaji: "no" }
        ]
    },
    {
        group: "H-sounds",
        letters: [
            { hiragana: "は", romaji: "ha" },
            { hiragana: "ひ", romaji: "hi" },
            { hiragana: "ふ", romaji: "fu" },
            { hiragana: "へ", romaji: "he" },
            { hiragana: "ほ", romaji: "ho" }
        ]
    },
    {
        group: "M-sounds",
        letters: [
            { hiragana: "ま", romaji: "ma" },
            { hiragana: "み", romaji: "mi" },
            { hiragana: "む", romaji: "mu" },
            { hiragana: "め", romaji: "me" },
            { hiragana: "も", romaji: "mo" }
        ]
    },
    {
        group: "Y-sounds",
        letters: [
            { hiragana: "や", romaji: "ya" },
            { hiragana: "ゆ", romaji: "yu" },
            { hiragana: "よ", romaji: "yo" }
        ]
    },
    {
        group: "R-sounds",
        letters: [
            { hiragana: "ら", romaji: "ra" },
            { hiragana: "り", romaji: "ri" },
            { hiragana: "る", romaji: "ru" },
            { hiragana: "れ", romaji: "re" },
            { hiragana: "ろ", romaji: "ro" }
        ]
    },
    {
        group: "W-sounds & N",
        letters: [
            { hiragana: "わ", romaji: "wa" },
            { hiragana: "ゐ", romaji: "wi" },
            { hiragana: "ゑ", romaji: "we" },
            { hiragana: "を", romaji: "wo" },
            { hiragana: "ん", romaji: "n" }
        ]
    }
];

let selectedLetters = new Set();
let currentLetterIndex = 0;
let currentWordIndex = 0;
let showingAnswer = false;
let randomSeed = 50;
let shuffledLetters = [];
let shuffledWords = [];

// Reusable FlashcardManager class
class FlashcardManager {
    constructor(config) {
        this.containerId = config.containerId;
        this.type = config.type; // 'letter' or 'word'
        this.currentIndex = 0;
        this.shuffledItems = [];
        this.getItemsFunction = config.getItemsFunction;
        this.noItemsMessage = config.noItemsMessage;
        this.displayConfig = config.displayConfig;
        this.wrongSelections = new Set(); // Track wrong selections for current card
    }

    updateItems(seed) {
        const availableItems = this.getItemsFunction();
        this.shuffledItems = shuffleArray(availableItems, seed + (this.type === 'word' ? 1000 : 0));
        this.currentIndex = 0;
    }

    getCurrentItem() {
        if (this.shuffledItems.length === 0) return null;
        if (this.currentIndex >= this.shuffledItems.length) {
            this.currentIndex = 0;
        }
        return this.shuffledItems[this.currentIndex];
    }

    renderFlashcard() {
        const container = document.getElementById(this.containerId);

        if (this.shuffledItems.length === 0) {
            container.innerHTML = `<div class="no-letters-message">${this.noItemsMessage}</div>`;
            return;
        }

        const item = this.getCurrentItem();
        if (!item) return;

        // Clear wrong selections when showing a new card
        this.wrongSelections.clear();
        showingAnswer = false;

        const displayText = this.displayConfig.getDisplayText(item);
        const answerText = this.displayConfig.getAnswerText(item);
        const displayClass = this.displayConfig.displayClass;

        const showAnswerFn = this.type === 'letter' ? 'showLetterAnswer' : 'showWordAnswer';
        const showMultipleChoiceFn = this.type === 'letter' ? 'showMultipleChoice' : 'showWordMultipleChoice';
        const nextFn = this.type === 'letter' ? 'nextLetter' : 'nextWord';

        container.innerHTML = `
            <div class="${displayClass}">${displayText}</div>
            <div class="flashcard-romaji" id="${this.type}-answer">${answerText}</div>
            <div class="flashcard-buttons">
                <button class="btn btn-primary" onclick="${showAnswerFn}()">Show Answer</button>
                <button class="btn btn-secondary" onclick="${showMultipleChoiceFn}()">Multiple Choice</button>
                <button class="btn btn-secondary" onclick="${nextFn}()">Next</button>
            </div>
        `;
    }

    showAnswer() {
        document.getElementById(`${this.type}-answer`).classList.add('show');
        showingAnswer = true;
    }

    showMultipleChoice() {
        const container = document.getElementById(this.containerId);
        const currentItem = this.getCurrentItem();
        if (!currentItem) return;

        const choices = this.generateMultipleChoices(currentItem);
        const correctAnswer = this.displayConfig.getCorrectAnswer(currentItem);

        const selectChoiceFn = this.type === 'letter' ? 'selectChoice' : 'selectWordChoice';

        let choicesHTML = '';
        choices.forEach((choice, index) => {
            const isWrongChoice = this.wrongSelections.has(choice);
            const disabledAttr = isWrongChoice ? 'disabled' : '';
            const disabledClass = isWrongChoice ? 'disabled-wrong' : '';

            choicesHTML += `
                <button class="choice-btn ${disabledClass}" ${disabledAttr} onclick="${selectChoiceFn}('${choice.replace(/'/g, "\\'")}', '${correctAnswer.replace(/'/g, "\\'")}', ${index})" id="choice-${index}">
                    ${choice}
                </button>
            `;
        });

        const displayText = this.displayConfig.getDisplayText(currentItem);
        const displayClass = this.displayConfig.displayClass;

        container.innerHTML = `
            <div class="progress-bar-container" id="progress-container" style="display: none;">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            <div class="${displayClass}">${displayText}</div>
            <div class="multiple-choice-container">
                <div class="choices-grid">
                    ${choicesHTML}
                </div>
                <div class="choice-feedback" id="choice-feedback"></div>
                <div class="choice-buttons">
                    <button class="btn btn-secondary" onclick="${this.type === 'letter' ? 'updateLetterFlashcard' : 'updateWordFlashcard'}()" id="back-btn">Back</button>
                </div>
            </div>
        `;
    }

    generateMultipleChoices(correctItem) {
        const allItems = this.getItemsFunction();
        const wrongChoices = [];
        const correctAnswer = this.displayConfig.getCorrectAnswer(correctItem);

        // Get 9 random wrong answers
        while (wrongChoices.length < 9 && wrongChoices.length < allItems.length - 1) {
            const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
            const randomAnswer = this.displayConfig.getCorrectAnswer(randomItem);
            if (randomAnswer !== correctAnswer && !wrongChoices.includes(randomAnswer)) {
                wrongChoices.push(randomAnswer);
            }
        }

        // Add the correct answer
        const allChoices = [...wrongChoices, correctAnswer];

        // Shuffle the choices
        return shuffleArray(allChoices, Math.random() * 1000);
    }

    selectChoice(selectedChoice, correctAnswer, choiceIndex) {
        const feedbackDiv = document.getElementById('choice-feedback');
        const choiceBtn = document.getElementById(`choice-${choiceIndex}`);

        if (selectedChoice === correctAnswer) {
            // Correct answer - disable all buttons
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.disabled = true;
            });

            choiceBtn.classList.add('correct');
            feedbackDiv.innerHTML = '<div class="feedback correct-feedback">✓ Correct!</div>';

            // Show and animate progress bar
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress-bar');

            progressContainer.style.display = 'block';

            // Small delay to ensure the progress bar is visible before animation
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 50);

            // Auto-advance to next card after progress bar completes
            setTimeout(() => {
                this.transitionToNext();
            }, 800);
        } else {
            // Wrong answer - add to wrong selections set and disable permanently
            this.wrongSelections.add(selectedChoice);
            choiceBtn.disabled = true;
            choiceBtn.classList.add('incorrect', 'disabled-wrong');
            feedbackDiv.innerHTML = '<div class="feedback incorrect-feedback">✗ Try again!</div>';

            // Clear feedback after short delay but keep button disabled
            setTimeout(() => {
                feedbackDiv.innerHTML = '';
            }, 400);
        }
    }

    transitionToNext() {
        const container = document.getElementById(this.containerId);

        // Add fade out effect
        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            // Move to next card
            this.currentIndex = (this.currentIndex + 1) % this.shuffledItems.length;
            this.renderFlashcard();

            // Add fade in effect
            container.style.opacity = '0';
            container.style.transform = 'translateY(10px)';

            setTimeout(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    next() {
        this.transitionToNext();
    }
}

// Create manager instances
let letterManager;
let wordManager;

// Initialize app
function init() {
    loadSelectedLetters();
    // Generate random seed on app open
    randomSeed = Math.floor(Math.random() * 999) + 1;
    document.getElementById('seed-input').value = randomSeed;
    saveSeed();

    if (selectedLetters.size === 0) {
        selectFirst15Letters();
    }

    // Initialize flashcard managers
    letterManager = new FlashcardManager({
        containerId: 'letter-flashcard',
        type: 'letter',
        getItemsFunction: getAvailableLetters,
        noItemsMessage: 'Select some letters in the Configuration tab to start practicing!',
        displayConfig: {
            displayClass: 'flashcard-char',
            getDisplayText: (item) => item.hiragana,
            getAnswerText: (item) => item.romaji,
            getCorrectAnswer: (item) => item.romaji
        }
    });

    wordManager = new FlashcardManager({
        containerId: 'word-flashcard',
        type: 'word',
        getItemsFunction: getAvailableWords,
        noItemsMessage: 'Select some letters in the Configuration tab to start practicing words!',
        displayConfig: {
            displayClass: 'word-reading',
            getDisplayText: (item) => `${item.hiragana}<div class="word-translation">${item.meaning}</div>`,
            getAnswerText: (item) => `${item.romaji} (${item.meaning})`,
            getCorrectAnswer: (item) => item.romaji
        }
    });

    renderHiraganaGroups();
    updateFlashcards();
}

// Pre-select first 15 letters by default
function selectFirst15Letters() {
    let count = 0;
    for (const group of hiraganaData) {
        for (const letter of group.letters) {
            if (count < 15) {
                selectedLetters.add(letter.hiragana);
                count++;
            } else {
                break;
            }
        }
        if (count >= 15) break;
    }
    saveSelectedLetters();
}

// Local storage functions
function saveSelectedLetters() {
    localStorage.setItem('selectedLetters', JSON.stringify([...selectedLetters]));
}

function loadSelectedLetters() {
    const saved = localStorage.getItem('selectedLetters');
    if (saved) {
        selectedLetters = new Set(JSON.parse(saved));
    }
}

// Seed management functions
function saveSeed() {
    localStorage.setItem('randomSeed', randomSeed.toString());
}

function loadSeed() {
    const saved = localStorage.getItem('randomSeed');
    if (saved) {
        randomSeed = parseInt(saved);
        document.getElementById('seed-input').value = randomSeed;
    }
}

function updateSeed() {
    const input = document.getElementById('seed-input');
    randomSeed = parseInt(input.value) || 50;
    saveSeed();
    updateFlashcards();
}

function randomizeSeed() {
    randomSeed = Math.floor(Math.random() * 999) + 1;
    document.getElementById('seed-input').value = randomSeed;
    saveSeed();
    updateFlashcards();
}

// Seeded random number generator
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Shuffle array using seeded randomization
function shuffleArray(array, seed) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById(`${tab}-screen`).classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'letter' || tab === 'word') {
        updateFlashcards();
    }
}

// Configuration functions
function renderHiraganaGroups() {
    const container = document.getElementById('hiragana-groups');
    container.innerHTML = '';

    hiraganaData.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'hiragana-group';
        
        const header = document.createElement('div');
        header.className = 'group-header';
        
        const title = document.createElement('h3');
        title.className = 'group-title';
        title.textContent = group.group;
        
        const selectBtn = document.createElement('button');
        selectBtn.className = 'select-row-btn';
        updateGroupButtonState(group, selectBtn);
        selectBtn.onclick = () => toggleGroupSelection(group, selectBtn);
        
        header.appendChild(title);
        header.appendChild(selectBtn);
        groupDiv.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'hiragana-grid';

        group.letters.forEach(letter => {
            const card = document.createElement('div');
            card.className = 'hiragana-card';
            if (selectedLetters.has(letter.hiragana)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="hiragana-char">${letter.hiragana}</div>
                <div class="romaji">${letter.romaji}</div>
            `;

            card.onclick = () => {
                toggleLetter(letter.hiragana, card);
                updateGroupButtonState(group, selectBtn);
            };
            grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        container.appendChild(groupDiv);
    });
}

function toggleGroupSelection(group, button) {
    const allSelected = group.letters.every(letter => selectedLetters.has(letter.hiragana));
    
    if (allSelected) {
        // Deselect all letters in this group
        group.letters.forEach(letter => {
            selectedLetters.delete(letter.hiragana);
        });
    } else {
        // Select all letters in this group
        group.letters.forEach(letter => {
            selectedLetters.add(letter.hiragana);
        });
    }
    
    saveSelectedLetters();
    renderHiraganaGroups();
}

function updateGroupButtonState(group, button) {
    const allSelected = group.letters.every(letter => selectedLetters.has(letter.hiragana));
    const noneSelected = group.letters.every(letter => !selectedLetters.has(letter.hiragana));
    
    if (allSelected) {
        button.textContent = 'Deselect';
        button.classList.add('all-selected');
    } else if (noneSelected) {
        button.textContent = 'Select All';
        button.classList.remove('all-selected');
    } else {
        button.textContent = 'Select All';
        button.classList.remove('all-selected');
    }
}

function toggleLetter(hiragana, card) {
    if (selectedLetters.has(hiragana)) {
        selectedLetters.delete(hiragana);
        card.classList.remove('selected');
    } else {
        selectedLetters.add(hiragana);
        card.classList.add('selected');
    }
    saveSelectedLetters();
}

function selectAll() {
    selectedLetters.clear();
    hiraganaData.forEach(group => {
        group.letters.forEach(letter => {
            selectedLetters.add(letter.hiragana);
        });
    });
    saveSelectedLetters();
    renderHiraganaGroups();
}

function clearAll() {
    selectedLetters.clear();
    saveSelectedLetters();
    renderHiraganaGroups();
}

// Flashcard functions
function updateFlashcards() {
    if (letterManager && wordManager) {
        letterManager.updateItems(randomSeed);
        wordManager.updateItems(randomSeed);
        letterManager.renderFlashcard();
        wordManager.renderFlashcard();
    }
}

// Legacy wrapper functions for backward compatibility
function updateLetterFlashcard() {
    if (letterManager) letterManager.renderFlashcard();
}

function updateWordFlashcard() {
    if (wordManager) wordManager.renderFlashcard();
}

function getAvailableLetters() {
    const available = [];
    hiraganaData.forEach(group => {
        group.letters.forEach(letter => {
            if (selectedLetters.has(letter.hiragana)) {
                available.push(letter);
            }
        });
    });
    return available;
}

function getAvailableWords() {
    return hiraganaWords.filter(word => {
        return [...word.hiragana].every(char => selectedLetters.has(char));
    });
}

// Legacy wrapper functions for backward compatibility
function showLetterAnswer() {
    if (letterManager) letterManager.showAnswer();
}

function showWordAnswer() {
    if (wordManager) wordManager.showAnswer();
}

function nextLetter() {
    if (letterManager) letterManager.next();
}

function nextWord() {
    if (wordManager) wordManager.next();
}

function showMultipleChoice() {
    if (letterManager) letterManager.showMultipleChoice();
}

function showWordMultipleChoice() {
    if (wordManager) wordManager.showMultipleChoice();
}

function selectChoice(selectedChoice, correctAnswer, choiceIndex) {
    if (letterManager) letterManager.selectChoice(selectedChoice, correctAnswer, choiceIndex);
}

function selectWordChoice(selectedChoice, correctAnswer, choiceIndex) {
    if (wordManager) wordManager.selectChoice(selectedChoice, correctAnswer, choiceIndex);
}

// Initialize the app when page loads
init();