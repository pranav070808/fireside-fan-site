const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav?.classList.toggle('open', open);
});

const form = document.querySelector('#signup-form');
const status = document.querySelector('#form-status');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const label = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Adding you…';
  status.textContent = '';
  status.classList.remove('error');
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not save your signup. Please try again.');
    status.textContent = result.message;
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Could not connect. Please try again.';
    status.classList.add('error');
  } finally {
    button.disabled = false;
    button.innerHTML = label;
  }
});

function getSavedValue(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function setSavedValue(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}
function removeSavedValue(key) {
  try { window.localStorage.removeItem(key); return true; } catch { return false; }
}

const paths = {
  ui: {
    title: 'Make a searchable mini library',
    description: 'Build three cards, add a search box, then filter the cards as someone types.',
    steps: ['01 · Start with three cards', '02 · Add one search field', '03 · Filter as you type']
  },
  javascript: {
    title: 'Build a reaction timer',
    description: 'Show a start prompt, wait a random moment, then measure how quickly someone clicks.',
    steps: ['01 · Show a ready state', '02 · Add a random delay', '03 · Save the best score']
  },
  backend: {
    title: 'Give a form a useful endpoint',
    description: 'Send a small JSON payload to an API route and handle success and error states.',
    steps: ['01 · Validate the input', '02 · Send a POST request', '03 · Show a clear result']
  },
  opensource: {
    title: 'Make your first useful contribution',
    description: 'Choose one small issue, reproduce it, and write a note that helps the next contributor.',
    steps: ['01 · Find a beginner issue', '02 · Reproduce the behavior', '03 · Share a focused fix']
  }
};
let selectedPath = getSavedValue('firesideSelectedPath') || 'ui';
const pathTitle = document.querySelector('#path-title');
const pathDescription = document.querySelector('#path-description');
const pathSteps = document.querySelector('#path-steps');
const savePathButton = document.querySelector('#save-path');
const saveStatus = document.querySelector('#save-status');
const sprintFocus = document.querySelector('#sprint-focus');

function refreshPath() {
  const path = paths[selectedPath] ? selectedPath : 'ui';
  selectedPath = path;
  document.querySelectorAll('.path-option').forEach((button) => {
    const active = button.dataset.path === path;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const info = paths[path];
  if (pathTitle) pathTitle.textContent = info.title;
  if (pathDescription) pathDescription.textContent = info.description;
  if (pathSteps) pathSteps.innerHTML = info.steps.map((step) => `<span>${step}</span>`).join('');
  if (sprintFocus) sprintFocus.textContent = `Focus idea: ${info.title}`;
  const saved = getSavedValue('firesideSavedPath') === path;
  if (savePathButton) {
    savePathButton.innerHTML = saved ? 'Idea saved <span>✓</span>' : 'Save this idea <span>＋</span>';
    savePathButton.setAttribute('aria-pressed', String(saved));
  }
  if (saveStatus) saveStatus.textContent = saved ? 'Saved in this browser. Pick another path any time.' : 'Saved only in this browser.';
}

function choosePath(path) {
  if (!paths[path]) return;
  selectedPath = path;
  setSavedValue('firesideSelectedPath', path);
  refreshPath();
}

document.querySelectorAll('.path-option').forEach((button) => {
  button.addEventListener('click', () => choosePath(button.dataset.path));
});
document.querySelectorAll('[data-choose-path]').forEach((card) => {
  card.addEventListener('click', () => {
    choosePath(card.dataset.choosePath);
    document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
  });
});
savePathButton?.addEventListener('click', () => {
  if (getSavedValue('firesideSavedPath') === selectedPath) {
    removeSavedValue('firesideSavedPath');
  } else {
    if (!setSavedValue('firesideSavedPath', selectedPath) && saveStatus) {
      saveStatus.textContent = 'Browser storage is unavailable. Keep this idea open while you work.';
      return;
    }
  }
  refreshPath();
});
refreshPath();

const timerDisplay = document.querySelector('#timer-display');
const timerProgress = document.querySelector('#timer-progress');
const timerToggle = document.querySelector('#timer-toggle');
const timerReset = document.querySelector('#timer-reset');
const timerStatus = document.querySelector('#timer-status');
const sprintLength = 15 * 60;
let secondsLeft = sprintLength;
let timerInterval = null;

function renderTimer() {
  if (!timerDisplay) return;
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
  if (timerProgress) timerProgress.style.width = `${(secondsLeft / sprintLength) * 100}%`;
}

function stopTimer(message) {
  window.clearInterval(timerInterval);
  timerInterval = null;
  if (timerToggle) timerToggle.innerHTML = secondsLeft === 0 ? 'Start again <span>↻</span>' : 'Resume sprint <span>▶</span>';
  if (timerStatus) timerStatus.textContent = message;
}

timerToggle?.addEventListener('click', () => {
  if (timerInterval) {
    stopTimer('Paused. Your idea is still saved in this browser.');
    return;
  }
  if (secondsLeft === 0) secondsLeft = sprintLength;
  if (timerToggle) timerToggle.innerHTML = 'Pause sprint <span>Ⅱ</span>';
  if (timerStatus) timerStatus.textContent = 'One thing at a time. You’ve got this.';
  renderTimer();
  timerInterval = window.setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 1);
    renderTimer();
    if (secondsLeft === 0) stopTimer('Sprint complete. Ship the tiny version!');
  }, 1000);
});
timerReset?.addEventListener('click', () => {
  window.clearInterval(timerInterval);
  timerInterval = null;
  secondsLeft = sprintLength;
  if (timerToggle) timerToggle.innerHTML = 'Start sprint <span>▶</span>';
  if (timerStatus) timerStatus.textContent = 'Make it small. Make it work.';
  renderTimer();
});
renderTimer();

