import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderDictationExam(container, user, unitContent, onFinishExam, onBack) {
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

  // Construct 10 items: 7 words (Q1-7) + 3 expressions (Q8-10)
  const availableWords = [...(unitContent.words || [])].sort(() => 0.5 - Math.random());
  const availableExprs = [...(unitContent.expressions || [])].sort(() => 0.5 - Math.random());

  const examWordsPart = availableWords.slice(0, 7).map(item => ({ ...item, isExpression: false }));
  
  // If fewer than 3 expressions, backfill with words
  let examExprsPart = availableExprs.slice(0, 3).map(item => ({
    word: item.expression,
    meaning: item.meaning,
    hint: item.hint,
    isExpression: true
  }));

  if (examExprsPart.length < 3) {
    const extraWords = availableWords.slice(7, 7 + (3 - examExprsPart.length)).map(item => ({ ...item, isExpression: false }));
    examExprsPart = [...examExprsPart, ...extraWords];
  }

  const examItems = [...examWordsPart, ...examExprsPart];

  let examIndex = 0;
  let correctCount = 0;
  let userAnswers = [];
  let wrongList = [];

  function renderExamQuestion() {
    const currentObj = examItems[examIndex];
    const isExpr = currentObj.isExpression;

    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-exam-exit" class="btn-secondary">◀ 나가기</button>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f59e0b;">📝 받아쓰기 시험</h2>
          <div class="game-stats">
            <span class="stat-item" style="color: #fbbf24;">문제: ${examIndex + 1} / 10</span>
          </div>
        </div>

        <!-- Question Type Pill -->
        <div style="text-align: center; margin-top: 4px;">
          <span style="background: ${isExpr ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'linear-gradient(135deg, #3b82f6, #10b981)'}; color: #fff; font-weight: 800; padding: 4px 16px; border-radius: 20px; font-size: 0.95rem;">
            ${isExpr ? '💬 8~10번: 주요 표현 문장 시험' : '🔤 1~7번: 주요 단어 시험'}
          </span>
        </div>

        <!-- Virtual Teacher Section -->
        <div class="teacher-section" style="margin-top: 10px;">
          <div class="teacher-avatar">👩‍🏫</div>
          <div class="speech-bubble">
            ${isExpr ? `"제 ${examIndex + 1}번 문제입니다. 선생님이 읽어주는 **주요 표현 문장**을 듣고 쓰세요!"` : `"제 ${examIndex + 1}번 문제입니다. 선생님의 발음을 듣고 스펠링을 입력하세요!"`}
          </div>
        </div>

        <!-- Audio Player Controls -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 8px;">
          <button id="btn-play-sound" class="speaker-btn-large" style="width: 80px; height: 80px; font-size: 2.5rem;">
            🔊
          </button>
          <div style="display: flex; gap: 10px;">
            <button id="btn-speak-word" class="btn-secondary">소리 다시 듣기</button>
            <button id="btn-show-hint" class="btn-secondary">한글 뜻 힌트 보기 💡</button>
          </div>
          <div id="hint-display" style="display: none; color: #fbbf24; font-weight: 700; font-size: 1.1rem;">
            뜻: ${currentObj.meaning}
          </div>
        </div>

        <!-- 4-Line English Notebook Typing Area -->
        <div class="notebook-paper">
          <div class="notebook-lines">
            <div class="notebook-line top-black" title="1st Line (Top Black)"></div>
            <div class="notebook-line mid-red-dashed" title="2nd Line (Red/Pink Dashed)"></div>
            <div class="notebook-line baseline-red" title="3rd Line (Red Solid Baseline - Write here!)"></div>
            <div class="notebook-line bottom-black" title="4th Line (Bottom Black)"></div>
            <div class="notebook-text-overlay" id="notebook-text"></div>
          </div>
        </div>

        <!-- Hidden/Active Typing Input Box -->
        <div class="dictation-input-box" style="margin-top: 6px;">
          <input type="text" id="dictation-input" class="dictation-input" placeholder="${isExpr ? '대소문자/문장부호/띄어쓰기 엄격 입력...' : '스펠링 엄격 입력...'}" autocomplete="off" style="font-size: 1.2rem;" />
          <button id="btn-submit-answer" class="btn-primary" style="font-size: 1.2rem; padding: 12px 36px;">
            제출하기 ➔
          </button>
        </div>
      </div>
    `;

    // Speak automatically
    setTimeout(() => sound.speak(currentObj.word), 300);

    const inputEl = container.querySelector('#dictation-input');
    const notebookOverlay = container.querySelector('#notebook-text');
    inputEl.focus();

    // Sync typing to 4-line notebook
    inputEl.addEventListener('input', (e) => {
      notebookOverlay.innerText = e.target.value;
    });

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
      const val = inputEl.value.trim();
      if (!val) return;

      // STRICT EXACT MATCH: Case, Punctuation (. ? !), Spacing must match 100%!
      const targetExact = currentObj.word.trim();
      const isCorrect = (val === targetExact);

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
        wrongList.push({
          word: currentObj.word,
          meaning: currentObj.meaning,
          isExpression: isExpr
        });
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
        <div class="teacher-avatar" style="font-size: 5rem; width: 100px; height: 100px; margin-bottom: 10px;">👩‍🏫</div>
        <h2 style="font-size: 2rem; font-weight: 900; background: linear-gradient(90deg, #fbbf24, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          받아쓰기 시험 성적표
        </h2>
        <div style="font-size: 2rem; font-weight: 900; margin: 8px 0; color: #fbbf24;">
          ${stars} (${totalScore}점)
        </div>

        <div style="width: 100%; max-width: 520px; text-align: left; margin: 14px 0; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 16px; max-height: 240px; overflow-y: auto;">
          <h4 style="margin-bottom: 10px; color: var(--text-muted);">시험 결과 세부사항:</h4>
          ${userAnswers.map((ans, i) => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem;">
              <span>${i + 1}. [${ans.wordObj.isExpression ? '표현' : '단어'}] 정답: <strong>${ans.wordObj.word}</strong></span>
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
      onFinishExam(totalScore, wrongList);
    });
  }

  renderExamQuestion();
}
