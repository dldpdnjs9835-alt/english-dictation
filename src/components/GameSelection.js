import { sound } from '../services/sound.js';

export function renderGameSelection(container, user, onSelectGame) {
  container.innerHTML = `
    <div class="hero-banner main-view">
      <h1 class="hero-title">신나는 <span>영어 단어 모험!</span></h1>
      <p class="hero-subtitle">미니게임을 즐기고 🎟️ 티켓을 모아 가상 선생님과 받아쓰기 시험에 도전해봐!</p>
    </div>

    <!-- Game Cards Grid -->
    <div class="game-grid">
      <!-- Game 1 -->
      <div class="game-card glass-card" id="btn-game1" style="--card-accent: #ec4899; --card-glow: rgba(236, 72, 153, 0.4);">
        <div class="game-icon-box">🔍</div>
        <div class="reward-pill">보상: 티켓 🎟️ +1</div>
        <h3 class="game-title">단어 숨은그림찾기</h3>
        <p class="game-desc">10x10 글자 판 속에 가로, 세로, 대각선으로 몰래 숨어 있는 긴 영단어까지 찾아봐!</p>
        <button class="btn-primary" style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);">게임 시작</button>
      </div>

      <!-- Game 2 -->
      <div class="game-card glass-card" id="btn-game2" style="--card-accent: #3b82f6; --card-glow: rgba(59, 130, 246, 0.4);">
        <div class="game-icon-box">🃏</div>
        <div class="reward-pill">보상: 티켓 🎟️ +1</div>
        <h3 class="game-title">단어 카드 짝맞추기</h3>
        <p class="game-desc">뒤집힌 카드에서 영어 단어와 알맞은 뜻/그림 짝을 맞춰봐!</p>
        <button class="btn-primary" style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">게임 시작</button>
      </div>

      <!-- Game 3 -->
      <div class="game-card glass-card" id="btn-game3" style="--card-accent: #10b981; --card-glow: rgba(16, 185, 129, 0.4);">
        <div class="game-icon-box">🎧</div>
        <div class="reward-pill">보상: 티켓 🎟️ +1</div>
        <h3 class="game-title">소리듣고 빈칸 채우기</h3>
        <p class="game-desc">선생님 발음을 듣고 단어 속 쏙 빠진 1~2개 핵심 빈칸 알파벳만 스피드하게 맞춰보세요!</p>
        <button class="btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #f59e0b 100%);">게임 시작</button>
      </div>

      <!-- Game 4 -->
      <div class="game-card glass-card" id="btn-game4" style="--card-accent: #a855f7; --card-glow: rgba(168, 85, 247, 0.4);">
        <div class="game-icon-box">🧩</div>
        <div class="reward-pill">보상: 티켓 🎟️ +1</div>
        <h3 class="game-title">문장 단어 순서 맞추기</h3>
        <p class="game-desc">선생님이 들려주는 영문장의 뜻을 보고 흩어진 단어 조각을 순서대로 맞추는 퍼즐!</p>
        <button class="btn-primary" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);">게임 시작</button>
      </div>

      <!-- Dictation Exam (Requires Ticket) -->
      <div class="game-card glass-card exam-card" id="btn-exam" style="--card-accent: #f59e0b; --card-glow: rgba(245, 158, 11, 0.5);">
        <div class="game-icon-box">👩‍🏫</div>
        <div class="reward-pill" style="background: rgba(245, 158, 11, 0.25); color: #fbbf24;">필요: 티켓 🎟️ 1장 소모</div>
        <h3 class="game-title">받아쓰기 시험</h3>
        <p class="game-desc">선생님이 읽어주는 발음을 듣고 정확한 스펠링을 적어 명예의 전당에 도전해봐!</p>
        <button class="btn-primary" style="background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%);">
          ${user.tickets > 0 ? '시험 도전하기 🎟️' : '티켓 부족! 미니게임하기'}
        </button>
      </div>
    </div>

    <!-- Hall of Fame Banner -->
    <div class="hall-banner-card glass-card" id="btn-hof" style="margin-top: 16px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 2.8rem;">🏆</span>
        <div class="hall-banner-info">
          <h3>명예의 전당 (Hall of Fame Top 10)</h3>
          <p>티켓을 가장 많이 모은 티켓 부자 왕과 미니게임 클리어 왕 10위를 확인하세요!</p>
        </div>
      </div>
      <button class="btn-secondary">랭킹 확인 🏅</button>
    </div>
  `;

  // Attach Event Handlers
  container.querySelector('#btn-game1').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('game1');
  });

  container.querySelector('#btn-game2').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('game2');
  });

  container.querySelector('#btn-game3').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('game3');
  });

  container.querySelector('#btn-game4').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('game4');
  });

  container.querySelector('#btn-exam').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('exam');
  });

  container.querySelector('#btn-hof').addEventListener('click', () => {
    sound.playPop();
    onSelectGame('hof');
  });
}
