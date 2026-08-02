import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMiniGame2(container, wordList, onComplete, onBack) {
  // Pick 6 random words for memory match
  const selectedWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 6);

  // Generate 12 card items (6 English, 6 Korean)
  let cards = [];
  selectedWords.forEach((item, idx) => {
    cards.push({ id: `en-${idx}`, wordId: idx, text: item.word, isEnglish: true, rawObj: item });
    cards.push({ id: `kr-${idx}`, wordId: idx, text: item.meaning, isEnglish: false, rawObj: item });
  });

  // Shuffle cards
  cards.sort(() => 0.5 - Math.random());

  let flippedCards = [];
  let matchedPairsCount = 0;
  let isLock = false;

  container.innerHTML = `
    <div class="game-container glass-card">
      <div class="game-header">
        <button id="btn-game-back" class="btn-secondary">◀ 메인으로</button>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #3b82f6;">🃏 단어 카드 짝맞추기</h2>
        <div class="game-stats">
          <span class="stat-item" style="color: #6ee7b7;">맞춘 짝: <span id="match-count">0</span> / 6</span>
        </div>
      </div>

      <p style="text-align: center; color: var(--text-muted); font-size: 1rem;">
        영단어 카드와 알맞은 한국어 뜻 카드를 찾아 짝을 맞춰보세요!
      </p>

      <div class="card-grid" id="card-grid">
        ${cards.map((card, i) => `
          <div class="memory-card" data-index="${i}">
            <div class="memory-card-inner">
              <div class="memory-card-front">❓</div>
              <div class="memory-card-back">${card.text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#btn-game-back').addEventListener('click', () => {
    sound.playPop();
    onBack();
  });

  const cardElements = container.querySelectorAll('.memory-card');
  cardElements.forEach(el => {
    el.addEventListener('click', () => {
      const index = parseInt(el.getAttribute('data-index'));
      handleCardClick(el, index);
    });
  });

  function handleCardClick(cardEl, index) {
    if (isLock) return;
    const cardData = cards[index];

    // Already flipped or matched
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    // Flip card
    sound.playFlip();
    cardEl.classList.add('flipped');

    // If it's English, speak it
    if (cardData.isEnglish) {
      sound.speak(cardData.text);
    }

    flippedCards.push({ el: cardEl, data: cardData });

    if (flippedCards.length === 2) {
      isLock = true;
      const [first, second] = flippedCards;

      if (first.data.wordId === second.data.wordId) {
        // Matched!
        setTimeout(() => {
          sound.playCorrect();
          sound.speak(first.data.rawObj.word);

          first.el.classList.add('matched');
          second.el.classList.add('matched');

          matchedPairsCount++;
          container.querySelector('#match-count').innerText = matchedPairsCount;

          flippedCards = [];
          isLock = false;

          if (matchedPairsCount >= 6) {
            setTimeout(finishGame, 600);
          }
        }, 400);
      } else {
        // Wrong match
        setTimeout(() => {
          sound.playWrong();
          first.el.classList.remove('flipped');
          second.el.classList.remove('flipped');

          flippedCards = [];
          isLock = false;
        }, 900);
      }
    }
  }

  function finishGame() {
    sound.playTicketReward();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🎉</span>
        <h2 style="font-size: 2rem; font-weight: 900; margin-top: 10px;">카드 짝맞추기 성공!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
          모든 단어와 뜻을 완벽히 맞췄습니다!
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
}
