import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame3(container, wordList, onComplete, onBack) {
  let currentIndex = 0;
  const sessionWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  let targetObj = sessionWords[currentIndex];
  let targetWord = targetObj.word.toUpperCase();
  let userLetters = [];
  let isGameOver = false;

  function renderStage() {
    targetObj = sessionWords[currentIndex];
    targetWord = targetObj.word.toUpperCase();
    userLetters = [];

    // Create mask (blanks for slots)
    // 50% of letters masked or at least 2 blanks
    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #10b981;">🎧 소리듣고 알파벳 맞추기</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div class="audio-quiz-box">
          <button id="btn-listen-large" class="speaker-btn-large" title="소리 다시 듣기">
            🔊
          </button>
          <div style="color: var(--text-muted); font-size: 1.1rem; font-weight: 700;">
            뜻 힌트: <span style="color: #fff;">${targetObj.meaning}</span>
          </div>

          <!-- Target Slot Display -->
          <div id="slots-area" class="slots-container">
            ${targetWord.split('').map((_, i) => `
              <div class="slot-box" id="quiz-slot-${i}">_</div>
            `).join('')}
          </div>

          <!-- Keypad pills -->
          <div class="keypad-grid" id="keypad"></div>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button id="btn-clear" class="btn-secondary" style="padding: 8px 20px;">지우기 ⌫</button>
          </div>
        </div>
      </div>
    `;

    // Play TTS
    sound.speak(targetObj.word);

    container.querySelector('#btn-game-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#btn-listen-large').addEventListener('click', () => {
      sound.speak(targetObj.word);
    });

    container.querySelector('#btn-clear').addEventListener('click', () => {
      sound.playPop();
      userLetters = [];
      updateSlots();
    });

    renderKeypad();
  }

  function renderKeypad() {
    const keypadContainer = container.querySelector('#keypad');
    if (!keypadContainer) return;

    // Word letters + random shuffled letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const wordLetters = targetWord.split('');
    const extraLetters = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);

    const allKeys = [...wordLetters, ...extraLetters].sort(() => 0.5 - Math.random());

    keypadContainer.innerHTML = allKeys.map(key => `
      <button class="key-pill" data-key="${key}">${key}</button>
    `).join('');

    keypadContainer.querySelectorAll('.key-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        handleKeyPress(key);
      });
    });
  }

  function handleKeyPress(key) {
    if (isGameOver) return;
    if (userLetters.length < targetWord.length) {
      sound.playPop();
      userLetters.push(key);
      updateSlots();

      // Check if full
      if (userLetters.length === targetWord.length) {
        checkAnswer();
      }
    }
  }

  function updateSlots() {
    targetWord.split('').forEach((_, i) => {
      const slotEl = container.querySelector(`#quiz-slot-${i}`);
      if (slotEl) {
        if (i < userLetters.length) {
          slotEl.innerText = userLetters[i];
          slotEl.classList.add('filled');
        } else {
          slotEl.innerText = '_';
          slotEl.classList.remove('filled');
        }
      }
    });
  }

  function checkAnswer() {
    const userInput = userLetters.join('');
    if (userInput === targetWord) {
      // Correct!
      sound.playCorrect();
      currentIndex++;

      if (currentIndex < 5) {
        setTimeout(renderStage, 800);
      } else {
        finishGame();
      }
    } else {
      // Wrong
      sound.playWrong();
      const slots = container.querySelectorAll('.slot-box');
      slots.forEach(s => s.style.border = '2px solid #ef4444');
      setTimeout(() => {
        userLetters = [];
        updateSlots();
      }, 700);
    }
  }

  function finishGame() {
    isGameOver = true;
    sound.playTicketReward();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🎉</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">알파벳 맞추기 성공!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          귀로 잘 듣고 올바른 스펠링을 완성했습니다!
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
