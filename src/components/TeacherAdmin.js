import { sound } from '../services/sound.js';
import { GRADES, UNITS, getUnitContent, saveCustomTeacherUnit, resetCustomTeacherUnit, resetAllCustomTeacherUnits } from '../data/words.js';

export function renderTeacherAdmin(container, onBack) {
  let selectedGrade = 'grade5';
  let selectedUnit = 1;
  let isPinVerified = localStorage.getItem('kids_teacher_verified') === 'true';
  const TEACHER_PIN = '1234'; // Default teacher PIN

  function renderPinScreen() {
    container.innerHTML = `
      <div class="game-container glass-card" style="max-width: 480px; margin: 40px auto; text-align: center; padding: 32px;">
        <span style="font-size: 3.5rem;">👩‍🏫</span>
        <h2 style="font-size: 1.8rem; font-weight: 900; margin: 12px 0; color: #a855f7;">선생님 전용 비밀번호 입력</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px;">
          단어 등록 및 시험 문제를 수정하려면 선생님 PIN 번호를 입력하세요.<br>
          <span style="color: #fbbf24; font-weight: 700;">(기본 비밀번호: 1234)</span>
        </p>
        
        <input type="password" id="teacher-pin-input" class="dictation-input" placeholder="PIN 번호 4자리..." maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 6px; margin-bottom: 16px;" />
        
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="btn-pin-cancel" class="btn-secondary" style="padding: 10px 24px;">◀ 뒤로가기</button>
          <button id="btn-pin-submit" class="btn-primary" style="padding: 10px 28px; background: linear-gradient(135deg, #a855f7, #ec4899);">로그인 🔓</button>
        </div>
      </div>
    `;

    const pinInput = container.querySelector('#teacher-pin-input');
    pinInput.focus();

    container.querySelector('#btn-pin-cancel').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    const checkPin = () => {
      if (pinInput.value.trim() === TEACHER_PIN) {
        sound.playCorrect();
        localStorage.setItem('kids_teacher_verified', 'true');
        isPinVerified = true;
        renderAdminDashboard();
      } else {
        sound.playWrong();
        alert('비밀번호가 올바르지 않습니다. (기본 비밀번호: 1234)');
        pinInput.value = '';
        pinInput.focus();
      }
    };

    container.querySelector('#btn-pin-submit').addEventListener('click', checkPin);
    pinInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') checkPin();
    });
  }

  function renderAdminDashboard() {
    const currentUnitData = getUnitContent(selectedGrade, selectedUnit);
    const wordsList = currentUnitData.words || [];
    const exprsList = currentUnitData.expressions || [];

    const gradeObj = GRADES.find(g => g.key === selectedGrade);
    const gradeName = gradeObj ? gradeObj.name : '5학년';

    container.innerHTML = `
      <div class="game-container glass-card" style="max-width: 900px; margin: 20px auto; padding: 28px;">
        <!-- Admin Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: #a855f7; display: flex; align-items: center; gap: 10px;">
              <span>👩‍🏫</span> 선생님 단어 & 문장 관리센터
            </h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
              단원별 단어와 주요 표현을 등록/수정하여 미니게임과 받아쓰기 시험에 즉시 반영하세요.
            </p>
          </div>
          <button id="btn-admin-exit" class="btn-secondary" style="padding: 8px 20px;">◀ 나가기</button>
        </div>

        <!-- Grade & Unit Selection Bar -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15); display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 24px;">
          <div>
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">학년 선택</label>
            <select id="admin-grade-select" class="nav-select" style="font-size: 1rem; padding: 8px 16px; background: rgba(30, 41, 59, 0.9); border-color: #a855f7;">
              ${GRADES.map(g => `<option value="${g.key}" ${g.key === selectedGrade ? 'selected' : ''}>${g.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">단원 선택</label>
            <select id="admin-unit-select" class="nav-select" style="font-size: 1rem; padding: 8px 16px; background: rgba(30, 41, 59, 0.9); border-color: #a855f7;">
              ${UNITS.map(u => `<option value="${u.unit}" ${u.unit === selectedUnit ? 'selected' : ''}>${u.name}</option>`).join('')}
            </select>
          </div>

          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button id="btn-reset-this-unit" class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #fca5a5;" title="이 단원의 선생님 수정본을 삭제하고 초기 교과서 단어로 복원">
              ↩️ 이 단원 초기 교과서 단어로 복원
            </button>
          </div>
        </div>

        <!-- 📤 File Upload & Batch Text Input Section -->
        <div style="background: rgba(168, 85, 247, 0.08); border: 2px dashed #a855f7; border-radius: 18px; padding: 20px; margin-bottom: 28px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #c084fc; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span>📤</span> 엑셀 / CSV / 텍스트 일괄 파일 업로드
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
            단어 또는 주요 표현이 포함된 텍스트/CSV 파일을 올리거나 직접 붙여넣으세요.<br>
            <span style="color: #fbbf24;">(형식: 영단어, 한글뜻 / 예시: apple, 사과 / I'm from Korea., 나는 한국에서 왔어.)</span>
          </p>

          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
            <input type="file" id="batch-file-input" accept=".txt,.csv" style="display: none;" />
            <button id="btn-trigger-file" class="btn-secondary" style="font-size: 0.9rem; padding: 8px 18px;">
              📁 파일 찾기...
            </button>
            <button id="btn-sample-download" class="btn-secondary" style="font-size: 0.85rem; padding: 6px 14px; background: rgba(255,255,255,0.08);">
              📥 예시 CSV 양식 다운로드
            </button>
          </div>

          <textarea id="batch-text-area" rows="3" class="dictation-input" placeholder="여기에 단어를 직접 붙여넣으셔도 됩니다!&#10;예시:&#10;apple, 사과&#10;banana, 바나나&#10;I'm from Brazil., 나는 브라질에서 왔어." style="width: 100%; font-size: 0.9rem; font-family: monospace; resize: vertical; margin-bottom: 14px;"></textarea>

          <!-- 3 Apply Mode Buttons -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
            <button id="btn-apply-append" class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); font-size: 0.95rem; padding: 10px 20px;">
              ➕ 기존 단어에 추가하기
            </button>
            <button id="btn-apply-replace" class="btn-primary" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); font-size: 0.95rem; padding: 10px 20px;">
              🔄 기존 단어 지우고 덮어쓰기
            </button>
          </div>
        </div>

        <!-- 📋 Current Unit Content Management Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff;">
            📋 [${gradeName} - ${selectedUnit}단원] 등록된 목록 (${wordsList.length}개 단어 / ${exprsList.length}개 표현)
          </h3>
          <button id="btn-add-single-word" class="btn-primary" style="padding: 6px 16px; font-size: 0.85rem; background: linear-gradient(135deg, #3b82f6, #10b981);">
            + 단어/표현 개별 직접 추가
          </button>
        </div>

        <!-- Words Table -->
        <div style="background: rgba(15, 23, 42, 0.6); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.08); color: #c084fc; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <th style="padding: 12px 16px; width: 60px;">번호</th>
                <th style="padding: 12px 16px; width: 80px;">구분</th>
                <th style="padding: 12px 16px;">영어 (스펠링/문장)</th>
                <th style="padding: 12px 16px;">한글 뜻</th>
                <th style="padding: 12px 16px; width: 100px; text-align: center;">관리</th>
              </tr>
            </thead>
            <tbody>
              ${wordsList.map((w, idx) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 10px 16px; color: var(--text-muted);">${idx + 1}</td>
                  <td style="padding: 10px 16px;"><span class="tag-pill" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 0.75rem;">단어</span></td>
                  <td style="padding: 10px 16px; font-weight: 800; color: #fff;">${w.word}</td>
                  <td style="padding: 10px 16px; color: #e2e8f0;">${w.meaning}</td>
                  <td style="padding: 10px 16px; text-align: center;">
                    <button class="btn-delete-item" data-type="word" data-index="${idx}" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; cursor: pointer;">삭제</button>
                  </td>
                </tr>
              `).join('')}

              ${exprsList.map((e, idx) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(168, 85, 247, 0.05);">
                  <td style="padding: 10px 16px; color: var(--text-muted);">${wordsList.length + idx + 1}</td>
                  <td style="padding: 10px 16px;"><span class="tag-pill" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-size: 0.75rem;">주요표현</span></td>
                  <td style="padding: 10px 16px; font-weight: 800; color: #fbbf24;">${e.expression}</td>
                  <td style="padding: 10px 16px; color: #e2e8f0;">${e.meaning}</td>
                  <td style="padding: 10px 16px; text-align: center;">
                    <button class="btn-delete-item" data-type="expression" data-index="${idx}" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; cursor: pointer;">삭제</button>
                  </td>
                </tr>
              `).join('')}

              ${wordsList.length === 0 && exprsList.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    등록된 단어가 없습니다. 위에서 단어를 업로드하거나 직접 추가해 보세요!
                  </td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event Handlers
    container.querySelector('#btn-admin-exit').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#admin-grade-select').addEventListener('change', (e) => {
      selectedGrade = e.target.value;
      renderAdminDashboard();
    });

    container.querySelector('#admin-unit-select').addEventListener('change', (e) => {
      selectedUnit = parseInt(e.target.value);
      renderAdminDashboard();
    });

    container.querySelector('#btn-reset-this-unit').addEventListener('click', () => {
      if (confirm(`[${gradeName} ${selectedUnit}단원]의 선생님 수정본을 삭제하고 처음 기본 교과서 단어로 복원하시겠습니까?`)) {
        sound.playPop();
        resetCustomTeacherUnit(selectedGrade, selectedUnit);
        alert('기본 교과서 단어로 복원되었습니다!');
        renderAdminDashboard();
      }
    });

    // File Trigger
    const fileInput = container.querySelector('#batch-file-input');
    container.querySelector('#btn-trigger-file').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        container.querySelector('#batch-text-area').value = evt.target.result;
        sound.playPop();
        alert('파일을 읽어왔습니다! 아래 [기존 단어에 추가하기] 또는 [기존 단어 지우고 덮어쓰기] 버튼을 눌러주세요.');
      };
      reader.readAsText(file);
    });

    // Sample Download
    container.querySelector('#btn-sample-download').addEventListener('click', () => {
      const sampleText = "apple, 사과\nbanana, 바나나\ncat, 고양이\nI'm from Korea., 나는 한국에서 왔어.\nWhere are you from?, 너는 어디 출신이니?";
      const blob = new Blob([sampleText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '단어_입력_양식_예시.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Parse batch text into words and expressions
    function parseBatchInputText(rawText) {
      const lines = rawText.split('\n');
      const newWords = [];
      const newExprs = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Split by comma or tab
        const parts = trimmed.split(/,|\t/).map(p => p.trim());
        if (parts.length >= 2) {
          const eng = parts[0];
          const kor = parts[1];
          const hint = parts[2] || '';

          if (eng.includes(' ') && (eng.includes('.') || eng.includes('?') || eng.split(' ').length > 2)) {
            // Expression / Sentence
            newExprs.push({ expression: eng, meaning: kor, hint });
          } else {
            // Word
            newWords.push({ word: eng, meaning: kor, hint });
          }
        }
      });

      return { newWords, newExprs };
    }

    // Apply Append
    container.querySelector('#btn-apply-append').addEventListener('click', () => {
      const text = container.querySelector('#batch-text-area').value;
      const { newWords, newExprs } = parseBatchInputText(text);

      if (newWords.length === 0 && newExprs.length === 0) {
        alert('추가할 단어나 문장을 텍스트 상자에 입력하거나 파일을 올린 후 눌러주세요!');
        return;
      }

      const mergedWords = [...wordsList, ...newWords];
      const mergedExprs = [...exprsList, ...newExprs];

      saveCustomTeacherUnit(selectedGrade, selectedUnit, { words: mergedWords, expressions: mergedExprs });
      sound.playCorrect();
      alert(`🎉 성공적으로 추가되었습니다!\n(단어 ${newWords.length}개, 주요표현 ${newExprs.length}개 추가됨)`);
      renderAdminDashboard();
    });

    // Apply Replace
    container.querySelector('#btn-apply-replace').addEventListener('click', () => {
      const text = container.querySelector('#batch-text-area').value;
      const { newWords, newExprs } = parseBatchInputText(text);

      if (newWords.length === 0 && newExprs.length === 0) {
        alert('교체할 단어나 문장을 텍스트 상자에 입력하거나 파일을 올린 후 눌러주세요!');
        return;
      }

      if (confirm(`기존의 단어목록을 모두 삭제하고, 새 파일의 단어들로 교체하시겠습니까?`)) {
        saveCustomTeacherUnit(selectedGrade, selectedUnit, { words: newWords, expressions: newExprs });
        sound.playCorrect();
        alert(`🔄 새 단어로 교체되었습니다!\n(단어 ${newWords.length}개, 주요표현 ${newExprs.length}개 반영됨)`);
        renderAdminDashboard();
      }
    });

    // Add Single Item
    container.querySelector('#btn-add-single-word').addEventListener('click', () => {
      const type = prompt('추가할 단어 구분을 입력하세요:\n1: 영단어\n2: 주요표현 문장', '1');
      if (!type) return;

      if (type === '1') {
        const word = prompt('영단어를 입력하세요 (예: apple):');
        if (!word) return;
        const meaning = prompt('한글 뜻을 입력하세요 (예: 사과):');
        if (!meaning) return;

        const updatedWords = [...wordsList, { word: word.trim(), meaning: meaning.trim() }];
        saveCustomTeacherUnit(selectedGrade, selectedUnit, { words: updatedWords, expressions: exprsList });
        sound.playPop();
        renderAdminDashboard();
      } else if (type === '2') {
        const expr = prompt("영문장을 입력하세요 (예: I'm from Korea.):");
        if (!expr) return;
        const meaning = prompt('한글 뜻을 입력하세요 (예: 나는 한국에서 왔어.):');
        if (!meaning) return;

        const updatedExprs = [...exprsList, { expression: expr.trim(), meaning: meaning.trim() }];
        saveCustomTeacherUnit(selectedGrade, selectedUnit, { words: wordsList, expressions: updatedExprs });
        sound.playPop();
        renderAdminDashboard();
      }
    });

    // Delete Single Item
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const index = parseInt(btn.getAttribute('data-index'));

        if (confirm('이 단어를 목록에서 삭제하시겠습니까?')) {
          sound.playPop();
          let updatedWords = [...wordsList];
          let updatedExprs = [...exprsList];

          if (type === 'word') {
            updatedWords.splice(index, 1);
          } else {
            updatedExprs.splice(index, 1);
          }

          saveCustomTeacherUnit(selectedGrade, selectedUnit, { words: updatedWords, expressions: updatedExprs });
          renderAdminDashboard();
        }
      });
    });
  }

  if (isPinVerified) {
    renderAdminDashboard();
  } else {
    renderPinScreen();
  }
}
