import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame4(container, unitContent, onComplete, onBack) {
  let currentIndex = 0;
  
  // Pick 5 expressions (or fallback to word sentences)
  let sessionExprs = [...(unitContent.expressions || [])].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  if (sessionExprs.length < 5) {
    const wordSentences = (unitContent.words || []).map(w => ({
      expression: `${w.word} is ${w.meaning}`,
      meaning: `${w.meaning} (${w.word})`
    }));
    sessionExprs = [...sessionExprs, ...wordSentences].slice(0, 5);
  }

  let currentTarget = sessionExprs[currentIndex];
  let targetSentence = currentTarget.expression ? currentTarget.expression.trim().replace(/[’‘`]/g, "'") : '';
  let targetWords = targetSentence.split(/\s+/); // split by spaces into word tokens
  let availableWords = [];
  let userSelectedWords = [];
  let isGameOver = false;

  function renderStage() {
    currentTarget = sessionExprs[currentIndex];
    targetSentence = currentTarget.expression ? currentTarget.expression.trim().replace(/[’‘`]/g, "'") : '';
    targetWords = targetSentence.split(/\s+/);
    userSelectedWords = [];

    // Shuffle target words for selection pills
    availableWords = targetWords.map((w, idx) => ({ id: `${idx}_${w}`, text: w })).sort(() => 0.5 - Math.random());

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #a855f7;">🧩 문장 단어 순서 맞추기</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">진행: ${currentIndex + 1} / 5</span>
          </div>
        </div>

        <div style="text-align: center; margin: 10px 0;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #fff;">
            뜻: <span style="color: #fbbf24;">"${currentTarget.meaning}"</span>
          </div>
          <button id="btn-re-speak" class="btn-secondary" style="margin-top: 6px; padding: 4px 14px; font-size: 0.85rem;">
            🔊 소리 듣기
          </button>
        </div>

        <!-- Assembled Sentence Box (Target Drop Slot) -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 2px dashed #a855f7; border-radius: 16px; padding: 16px; min-height: 70px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; margin: 12px 0;" id="assembly-box">
          <span style="color: var(--text-muted); font-size: 0.95rem;" id="assembly-placeholder">아래 단어들을 순서대로 클릭하세요!</span>
        </div>

        <!-- Available Shuffled Word Pills -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 16px 0;" id="available-pills-box">
          ${availableWords.map(wObj => `
            <button class="key-pill word-select-pill" data-id="${wObj.id}" style="font-size: 1.1rem; padding: 10px 20px; background: rgba(168, 85, 247, 0.25); border-color: #c084fc;">
              ${wObj.text}
            </button>
          `).join('')}
        </div>

        <!-- Reset Button -->
        <div style="display: flex; justify-content: center;">
          <button id="btn-reset-words" class="btn-secondary" style="padding: 6px 20px; font-size: 0.9rem;">
            단어 다시 조립 ⌫
          </button>
        </div>
      </div>
    `;

    sound.speak(targetSentence);

    container.querySelector('#btn-game-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#btn-re-speak').addEventListener('click', () => {
      sound.speak(targetSentence);
    });

    container.querySelector('#btn-reset-words').addEventListener('click', () => {
      sound.playPop();
      resetWordAssembly();
    });

    setupWordPillEvents();
  }

  function setupWordPillEvents() {
    container.querySelectorAll('.word-select-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGameOver) return;
        const id = btn.getAttribute('data-id');
        const text = btn.innerText.trim();

        sound.playPop();
        userSelectedWords.push({ id, text });
        btn.style.display = 'none';

        updateAssemblyBox();
        checkSentenceCompletion();
      });
    });
  }

  function resetWordAssembly() {
    userSelectedWords = [];
    container.querySelectorAll('.word-select-pill').forEach(btn => btn.style.display = 'inline-block');
    updateAssemblyBox();
  }

  function updateAssemblyBox() {
    const box = container.querySelector('#assembly-box');
    if (!box) return;

    if (userSelectedWords.length === 0) {
      box.innerHTML = `<span style="color: var(--text-muted); font-size: 0.95rem;">아래 단어들을 순서대로 클릭하세요!</span>`;
    } else {
      box.innerHTML = userSelectedWords.map((wObj, idx) => `
        <span class="word-assembled-tag" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; font-weight: 800; font-size: 1.15rem; padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
          ${wObj.text}
        </span>
      `).join('');
    }
  }

  function checkSentenceCompletion() {
    if (userSelectedWords.length === targetWords.length) {
      const userSentence = userSelectedWords.map(w => w.text).join(' ');
      
      if (userSentence === targetSentence) {
        sound.playCorrect();
        currentIndex++;
        if (currentIndex < 5) {
          setTimeout(renderStage, 900);
        } else {
          finishGame();
        }
      } else {
        sound.playWrong();
        const box = container.querySelector('#assembly-box');
        if (box) box.style.border = '2px solid #ef4444';
        setTimeout(() => {
          resetWordAssembly();
          if (box) box.style.border = '2px dashed #a855f7';
        }, 800);
      }
    }
  }

  function finishGame() {
    isGameOver = true;
    sound.playTicketReward();
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🧩</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">문장 조립 완성!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          모든 주요 표현 문장을 올바른 순서대로 퍼즐처럼 완벽하게 맞췄습니다!
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
