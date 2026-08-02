import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame1(container, wordList, onComplete, onBack) {
  let currentIndex = 0;
  let targetWordObj = wordList[currentIndex];
  let currentTargetWord = targetWordObj.word.toUpperCase();
  let nextLetterIndex = 0;
  let isGameOver = false;

  // Pick 5 random words for this game session
  const sessionWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);

  function renderGameStage() {
    targetWordObj = sessionWords[currentIndex];
    currentTargetWord = targetWordObj.word.toUpperCase();
    nextLetterIndex = 0;

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #ec4899;">🎈 글자 풍선 터뜨리기</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div style="text-align: center; margin: 10px 0;">
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-muted);">
            뜻: <span style="color: #fff;">${targetWordObj.meaning}</span> (${targetWordObj.hint})
          </div>
          <button id="btn-re-speak" class="btn-secondary" style="margin-top: 8px; padding: 6px 16px;">
            🔊 소리 다시 듣기
          </button>
        </div>

        <!-- Word Progress Display -->
        <div id="word-progress" class="slots-container" style="margin-bottom: 12px;">
          ${currentTargetWord.split('').map((char, i) => `
            <div class="slot-box" id="char-slot-${i}">?</div>
          `).join('')}
        </div>

        <!-- Floating Bubbles Arena -->
        <div id="bubble-arena" class="bubble-arena"></div>
      </div>
    `;

    // Speak initial word
    sound.speak(targetWordObj.word);

    container.querySelector('#btn-game-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#btn-re-speak').addEventListener('click', () => {
      sound.speak(targetWordObj.word);
    });

    spawnBubbles();
  }

  function spawnBubbles() {
    const arena = container.querySelector('#bubble-arena');
    if (!arena) return;
    arena.innerHTML = '';

    // Letters needed + extra distractor letters
    const wordLetters = currentTargetWord.split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const extraCount = Math.max(3, 8 - wordLetters.length);
    const distractors = Array.from({ length: extraCount }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);

    const allLetters = [...wordLetters, ...distractors].sort(() => 0.5 - Math.random());
    const total = allLetters.length;

    // Grid distribution to prevent overlap (2 rows or 3 rows)
    const cols = Math.ceil(total / 2);
    
    allLetters.forEach((letter, i) => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerText = letter;

      // Calculate 2D position in grid with slight random offset
      const row = Math.floor(i / cols);
      const col = i % cols;

      const leftPercent = 10 + (col * (75 / cols)) + (Math.random() * 6 - 3);
      const topPercent = (row === 0 ? 15 : 55) + (Math.random() * 12 - 6);

      const animDuration = 2.5 + Math.random() * 1.5;
      const animDelay = Math.random() * 1.5;

      bubble.style.left = `${Math.max(5, Math.min(85, leftPercent))}%`;
      bubble.style.top = `${Math.max(10, Math.min(75, topPercent))}%`;
      bubble.style.animationDuration = `${animDuration}s`;
      bubble.style.animationDelay = `${animDelay}s`;

      bubble.addEventListener('click', () => handleBubbleClick(bubble, letter));
      arena.appendChild(bubble);
    });
  }

  function handleBubbleClick(bubbleEl, letter) {
    if (isGameOver) return;
    const requiredLetter = currentTargetWord[nextLetterIndex];

    if (letter === requiredLetter) {
      // Correct!
      sound.playPop();
      
      // Update slot UI
      const slotEl = container.querySelector(`#char-slot-${nextLetterIndex}`);
      if (slotEl) {
        slotEl.innerText = letter;
        slotEl.classList.add('filled');
      }

      // Pop animation & remove bubble
      bubbleEl.style.transform = 'scale(1.5)';
      bubbleEl.style.opacity = '0';
      setTimeout(() => bubbleEl.remove(), 150);

      nextLetterIndex++;

      // Check if word completed
      if (nextLetterIndex >= currentTargetWord.length) {
        sound.playCorrect();
        currentIndex++;
        if (currentIndex < 5) {
          setTimeout(() => renderGameStage(), 800);
        } else {
          finishGame();
        }
      }
    } else {
      // Wrong bubble
      sound.playWrong();
      bubbleEl.style.animation = 'none';
      bubbleEl.offsetHeight; // trigger reflow
      bubbleEl.style.border = '3px solid #ef4444';
      setTimeout(() => {
        bubbleEl.style.border = 'none';
        bubbleEl.style.animation = 'floatBob 3s infinite ease-in-out alternate';
      }, 500);
    }
  }

  function finishGame() {
    isGameOver = true;
    sound.playTicketReward();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🎉</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">풍선 터뜨리기 성공!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          모든 단어를 완벽하게 완성했습니다!
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

  renderGameStage();
}
