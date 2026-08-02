import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame1(container, wordList, onComplete, onBack) {
  let currentIndex = 0;
  const sessionWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);

  let targetWordObj = sessionWords[currentIndex];
  let targetWord = targetWordObj.word.toUpperCase();
  let filledStatus = []; // array of booleans
  let fallingItems = []; // active falling letters
  let basketXPercent = 50; // basket center position (0-100%)
  let keyVelocity = 0; // -1 for left, 1 for right, 0 for stop
  let animationFrameId = null;
  let spawnTimerId = null;
  let isGameOver = false;

  function renderStage() {
    targetWordObj = sessionWords[currentIndex];
    targetWord = targetWordObj.word.toUpperCase();
    filledStatus = Array(targetWord.length).fill(false);
    fallingItems = [];
    basketXPercent = 50;
    keyVelocity = 0;

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #ec4899;">🧺 알파벳 캐치 게임</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div style="text-align: center; margin: 4px 0;">
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-muted);">
            뜻: <span style="color: #fff;">${targetWordObj.meaning}</span> (${targetWordObj.hint})
          </div>
          <button id="btn-re-speak" class="btn-secondary" style="margin-top: 4px; padding: 4px 14px; font-size: 0.85rem;">
            🔊 소리 다시 듣기
          </button>
        </div>

        <!-- Word Progress Display (Slots) -->
        <div id="word-progress" class="slots-container" style="margin: 8px 0;">
          ${targetWord.split('').map((char, i) => `
            <div class="slot-box" id="catch-slot-${i}">_</div>
          `).join('')}
        </div>

        <!-- Catch Arena -->
        <div id="catch-arena" class="catch-arena">
          <div id="catch-basket" class="catch-basket" style="left: 50%;">🧺</div>
        </div>

        <!-- Joystick Controller (Below arena to avoid hiding basket) -->
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 8px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">
            🕹️ 조이스틱 드래그 / 키보드 ◀ ▶ 방향키 조작
          </div>
          <div class="joystick-container">
            <div class="joystick-base" id="joystick-base">
              <div class="joystick-track-line"></div>
              <div class="joystick-knob" id="joystick-knob">🕹️</div>
            </div>
          </div>
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
    const joystickBase = container.querySelector('#joystick-base');
    const joystickKnob = container.querySelector('#joystick-knob');
    if (!arena || !basket || !joystickBase || !joystickKnob) return;

    // Mouse/Touch movement directly in arena
    const handleDirectPointerMove = (clientX) => {
      const rect = arena.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      basketXPercent = Math.max(8, Math.min(92, (relativeX / rect.width) * 100));
      basket.style.left = `${basketXPercent}%`;
    };

    arena.addEventListener('mousemove', (e) => handleDirectPointerMove(e.clientX));
    arena.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) handleDirectPointerMove(e.touches[0].clientX);
    });

    // Joystick Drag Control Logic
    let isDraggingJoystick = false;
    let joystickStartX = 0;

    const onJoystickStart = (clientX) => {
      isDraggingJoystick = true;
      const rect = joystickBase.getBoundingClientRect();
      joystickStartX = rect.left + rect.width / 2;
    };

    const onJoystickMove = (clientX) => {
      if (!isDraggingJoystick) return;
      const deltaX = clientX - joystickStartX;
      const maxDelta = 35; // max knob displacement
      const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaX));

      joystickKnob.style.transform = `translateX(${clampedDelta}px)`;
      
      // Move basket proportionally
      const moveAmount = (clampedDelta / maxDelta) * 2.2;
      basketXPercent = Math.max(8, Math.min(92, basketXPercent + moveAmount));
      basket.style.left = `${basketXPercent}%`;
    };

    const onJoystickEnd = () => {
      isDraggingJoystick = false;
      joystickKnob.style.transform = `translateX(0px)`;
    };

    joystickBase.addEventListener('mousedown', (e) => onJoystickStart(e.clientX));
    window.addEventListener('mousemove', (e) => onJoystickMove(e.clientX));
    window.addEventListener('mouseup', onJoystickEnd);

    joystickBase.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onJoystickStart(e.touches[0].clientX);
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onJoystickMove(e.touches[0].clientX);
    });
    window.addEventListener('touchend', onJoystickEnd);

    // Keyboard Arrow Keys (Left / Right / A / D)
    window.onkeydown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keyVelocity = -1.8;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keyVelocity = 1.8;
      }
    };

    window.onkeyup = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        keyVelocity = 0;
      }
    };
  }

  function spawnFallingLetter() {
    if (isGameOver) return;
    const arena = container.querySelector('#catch-arena');
    if (!arena) return;

    const unfulfilledChars = targetWord.split('').filter((_, i) => !filledStatus[i]);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    let letterToSpawn = '';
    if (Math.random() < 0.65 && unfulfilledChars.length > 0) {
      letterToSpawn = unfulfilledChars[Math.floor(Math.random() * unfulfilledChars.length)];
    } else {
      letterToSpawn = alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'falling-letter';
    itemEl.innerText = letterToSpawn;

    const leftPercent = 8 + Math.random() * 84;
    itemEl.style.left = `${leftPercent}%`;
    itemEl.style.top = `-60px`;

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

      // Update basket X from keyboard velocity
      if (keyVelocity !== 0) {
        basketXPercent = Math.max(8, Math.min(92, basketXPercent + keyVelocity));
        basket.style.left = `${basketXPercent}%`;
      }

      const arenaHeight = arena.clientHeight || 380;
      const basketY = arenaHeight - 60;

      for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        item.yPos += item.speed;
        item.el.style.top = `${item.yPos}px`;

        // Check Collision with Basket
        if (item.yPos >= basketY && item.yPos <= basketY + 35) {
          const dist = Math.abs(item.xPercent - basketXPercent);
          if (dist < 14) {
            handleCatchLetter(item.letter, item.el);
            fallingItems.splice(i, 1);
            continue;
          }
        }

        // Out of bottom bounds
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
    window.onkeyup = null;
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
