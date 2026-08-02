import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export function renderMyPage(container, user, onSaveUser, onBack) {
  let activeTab = 'history'; // 'history' or 'wrongWords'
  let examHistory = user.examHistory || [];
  let wrongWords = user.wrongWords || [];

  function renderView() {
    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-mypage-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #ec4899;">
            👤 마이페이지 (My Page)
          </h2>
          <div style="font-size: 0.95rem; color: #fbbf24; font-weight: 700;">
            🎟️ 티켓: ${user.tickets}장 | ⭐ 만점: ${user.perfectScoreCount || 0}회
          </div>
        </div>

        <!-- User Info Summary Card -->
        <div style="display: flex; align-items: center; gap: 16px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 16px; margin: 10px 0;">
          <div style="font-size: 3.2rem; background: rgba(255,255,255,0.1); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            ${user.avatar || '👦'}
          </div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">${user.name}</h3>
            <p style="font-size: 0.95rem; color: var(--text-muted);">
              클리어한 미니게임: <strong>${user.gamesCleared}회</strong> | 최고 시험 점수: <strong>${user.dictationHighScore}점</strong>
            </p>
          </div>
        </div>

        <!-- MyPage Tabs -->
        <div class="hof-tabs">
          <div class="hof-tab ${activeTab === 'history' ? 'active' : ''}" id="tab-history">
            📚 단원별 시험 성적표 (${examHistory.length})
          </div>
          <div class="hof-tab ${activeTab === 'wrongWords' ? 'active' : ''}" id="tab-wrong">
            ✍️ 자주 틀리는 단어장 (${wrongWords.length})
          </div>
        </div>

        <!-- Content Area -->
        <div class="mypage-content" style="margin-top: 14px;">
          ${activeTab === 'history' ? renderHistorySection() : renderWrongWordsSection()}
        </div>
      </div>
    `;

    container.querySelector('#btn-mypage-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#tab-history').addEventListener('click', () => {
      sound.playPop();
      activeTab = 'history';
      renderView();
    });

    container.querySelector('#tab-wrong').addEventListener('click', () => {
      sound.playPop();
      activeTab = 'wrongWords';
      renderView();
    });

    attachTabEvents();
  }

  function renderScoreTrendChart(history) {
    if (!history || history.length === 0) return '';
    
    // Sort oldest to newest (last 10 entries)
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp).slice(-10);
    if (sorted.length < 1) return '';

    const width = 500;
    const height = 140;
    const paddingX = 40;
    const paddingY = 25;

    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = sorted.map((rec, i) => {
      const x = sorted.length === 1 ? width / 2 : paddingX + (i / (sorted.length - 1)) * chartW;
      const y = (height - paddingY) - (rec.score / 100) * chartH;
      return { x, y, score: rec.score, label: `${rec.unitName || '시험'}` };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return `
      <div style="background: rgba(15, 23, 42, 0.6); border-radius: 16px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h4 style="font-size: 1rem; font-weight: 800; color: #f472b6; margin-bottom: 8px;">
          📈 받아쓰기 시험 성적 변화 추이 (최근 ${sorted.length}회)
        </h4>
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 140px; overflow: visible;">
          <!-- Grid Lines -->
          <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4" />
          <line x1="${paddingX}" y1="${paddingY + chartH / 2}" x2="${width - paddingX}" y2="${paddingY + chartH / 2}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4" />
          <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.2)" />

          <!-- Y Axis Labels -->
          <text x="${paddingX - 10}" y="${paddingY + 4}" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="end">100</text>
          <text x="${paddingX - 10}" y="${paddingY + chartH / 2 + 4}" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="end">50</text>
          <text x="${paddingX - 10}" y="${height - paddingY + 4}" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="end">0</text>

          <!-- Gradient Area -->
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ec4899" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#ec4899" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <path d="${areaD}" fill="url(#chartGradient)" />

          <!-- Line Path -->
          <path d="${pathD}" fill="none" stroke="#ec4899" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" />

          <!-- Data Points & Score Badges -->
          ${points.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="6" fill="#fbbf24" stroke="#fff" stroke-width="2" />
            <text x="${p.x}" y="${p.y - 10}" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">${p.score}점</text>
          `).join('')}
        </svg>
      </div>
    `;
  }

  function renderHistorySection() {
    if (!examHistory || examHistory.length === 0) {
      return `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 3rem;">📝</span>
          <p style="margin-top: 10px;">아직 응시한 받아쓰기 시험 기록이 없습니다.<br>티켓을 모아 받아쓰기 시험에 도전해보세요!</p>
        </div>
      `;
    }

    return `
      ${renderScoreTrendChart(examHistory)}

      <div style="max-height: 240px; overflow-y: auto; padding-right: 6px;">
        ${examHistory.map(rec => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);">
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #fbbf24;">
                ${rec.gradeName || '5학년'} - ${rec.unitName || '단원'}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                응시일: ${new Date(rec.timestamp).toLocaleDateString()}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.2rem; font-weight: 900; color: ${rec.score === 100 ? '#10b981' : rec.score >= 60 ? '#3b82f6' : '#ef4444'};">
                ${rec.score}점
              </div>
              <div style="font-size: 0.85rem;">
                ${rec.score === 100 ? '⭐⭐⭐ 만점!' : rec.score >= 60 ? '⭐⭐ 통과' : '⭐ 노력함'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderWrongWordsSection() {
    if (!wrongWords || wrongWords.length === 0) {
      return `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 3rem;">🎉</span>
          <p style="margin-top: 10px; font-weight: 700; color: #10b981;">참 잘했어요! 틀린 단어가 하나도 없습니다.</p>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--text-muted); font-size: 0.95rem;">오답 단어 총 <strong>${wrongWords.length}개</strong></span>
        <div style="display: flex; gap: 8px;">
          <button id="btn-practice-wrong" class="btn-primary" style="padding: 6px 16px; font-size: 0.9rem; background: linear-gradient(135deg, #10b981, #059669);">
            🎯 오답 단어 복습 퀴즈
          </button>
          <button id="btn-clear-wrong" class="btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;">
            단어장 비우기 🗑️
          </button>
        </div>
      </div>

      <div style="max-height: 260px; overflow-y: auto; padding-right: 6px;">
        ${wrongWords.map((item, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.15); padding: 10px 16px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
            <div>
              <span style="font-weight: 800; font-size: 1.1rem; color: #fff;">${item.word}</span>
              <span style="font-size: 0.85rem; color: #fca5a5; margin-left: 8px;">[${item.isExpression ? '표현' : '단어'}]</span>
              <div style="font-size: 0.9rem; color: var(--text-muted);">${item.meaning}</div>
            </div>
            <button class="btn-secondary btn-remove-word" data-index="${idx}" style="padding: 4px 10px; font-size: 0.8rem;">
              삭제 ✖
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function attachTabEvents() {
    if (activeTab === 'wrongWords') {
      const practiceBtn = container.querySelector('#btn-practice-wrong');
      const clearBtn = container.querySelector('#btn-clear-wrong');

      if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
          sound.playPop();
          startWrongWordsQuiz();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (confirm('자주 틀리는 단어장을 모두 비우시겠습니까?')) {
            sound.playPop();
            user.wrongWords = [];
            onSaveUser(user);
            renderView();
          }
        });
      }

      container.querySelectorAll('.btn-remove-word').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-index'));
          sound.playPop();
          user.wrongWords.splice(idx, 1);
          onSaveUser(user);
          renderView();
        });
      });
    }
  }

  function startWrongWordsQuiz() {
    if (!wrongWords || wrongWords.length === 0) return;
    
    let qIdx = 0;
    const quizItems = [...wrongWords].sort(() => 0.5 - Math.random());

    function renderQuizStage() {
      const current = quizItems[qIdx];
      container.innerHTML = `
        <div class="game-container glass-card">
          <div class="game-header">
            <button id="btn-quiz-exit" class="btn-secondary">◀ 마이페이지로</button>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: #10b981;">🎯 오답 단어 복습 퀴즈</h2>
            <div class="game-stats">
              <span class="stat-item" style="color: #fbbf24;">진행: ${qIdx + 1} / ${quizItems.length}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 16px 0;">
            <div style="font-size: 1.3rem; font-weight: 800; color: #fff;">뜻: ${current.meaning}</div>
            <button id="btn-quiz-speak" class="btn-secondary" style="margin-top: 10px;">🔊 소리 듣기</button>
          </div>

          <div class="dictation-input-box" style="margin-top: 20px;">
            <input type="text" id="quiz-input" class="dictation-input" placeholder="정답 스펠링 입력..." autocomplete="off" />
            <button id="btn-quiz-submit" class="btn-primary">제출 ➔</button>
          </div>
        </div>
      `;

      sound.speak(current.word);
      const inputEl = container.querySelector('#quiz-input');
      inputEl.focus();

      container.querySelector('#btn-quiz-exit').addEventListener('click', () => {
        sound.playPop();
        renderView();
      });

      container.querySelector('#btn-quiz-speak').addEventListener('click', () => {
        sound.speak(current.word);
      });

      const submitQuiz = () => {
        const val = inputEl.value.trim().toLowerCase();
        if (val === current.word.toLowerCase()) {
          sound.playCorrect();
          // Remove from user.wrongWords
          user.wrongWords = user.wrongWords.filter(w => w.word !== current.word);
          onSaveUser(user);

          qIdx++;
          if (qIdx < quizItems.length) {
            setTimeout(renderQuizStage, 700);
          } else {
            sound.playTicketReward();
            confetti({ particleCount: 80, spread: 70 });
            alert("🎉 모든 오답 단어를 완벽하게 복습했습니다!");
            renderView();
          }
        } else {
          sound.playWrong();
          alert(`아쉬워요! 정답은 '${current.word}' 입니다.`);
        }
      };

      container.querySelector('#btn-quiz-submit').addEventListener('click', submitQuiz);
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitQuiz();
      });
    }

    renderQuizStage();
  }

  renderView();
}
