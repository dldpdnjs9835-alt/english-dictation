import { sound } from '../services/sound.js';
import { AVATARS } from '../data/words.js';
import { loginWithGoogle, loginAnonymously, logoutUser, isFirebaseReady } from '../services/firebase.js';

export function renderAuthModal(container, user, onSaveUser, onClose) {
  let selectedAvatar = user.avatar || AVATARS[0];

  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content glass-card">
        <button class="modal-close-btn" id="modal-close">✖</button>
        
        <h2 style="font-size: 1.6rem; font-weight: 900; margin-bottom: 6px; text-align: center;">
          👦 프로필 & 로그인 설정
        </h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; text-align: center; margin-bottom: 20px;">
          닉네임과 아바타를 설정하고 랭킹 명예의 전당에 이름을 올려보세요!
        </p>

        <!-- Avatar Selection -->
        <div style="margin-bottom: 18px;">
          <label style="font-weight: 700; display: block; margin-bottom: 8px;">아바타 선택:</label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;" id="avatar-picker">
            ${AVATARS.map(av => `
              <button class="avatar-option-btn ${av === selectedAvatar ? 'active' : ''}" data-avatar="${av}" style="font-size: 2rem; background: ${av === selectedAvatar ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 50px; height: 50px; cursor: pointer; transition: all 0.2s;">
                ${av}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Nickname Input -->
        <div style="margin-bottom: 20px;">
          <label style="font-weight: 700; display: block; margin-bottom: 6px;">어린이 닉네임:</label>
          <input type="text" id="nickname-input" class="dictation-input" style="font-size: 1.1rem; padding: 10px 18px; width: 100%; border-radius: var(--radius-md);" value="${user.name}" placeholder="닉네임 입력..." />
        </div>

        <!-- Firebase Auth Option -->
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px; text-align: center;">
          <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--text-muted);">
            ${isFirebaseReady ? '🔥 Firebase 연동 상태' : 'ℹ️ 데모 오프라인 모드'}
          </h4>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button id="btn-google-login" class="btn-secondary" style="background: #ea4335; color: white; border: none;">
              🌐 Google 로그인
            </button>
            <button id="btn-anon-login" class="btn-secondary">
              👤 익명 로그인
            </button>
          </div>
        </div>

        <!-- Save Button -->
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="btn-save-profile" class="btn-primary" style="width: 100%;">설정 완료 💾</button>
        </div>
      </div>
    </div>
  `;

  // Avatar selector
  container.querySelectorAll('.avatar-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playPop();
      selectedAvatar = btn.getAttribute('data-avatar');
      container.querySelectorAll('.avatar-option-btn').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.08)';
      });
      btn.style.background = 'var(--primary)';
    });
  });

  // Modal Close
  container.querySelector('#modal-close').addEventListener('click', () => {
    sound.playPop();
    onClose();
  });

  // Save Profile
  container.querySelector('#btn-save-profile').addEventListener('click', () => {
    sound.playPop();
    const nameVal = container.querySelector('#nickname-input').value.trim() || user.name;
    onSaveUser({
      ...user,
      name: nameVal,
      avatar: selectedAvatar
    });
    onClose();
  });

  // Auth Handlers
  container.querySelector('#btn-google-login').addEventListener('click', async () => {
    sound.playPop();
    try {
      const fbUser = await loginWithGoogle();
      onSaveUser({
        ...user,
        id: fbUser.uid,
        name: fbUser.displayName || user.name,
        avatar: selectedAvatar,
        isAnonymous: false
      });
      alert(`🎉 Google 로그인 성공! 환영합니다, ${fbUser.displayName || '어린이'}님!`);
      onClose();
    } catch (err) {
      alert(`로그인 안내: ${err.message}`);
    }
  });

  container.querySelector('#btn-anon-login').addEventListener('click', async () => {
    sound.playPop();
    try {
      const fbUser = await loginAnonymously();
      onSaveUser({
        ...user,
        id: fbUser.uid,
        isAnonymous: true
      });
      alert("🎉 익명 로그인 성공!");
      onClose();
    } catch (err) {
      alert(`로그인 안내: ${err.message}`);
    }
  });
}
