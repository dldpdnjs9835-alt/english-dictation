import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame1(container, wordList, onComplete, onBack) {
  let currentIndex = 0;
  const sessionWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);

  let targetWordObj = sessionWords[currentIndex];
  let targetWord = targetWordObj.word.toUpperCase().replace(/[^A-Z]/g, '');
  
  const GRID_SIZE = 6;
  let gridMatrix = []; // 6x6 array of letters
  let selectedIndices = []; // array of cell indices [r, c] selected by player
  let isGameOver = false;

  function renderStage() {
    targetWordObj = sessionWords[currentIndex];
    targetWord = targetWordObj.word.toUpperCase().replace(/[^A-Z]/g, '');
    selectedIndices = [];
    
    // Generate 6x6 grid with targetWord placed inside
    gridMatrix = createWordSearchGrid(targetWord, GRID_SIZE);

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #ec4899;">🔍 단어 숨은그림찾기 퍼즐</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div style="text-align: center; margin: 6px 0;">
          <div style="font-size: 1.2rem; font-weight: 800; color: #fff;">
            찾을 단어 뜻: <span style="color: #fbbf24;">"${targetWordObj.meaning}"</span> (${targetWord.length}글자)
          </div>
          <button id="btn-re-speak" class="btn-secondary" style="margin-top: 6px; padding: 4px 14px; font-size: 0.85rem;">
            🔊 소리 듣기
          </button>
        </div>

        <!-- 6x6 Word Search Grid Arena -->
        <div style="display: flex; justify-content: center; margin: 12px 0;">
          <div class="word-search-grid" id="search-grid">
            ${gridMatrix.map((row, r) => row.map((char, c) => `
              <div class="grid-cell" data-row="${r}" data-col="${c}">
                ${char}
              </div>
            `).join('')).join('')}
          </div>
        </div>

        <!-- Selected Sequence Display & Reset -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-muted);">
            선택한 단어: <span id="selected-word-text" style="color: #ec4899; font-weight: 900; letter-spacing: 2px;">-</span>
          </div>
          <button id="btn-reset-selection" class="btn-secondary" style="padding: 6px 18px; font-size: 0.85rem;">
            선택 초기화 ⌫
          </button>
        </div>
      </div>
    `;

    sound.speak(targetWordObj.word);

    container.querySelector('#btn-game-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#btn-re-speak').addEventListener('click', () => {
      sound.speak(targetWordObj.word);
    });

    container.querySelector('#btn-reset-selection').addEventListener('click', () => {
      sound.playPop();
      resetSelection();
    });

    setupGridEvents();
  }

  function createWordSearchGrid(word, size) {
    // Create empty size x size matrix
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const len = word.length;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Decide orientation: 0 = Horizontal (left to right), 1 = Vertical (top to bottom)
    const isHorizontal = Math.random() < 0.5;

    let startR = 0;
    let startC = 0;

    if (isHorizontal) {
      startR = Math.floor(Math.random() * size);
      startC = Math.floor(Math.random() * (size - len + 1));
      for (let i = 0; i < len; i++) {
        grid[startR][startC + i] = word[i];
      }
    } else {
      startR = Math.floor(Math.random() * (size - len + 1));
      startC = Math.floor(Math.random() * size);
      for (let i = 0; i < len; i++) {
        grid[startR + i][startC] = word[i];
      }
    }

    // Fill remaining cells with random letters
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    return grid;
  }

  function setupGridEvents() {
    const gridEl = container.querySelector('#search-grid');
    if (!gridEl) return;

    let isMouseDown = false;

    gridEl.querySelectorAll('.grid-cell').forEach(cell => {
      const r = parseInt(cell.getAttribute('data-row'));
      const c = parseInt(cell.getAttribute('data-col'));

      const handleCellSelect = () => {
        if (isGameOver) return;
        
        // Avoid selecting duplicate cell consecutively
        const alreadySelected = selectedIndices.some(([sr, sc]) => sr === r && sc === c);
        if (!alreadySelected) {
          sound.playPop();
          selectedIndices.push([r, c]);
          cell.classList.add('selected');
          updateSelectedWordDisplay();
          checkWordMatch();
        }
      };

      cell.addEventListener('click', handleCellSelect);
    });
  }

  function resetSelection() {
    selectedIndices = [];
    const gridEl = container.querySelector('#search-grid');
    if (gridEl) {
      gridEl.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('selected'));
    }
    const wordText = container.querySelector('#selected-word-text');
    if (wordText) wordText.innerText = '-';
  }

  function updateSelectedWordDisplay() {
    const wordText = container.querySelector('#selected-word-text');
    if (!wordText) return;

    const currentString = selectedIndices.map(([r, c]) => gridMatrix[r][c]).join('');
    wordText.innerText = currentString || '-';
  }

  function checkWordMatch() {
    const currentString = selectedIndices.map(([r, c]) => gridMatrix[r][c]).join('');
    
    if (currentString === targetWord) {
      // Word matched perfectly!
      sound.playCorrect();
      const gridEl = container.querySelector('#search-grid');
      selectedIndices.forEach(([r, c]) => {
        const cell = gridEl.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('matched');
      });

      currentIndex++;
      if (currentIndex < 5) {
        setTimeout(renderStage, 900);
      } else {
        finishGame();
      }
    }
  }

  function finishGame() {
    isGameOver = true;
    sound.playTicketReward();
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🔍</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">단어 퍼즐 모두 성공!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          모든 숨은 영단어를 완벽하게 찾아냈습니다!
        </p>
        <div class="ticket-badge" style="font-size: 1.5rem; padding: 12px 28px; margin-bottom: 24px;">
          🎟️ 티켓 +1장 획득!
        </div>
        <button id="btn-claim" class="btn-primary" style="font-size: 1.2rem; padding: 14px 36px;">
          티켓 받고 완료하기 🚀
        </button>
      </div>
    `;

    container.querySelector('#btn-claim').addEventListener('click', () => {
      sound.playPop();
      onComplete();
    });
  }

  renderStage();
}
