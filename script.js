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

// Initialize app
function init() {
    loadSelectedLetters();
    loadSeed();
    if (selectedLetters.size === 0) {
        selectFirst15Letters();
    }
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
    // Generate shuffled arrays based on current seed
    const availableLetters = getAvailableLetters();
    const availableWords = getAvailableWords();
    
    shuffledLetters = shuffleArray(availableLetters, randomSeed);
    shuffledWords = shuffleArray(availableWords, randomSeed + 1000);
    
    // Reset indices when shuffling
    currentLetterIndex = 0;
    currentWordIndex = 0;
    
    updateLetterFlashcard();
    updateWordFlashcard();
}

function updateLetterFlashcard() {
    const container = document.getElementById('letter-flashcard');

    if (shuffledLetters.length === 0) {
        container.innerHTML = '<div class="no-letters-message">Select some letters in the Configuration tab to start practicing!</div>';
        return;
    }

    if (currentLetterIndex >= shuffledLetters.length) {
        currentLetterIndex = 0;
    }

    const letter = shuffledLetters[currentLetterIndex];
    showingAnswer = false;

    container.innerHTML = `
        <div class="flashcard-char">${letter.hiragana}</div>
        <div class="flashcard-romaji" id="letter-answer">${letter.romaji}</div>
        <div class="flashcard-buttons">
            <button class="btn btn-primary" onclick="showLetterAnswer()">Show Answer</button>
            <button class="btn btn-secondary" onclick="nextLetter()">Next</button>
        </div>
    `;
}

function updateWordFlashcard() {
    const container = document.getElementById('word-flashcard');

    if (shuffledWords.length === 0) {
        container.innerHTML = '<div class="no-letters-message">Select some letters in the Configuration tab to start practicing words!</div>';
        return;
    }

    if (currentWordIndex >= shuffledWords.length) {
        currentWordIndex = 0;
    }

    const word = shuffledWords[currentWordIndex];
    showingAnswer = false;

    container.innerHTML = `
        <div class="word-reading">${word.hiragana}</div>
        <div class="flashcard-romaji" id="word-answer">${word.romaji} (${word.meaning})</div>
        <div class="flashcard-buttons">
            <button class="btn btn-primary" onclick="showWordAnswer()">Show Answer</button>
            <button class="btn btn-secondary" onclick="nextWord()">Next</button>
        </div>
    `;
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

function showLetterAnswer() {
    document.getElementById('letter-answer').classList.add('show');
    showingAnswer = true;
}

function showWordAnswer() {
    document.getElementById('word-answer').classList.add('show');
    showingAnswer = true;
}

function nextLetter() {
    currentLetterIndex = (currentLetterIndex + 1) % shuffledLetters.length;
    updateLetterFlashcard();
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % shuffledWords.length;
    updateWordFlashcard();
}

// Initialize the app when page loads
init();