// 質問セット定義（省略節程は前回と同様）
const pages = [
  [
    {
      id: 'q1',
      title: 'いつお亡くなりになられましたか？',
      helper: '年/月/日を選択してください（不明な場合は「わからない」）',
      type: 'dateInput'
    },
    // 以下 q2】q7 は前回と同じ構造（type: pillMulti / pillSingle / select など）
    // …
  ],
  // … 2ページ目、3ページ目の質問
];

// 回答保存用
const answers = {};
let currentPage = 0;

const questionWrapper = document.getElementById('question-wrapper');
const progressBar   = document.getElementById('progress-bar');
const currentPageEl = document.getElementById('current-page');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function renderPage() {
  // ページ番号更新
  currentPageEl.textContent = currentPage + 1;

  // 質問エリア初期化
  questionWrapper.innerHTML = '';
  const pageQuestions = pages[currentPage];

  pageQuestions.forEach(question => {
    const block = document.createElement('div');
    block.className = 'question-block';

    // タイトル
    const h2 = document.createElement('h2');
    h2.textContent = question.title;
    block.appendChild(h2);

    // 補足
    if (question.helper) {
      const helper = document.createElement('div');
      helper.className = 'helper';
      helper.textContent = question.helper;
      block.appendChild(helper);
    }

    // 質問タイプごとの処理
    if (question.type === 'dateInput') {
      // 年/月/日の数値入力
      const container = document.createElement('div');
      container.className = 'date-inputs';

      const yearInput = document.createElement('input');
      yearInput.type = 'number';
      yearInput.placeholder = '西暦';
      yearInput.min = 1900;
      yearInput.max = new Date().getFullYear();

      const monthInput = document.createElement('input');
      monthInput.type = 'number';
      monthInput.placeholder = '月';
      monthInput.min = 1;
      monthInput.max = 12;

      const dayInput = document.createElement('input');
      dayInput.type = 'number';
      dayInput.placeholder = '日';
      dayInput.min = 1;
      dayInput.max = 31;

      container.appendChild(yearInput);
      container.appendChild(monthInput);
      container.appendChild(dayInput);

      // 不明ボタン
      const unknownBtn = document.createElement('div');
      unknownBtn.className = 'unknown-button';
      unknownBtn.textContent = 'わからない';

      unknownBtn.addEventListener('click', () => {
        yearInput.value = '';
        monthInput.value = '';
        dayInput.value = '';
        answers[question.id] = 'わからない';
        updateProgress();
      });

      // 値変更時に回答を保存
      const handleChange = () => {
        if (!yearInput.value && !monthInput.value && !dayInput.value) {
          delete answers[question.id];
        } else {
          answers[question.id] = `${yearInput.value}-${monthInput.value}-${dayInput.value}`;
        }
        updateProgress();
      };
      yearInput.addEventListener('input', handleChange);
      monthInput.addEventListener('input', handleChange);
      dayInput.addEventListener('input', handleChange);

      block.appendChild(container);
      block.appendChild(unknownBtn);
    }
    else if (question.type === 'select') {
      const selectEl = document.createElement('select');
      question.options.forEach(opt => {
        selectEl.appendChild(new Option(opt, opt));
      });
      selectEl.addEventListener('change', () => {
        answers[question.id] = selectEl.value;
        updateProgress();
      });
      block.appendChild(selectEl);
    }
    else if (question.type === 'pillSingle' || question.type === 'pillMulti') {
      const group = document.createElement('div');
      group.className = 'pill-group';
      question.options.forEach(opt => {
        const pill = document.createElement('div');
        pill.className = 'pill';
        pill.textContent = opt;
        pill.addEventListener('click', () => {
          if (question.type === 'pillSingle') {
            Array.from(group.children).forEach(child => child.classList.remove('selected'));
            pill.classList.add('selected');
            answers[question.id] = opt;
          } else {
            pill.classList.toggle('selected');
            const selected = [];
            Array.from(group.children).forEach(child => {
              if (child.classList.contains('selected')) selected.push(child.textContent);
            });
            answers[question.id] = selected;
          }
          updateProgress();
        });
        group.appendChild(pill);
      });
      block.appendChild(group);
    }

    questionWrapper.appendChild(block);
  });

  // ナビボタン表示制御
  if (currentPage === 0) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'inline-block';
  }
  nextBtn.textContent = (currentPage === pages.length - 1) ? '診断を完了' : '次へ';

  updateProgress();
}

function updateProgress() {
  const total = pages.flat().length;
  const answered = Object.keys(answers).length;
  const percent = (answered / total) * 100;
  progressBar.style.width = `${percent}%`;
}

// ナビゲーション
prevBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
  }
});
nextBtn.addEventListener('click', () => {
  if (currentPage < pages.length - 1) {
    currentPage++;
    renderPage();
  } else {
    window.location.href = 'completed.html';
  }
});

// 初期表示
document.addEventListener('DOMContentLoaded', renderPage);
