import { GRADE_5_DATA } from './grade5_data.js';

// Grade 1-6 Elementary English Dataset with 1~12 Units
export const GRADES = [
  { key: 'grade1', name: '초등학교 1학년' },
  { key: 'grade2', name: '초등학교 2학년' },
  { key: 'grade3', name: '초등학교 3학년' },
  { key: 'grade4', name: '초등학교 4학년' },
  { key: 'grade5', name: '초등학교 5학년 (YBM 김)' },
  { key: 'grade6', name: '초등학교 6학년' }
];

export const UNITS = Array.from({ length: 12 }, (_, i) => ({
  unit: i + 1,
  name: `${i + 1}단원`
}));

// Base word pool for Grades 1, 2, 3, 4, 6
const GENERAL_GRADE_WORDS = {
  grade1: [
    { word: 'cat', meaning: '고양이', hint: '야옹하고 우는 동물' },
    { word: 'dog', meaning: '개/강아지', hint: '멍멍 짖는 동물' },
    { word: 'sun', meaning: '태양', hint: '밝게 빛나요' },
    { word: 'cup', meaning: '컵', hint: '물이 담긴 잔' },
    { word: 'pen', meaning: '펜', hint: '글씨 쓰는 도구' },
    { word: 'hat', meaning: '모자', hint: '머리에 쓰는 옷' }
  ],
  grade2: [
    { word: 'apple', meaning: '사과', hint: '달콤한 과일' },
    { word: 'book', meaning: '책', hint: '읽는 글' },
    { word: 'milk', meaning: '우유', hint: '하얀 음료' },
    { word: 'star', meaning: '별', hint: '밤하늘 별' },
    { word: 'fish', meaning: '물고기', hint: '물속 헤엄' },
    { word: 'duck', meaning: '오리', hint: '꽥꽥' }
  ],
  grade3: [
    { word: 'banana', meaning: '바나나', hint: '노란 과일' },
    { word: 'pencil', meaning: '연필', hint: '필기도구' },
    { word: 'friend', meaning: '친구', hint: '함께 노는 사람' },
    { word: 'school', meaning: '학교', hint: '공부하는 곳' },
    { word: 'yellow', meaning: '노란색', hint: '개나리색' },
    { word: 'rabbit', meaning: '토끼', hint: '귀가 긴 동물' }
  ],
  grade4: [
    { word: 'flower', meaning: '꽃', hint: '예쁜 식물' },
    { word: 'family', meaning: '가족', hint: '사랑하는 식구' },
    { word: 'doctor', meaning: '의사', hint: '환자를 고치는 사람' },
    { word: 'orange', meaning: '오렌지', hint: '새콤 과일' },
    { word: 'monkey', meaning: '원숭이', hint: '바나나 좋아해' },
    { word: 'winter', meaning: '겨울', hint: '눈 내리는 계절' }
  ],
  grade6: [
    { word: 'computer', meaning: '컴퓨터', hint: '전자기기' },
    { word: 'beautiful', meaning: '아름다운', hint: '매우 예쁜' },
    { word: 'elephant', meaning: '코끼리', hint: '코가 긴 동물' },
    { word: 'tomorrow', meaning: '내일', hint: '오늘 다음날' },
    { word: 'dinosaur', meaning: '공룡', hint: '고대 거대 동물' },
    { word: 'favorite', meaning: '가장 좋아하는', hint: '제일 선호하는' }
  ]
};

// General expressions pool for fallback grades
const GENERAL_EXPRESSIONS = [
  { expression: 'How are you?', meaning: '기분이 어떠니?', hint: '기분 묻기' },
  { expression: "I'm happy.", meaning: '나는 행복해.', hint: '상태 말하기' },
  { expression: 'What color is it?', meaning: '무슨 색이니?', hint: '색상 묻기' },
  { expression: 'It is yellow.', meaning: '노란색이야.', hint: '색상 대답' },
  { expression: 'Nice to meet you.', meaning: '만나서 반가워.', hint: '인사하기' },
  { expression: 'Thank you very much.', meaning: '정말 고마워.', hint: '감사하기' }
];

// Helper functions for Custom Teacher Units (localStorage persistence)
export function getCustomTeacherUnits() {
  try {
    const raw = localStorage.getItem('kids_english_custom_units');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomTeacherUnit(gradeKey, unitNum, unitContent) {
  const custom = getCustomTeacherUnits();
  const key = `${gradeKey}_unit${unitNum}`;
  custom[key] = unitContent;
  localStorage.setItem('kids_english_custom_units', JSON.stringify(custom));
}

export function resetCustomTeacherUnit(gradeKey, unitNum) {
  const custom = getCustomTeacherUnits();
  const key = `${gradeKey}_unit${unitNum}`;
  delete custom[key];
  localStorage.setItem('kids_english_custom_units', JSON.stringify(custom));
}

export function resetAllCustomTeacherUnits() {
  localStorage.removeItem('kids_english_custom_units');
}

export function getUnitContent(gradeKey = 'grade5', unitNum = 1) {
  // Check if teacher has customized this unit first
  const custom = getCustomTeacherUnits();
  const customKey = `${gradeKey}_unit${unitNum}`;
  if (custom[customKey]) {
    return custom[customKey];
  }

  // Built-in Grade 5 dataset
  if (gradeKey === 'grade5') {
    const uData = GRADE_5_DATA[`unit${unitNum}`] || GRADE_5_DATA.unit1;
    return {
      words: uData.words || [],
      expressions: uData.expressions || []
    };
  }

  // Built-in fallback for other grades
  const baseWords = GENERAL_GRADE_WORDS[gradeKey] || GENERAL_GRADE_WORDS.grade3;
  return {
    words: baseWords,
    expressions: GENERAL_EXPRESSIONS
  };
}

export function getAllWordsForGrade(gradeKey = 'grade5') {
  let allW = [];
  let allE = [];

  for (let u = 1; u <= 12; u++) {
    const uData = getUnitContent(gradeKey, u);
    if (uData) {
      if (uData.words) allW.push(...uData.words);
      if (uData.expressions) allE.push(...uData.expressions);
    }
  }

  return { words: allW, expressions: allE };
}

export const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🦄', '🐯', '🤖', '👑'];
