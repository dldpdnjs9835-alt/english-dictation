import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderDictationExam(container, user, wordList, onFinishExam, onBack) {
  // Check ticket
  if (user.tickets < 1) {
    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; justify-content: center; align-items: center;">
        <span style="font-size: 4rem;">🎟️</span>
        <h2 style="font-size: 1.8rem; font-weight: 900; margin-top: 10px;">티켓이 부족해요!</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 24px;">
          받아쓰기 시험을 보려면 **티켓 1장**이 필요합니다.<br>미니게임을 클리어하여 티켓을 모아보세요!
        </p>
        <button id="btn-no-ticket-back" class="btn-primary">미니게임 하러 가기 🎮</button>
      </div>
    `;
    container.querySelector('#btn-no-ticket-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });
    return;
  }

  let examIndex = 0;
  const examWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 10);
  let correctCount = 0;
  let userAnswers = [];

  function renderExamQuestion() {
    const currentObj = examWords[examIndex];

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-exam-exit" class="btn-secondary">◀ 나가기</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f59e0b;">📝 받아쓰기 시험</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">문제: ${examIndex + 1} / 10</span>
          </div>
        </div>

        <!-- Virtual Teacher Section -->
        <div class="teacher-section">
          <div class="teacher-avatar">👩‍🏫</div>
          <div class="speech-bubble">
            "제 ${examIndex + 1}번 문제입니다. 선생님의 발음을 잘 듣고 스펠링을 입력하세요!"
          </div>
        </div>

        <!-- Audio Player Controls -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 10px;">
          <button id="btn-play-sound" class="speaker-btn-large" style="width: 100px; height: 100px; font-size: 3rem;">
            🔊
          </button>
          <div style="display: flex; gap: 10px;">
            <button id="btn-speak-word" class="btn-secondary">단어 들려주기</button>
            <button id="btn-show-hint" class="btn-secondary">뜻 힌트 보기 💡</button>
          </div>
          <div id="hint-display" style="display: none; color: #fbbf24; font-weight: 700; font-size: 1.1rem;">
            뜻: ${currentObj.meaning} (${currentObj.hint})
          </div>
        </div>

        <!-- Dictation Input Box -->
        <div class="dictation-input-box">
          <input type="text" id="dictation-input" class="dictation-input" placeholder="스펠링 입력..." autocomplete="off" />
          <button id="btn-submit-answer" class="btn-primary" style="font-size: 1.2rem; padding: 14px 40px;">
            제출하기 ➔
          </button>
        </div>
      </div>
    `;

    // Speak automatically
    setTimeout(() => sound.speak(currentObj.word), 300);

    const inputEl = container.querySelector('#dictation-input');
    inputEl.focus();

    container.querySelector('#btn-exam-exit').addEventListener('click', () => {
      if (confirm('시험을 중단하시겠습니까? (소모된 티켓은 반환되지 않습니다)')) {
        sound.playPop();
        onBack();
      }
    });

    container.querySelector('#btn-play-sound').addEventListener('click', () => {
      sound.speak(currentObj.word);
    });

    container.querySelector('#btn-speak-word').addEventListener('click', () => {
      sound.speak(currentObj.word);
    });

    container.querySelector('#btn-show-hint').addEventListener('click', () => {
      sound.playPop();
      const hintBox = container.querySelector('#hint-display');
      hintBox.style.display = hintBox.style.display === 'none' ? 'block' : 'none';
    });

    const submitAnswer = () => {
      const val = inputEl.value.trim().toLowerCase();
      if (!val) return;

      const isCorrect = val === currentObj.word.toLowerCase();
      userAnswers.push({
        wordObj: currentObj,
        userAnswer: val,
        isCorrect
      });

      if (isCorrect) {
        sound.playCorrect();
        correctCount++;
      } else {
        sound.playWrong();
      }

      examIndex++;
      if (examIndex < 10) {
        renderExamQuestion();
      } else {
        showExamResult();
      }
    };

    container.querySelector('#btn-submit-answer').addEventListener('click', submitAnswer);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAnswer();
    });
  }

  function showExamResult() {
    const totalScore = (correctCount / 10) * 100;
    sound.playTicketReward();

    if (totalScore >= 80) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    let stars = '⭐';
    if (totalScore >= 60) stars = '⭐⭐';
    if (totalScore >= 100) stars = '⭐⭐⭐ 만점!';

    container.innerHTML = `
      <div class="game-container glass-card" style="text-align: center; align-items: center;">
        <div class="teacher-avatar" style="font-size: 5rem; width: 110px; height: 110px; margin-bottom: 10px;">👩‍🏫</div>
        <h2 style="font-size: 2.2rem; font-weight: 900; background: linear-gradient(90deg, #fbbf24, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          받아쓰기 시험 성적표
        </h2>
        <div style="font-size: 2rem; font-weight: 900; margin: 8px 0; color: #fbbf24;">
          ${stars} (${totalScore}점)
        </div>

        <div style="width: 100%; max-width: 500px; text-align: left; margin: 16px 0; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 16px;">
          <h4 style="margin-bottom: 10px; color: var(--text-muted);">시험 결과 세부사항:</h4>
          ${userAnswers.map((ans, i) => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span>${i + 1}. 정답: <strong>${ans.wordObj.word}</strong> (${ans.wordObj.meaning})</span>
              <span style="color: ${ans.isCorrect ? '#10b981' : '#ef4444'}; font-weight: 800;">
                ${ans.isCorrect ? '⭕ 정답' : `❌ (작성: ${ans.userAnswer})`}
              </span>
            </div>
          `).join('')}
        </div>

        <button id="btn-finish-report" class="btn-primary" style="font-size: 1.2rem; padding: 14px 36px;">
          성적 저장 및 돌아가기 🏆
        </button>
      </div>
    `;

    container.querySelector('#btn-finish-report').addEventListener('click', () => {
      sound.playPop();
      onFinishExam(totalScore);
    });
  }

  renderExamQuestion();
}
