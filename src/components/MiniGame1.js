import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame1(container, wordList, onComplete, onBack) {
  let currentIndex = 0;
  const sessionWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);

  let targetWordObj = sessionWords[currentIndex];
  let targetWord = targetWordObj.word.toUpperCase();
  let filledStatus = []; // array of booleans indicating if slot i is filled
  let fallingItems = []; // active falling letters
  let basketXPercent = 50; // basket center position (0-100%)
  let animationFrameId = null;
  let spawnTimerId = null;
  let isGameOver = false;

  function renderStage() {
    targetWordObj = sessionWords[currentIndex];
    targetWord = targetWordObj.word.toUpperCase();
    filledStatus = Array(targetWord.length).fill(false);
    fallingItems = [];
    basketXPercent = 50;

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #ec4899;">🧺 알파벳 캐치 게임</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div style="text-align: center; margin: 6px 0;">
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-muted);">
            뜻: <span style="color: #fff;">${targetWordObj.meaning}</span> (${targetWordObj.hint})
          </div>
          <button id="btn-re-speak" class="btn-secondary" style="margin-top: 6px; padding: 4px 14px; font-size: 0.85rem;">
            🔊 소리 다시 듣기
          </button>
        </div>

        <!-- Word Progress Display (Slots) -->
        <div id="word-progress" class="slots-container" style="margin: 10px 0;">
          ${targetWord.split('').map((char, i) => `
            <div class="slot-box" id="catch-slot-${i}">_</div>
          `).join('')}
        </div>

        <!-- Catch Arena -->
        <div id="catch-arena" class="catch-arena">
          <div id="catch-basket" class="catch-basket" style="left: 50%;">🧺</div>
        </div>

        <!-- Touch / Mobile Controls -->
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 10px;">
          <button id="btn-move-left" class="btn-secondary" style="flex: 1; padding: 12px; font-size: 1.2rem;">◀ 왼쪽</button>
          <button id="btn-move-right" class="btn-secondary" style="flex: 1; padding: 12px; font-size: 1.2rem;">오른쪽 ▶</button>
        </div>
      </div>
    `;

    sound.speak(targetWordObj.word);

    container.querySelector('#btn-game-back').addEventListener('click', () => {
      cleanUp();
      sound.playPop();
      onBack();
    });

    container.querySelector('#btn-re-speak').addEventListener('click', () => {
      sound.speak(targetWordObj.word);
    });

    setupControls();
    startGameLoop();
  }

  function setupControls() {
    const arena = container.querySelector('#catch-arena');
    const basket = container.querySelector('#catch-basket');
    if (!arena || !basket) return;

    // Mouse movement in arena
    arena.addEventListener('mousemove', (e) => {
      const rect = arena.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      basketXPercent = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
      basket.style.left = `${basketXPercent}%`;
    });

    // Touch movement in arena
    arena.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = arena.getBoundingClientRect();
        const relativeX = e.touches[0].clientX - rect.left;
        basketXPercent = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
        basket.style.left = `${basketXPercent}%`;
      }
    });

    // Button controls
    const leftBtn = container.querySelector('#btn-move-left');
    const rightBtn = container.querySelector('#btn-move-right');

    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        basketXPercent = Math.max(8, basketXPercent - 15);
        basket.style.left = `${basketXPercent}%`;
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        basketXPercent = Math.min(92, basketXPercent + 15);
        basket.style.left = `${basketXPercent}%`;
      });
    }

    // Keyboard arrow keys
    window.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        basketXPercent = Math.max(8, basketXPercent - 10);
        basket.style.left = `${basketXPercent}%`;
      } else if (e.key === 'ArrowRight') {
        basketXPercent = Math.min(92, basketXPercent + 10);
        basket.style.left = `${basketXPercent}%`;
      }
    };
  }

  function spawnFallingLetter() {
    if (isGameOver) return;
    const arena = container.querySelector('#catch-arena');
    if (!arena) return;

    // Unfilled letters of target word + distractors
    const unfulfilledChars = targetWord.split('').filter((_, i) => !filledStatus[i]);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    let letterToSpawn = '';
    if (Math.random() < 0.65 && unfulfilledChars.length > 0) {
      // 65% chance to spawn needed letter
      letterToSpawn = unfulfilledChars[Math.floor(Math.random() * unfulfilledChars.length)];
    } else {
      // 35% chance to spawn random distractor
      letterToSpawn = alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'falling-letter';
    itemEl.innerText = letterToSpawn;

    const leftPercent = 8 + Math.random() * 84;
    itemEl.style.left = `${leftPercent}%`;
    itemEl.style.top = `-60px`;

    // Click handler on letter as alternate catch method
    itemEl.addEventListener('click', () => {
      handleCatchLetter(letterToSpawn, itemEl);
    });

    arena.appendChild(itemEl);

    fallingItems.push({
      el: itemEl,
      letter: letterToSpawn,
      xPercent: leftPercent,
      yPos: -60,
      speed: 1.8 + Math.random() * 1.4
    });
  }

  function startGameLoop() {
    cleanUp();

    spawnTimerId = setInterval(spawnFallingLetter, 1100);

    function updatePhysics() {
      if (isGameOver) return;
      const arena = container.querySelector('#catch-arena');
      const basket = container.querySelector('#catch-basket');
      if (!arena) return;

      const arenaHeight = arena.clientHeight || 380;
      const basketY = arenaHeight - 60; // collision zone Y

      for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        item.yPos += item.speed;
        item.el.style.top = `${item.yPos}px`;

        // Check Collision with Basket at bottom
        if (item.yPos >= basketY && item.yPos <= basketY + 35) {
          const dist = Math.abs(item.xPercent - basketXPercent);
          if (dist < 14) {
            // Collision caught!
            handleCatchLetter(item.letter, item.el);
            fallingItems.splice(i, 1);
            continue;
          }
        }

        // Out of bottom bounds -> remove
        if (item.yPos > arenaHeight + 60) {
          item.el.remove();
          fallingItems.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    }

    animationFrameId = requestAnimationFrame(updatePhysics);
  }

  function handleCatchLetter(letter, itemEl) {
    itemEl.remove();

    // Check if letter belongs to targetWord and is unfulfilled
    let caughtAny = false;
    targetWord.split('').forEach((char, idx) => {
      if (char === letter && !filledStatus[idx]) {
        filledStatus[idx] = true;
        caughtAny = true;

        const slotEl = container.querySelector(`#catch-slot-${idx}`);
        if (slotEl) {
          slotEl.innerText = letter;
          slotEl.classList.add('filled');
        }
      }
    });

    if (caughtAny) {
      // Sound pop & check if word complete!
      sound.playPop();

      const allFilled = filledStatus.every(status => status === true);
      if (allFilled) {
        sound.playCorrect();
        cleanUp();

        currentIndex++;
        if (currentIndex < 5) {
          setTimeout(renderStage, 800);
        } else {
          finishGame();
        }
      }
    } else {
      // Wrong / Distractor letter caught
      sound.playWrong();
      const basket = container.querySelector('#catch-basket');
      if (basket) {
        basket.classList.add('basket-shake');
        setTimeout(() => basket.classList.remove('basket-shake'), 300);
      }
    }
  }

  function cleanUp() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (spawnTimerId) clearInterval(spawnTimerId);
    window.onkeydown = null;
    fallingItems = [];
  }

  function finishGame() {
    isGameOver = true;
    cleanUp();
    sound.playTicketReward();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🧺</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">알파벳 캐치 성공!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          신나게 알파벳을 받아 목표 단어를 완벽하게 완성했습니다!
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