const questions = [
  { question: 'Which HTTP method is commonly used to send new form data?', choices: ['GET', 'POST', 'TRACE', 'HEAD'], answer: 1, note: 'POST sends data to be processed or stored by the server.' },
  { question: 'What connects a label to its input in HTML?', choices: ['for and id', 'class and name', 'href and src', 'role and type'], answer: 0, note: 'The label’s for value should match the input’s id.' },
  { question: 'What does CSS Grid help you arrange?', choices: ['Only text color', 'Rows and columns', 'Server routes', 'Image file names'], answer: 1, note: 'Grid lays out content across rows and columns.' }
];
const quizStage = document.querySelector('#quiz-stage');
const quizCount = document.querySelector('#quiz-count');
const quizPoints = document.querySelector('#quiz-points');
let questionIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function renderQuestion() {
  if (!quizStage) return;
  if (questionIndex >= questions.length) {
    const line = quizScore === questions.length ? 'Perfect run. Your instincts are sharp.' : quizScore >= 2 ? 'Nice run. One more rabbit hole is waiting.' : 'Good start. Every wrong answer is a new idea.';
    if (quizCount) quizCount.textContent = 'DONE';
    if (quizPoints) quizPoints.textContent = `${quizScore} / ${questions.length} POINTS`;
    quizStage.innerHTML = `<p class="quiz-result">${line}</p><button class="quiz-restart" id="quiz-restart" type="button">Play again <span>↻</span></button>`;
    return;
  }
  const current = questions[questionIndex];
  quizAnswered = false;
  if (quizCount) quizCount.textContent = `${String(questionIndex + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
  if (quizPoints) quizPoints.textContent = `${quizScore} ${quizScore === 1 ? 'POINT' : 'POINTS'}`;
  quizStage.innerHTML = `<h4>${current.question}</h4><div class="quiz-options" id="quiz-options" role="group" aria-label="Answer choices">${current.choices.map((choice, index) => `<button class="quiz-option" type="button" data-answer="${index}">${choice}</button>`).join('')}</div><p class="quiz-feedback" id="quiz-feedback" role="status" aria-live="polite"></p><button class="quiz-next" id="quiz-next" type="button" disabled>Next question <span>→</span></button>`;
  quizStage.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const chosen = Number(button.dataset.answer);
      const correct = chosen === current.answer;
      if (correct) quizScore += 1;
      quizStage.querySelectorAll('.quiz-option').forEach((option) => {
        option.disabled = true;
        if (Number(option.dataset.answer) === current.answer) option.classList.add('correct');
      });
      if (!correct) button.classList.add('incorrect');
      const feedback = quizStage.querySelector('#quiz-feedback');
      if (feedback) feedback.textContent = `${correct ? 'That’s it!' : 'Not quite.'} ${current.note}`;
      if (quizPoints) quizPoints.textContent = `${quizScore} ${quizScore === 1 ? 'POINT' : 'POINTS'}`;
      const next = quizStage.querySelector('#quiz-next');
      if (next) next.disabled = false;
    });
  });
  quizStage.querySelector('#quiz-next')?.addEventListener('click', () => {
    questionIndex += 1;
    renderQuestion();
  });
}

quizStage?.addEventListener('click', (event) => {
  if (event.target.closest('#quiz-restart')) {
    questionIndex = 0;
    quizScore = 0;
    renderQuestion();
  }
});
renderQuestion();

