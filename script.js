
const QUIZ_QUESTIONS = [
  {
    text: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyperlink Text Management Language",
      "Home Tool Markup Language",
    ],
    correct: 0,
  },
  {
    text: "Which CSS property is used to change the background color?",
    options: ["bgcolor", "background-color", "color", "background"],
    correct: 1,
  },
  {
    text: "What does 'localStorage' in JavaScript allow?",
    options: [
      "Store data permanently on server",
      "Store data locally in the browser",
      "Create cookies",
      "Cache images",
    ],
    correct: 1,
  },
  {
    text: "Which of the following is a JavaScript framework?",
    options: ["Django", "Laravel", "React", "Flask"],
    correct: 2,
  },
  {
    text: "What does the 'flex' property do in CSS?",
    options: [
      "Creates a grid layout",
      "Aligns items vertically only",
      "Creates a flexible responsive layout",
      "Adds shadows to elements",
    ],
    correct: 2,
  },
  {
    text: "Which operator is used for strict equality in JavaScript?",
    options: ["==", "=", "===", "!="],
    correct: 2,
  },
  {
    text: "What is the correct way to write a comment in JavaScript?",
    options: [
      "<!-- comment -->",
      "// comment",
      "/* comment */",
      "Both B and C",
    ],
    correct: 3,
  },
];

const STORAGE_PROGRESS = "quiz_progress"; // stores user answers array
const STORAGE_RESULTS = "quiz_results"; // stores past results array

// ======================== DOM ELEMENTS ========================
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const quizCard = document.getElementById("quizCard");
const resultsCard = document.getElementById("resultsCard");
const scoreValueSpan = document.getElementById("scoreValue");
const totalValueSpan = document.getElementById("totalValue");
const resultMessageP = document.getElementById("resultMessage");
const retakeBtn = document.getElementById("retakeBtn");
const currentQuestionNumSpan = document.getElementById("currentQuestionNum");
const totalQuestionsSpan = document.getElementById("totalQuestions");
const resetQuizBtn = document.getElementById("resetQuizBtn");
const viewResultsBtn = document.getElementById("viewResultsBtn");
const historyModal = document.getElementById("historyModal");
const closeModal = document.querySelector(".close-modal");
const historyListDiv = document.getElementById("historyList");

// ======================== GLOBAL STATE ========================
let currentQuestionIndex = 0;
let userAnswers = []; // array of selected option indices (null if unanswered)
let totalQuestions = QUIZ_QUESTIONS.length;

// ======================== INITIALIZATION ========================
function init() {
  totalQuestionsSpan.textContent = totalQuestions;
  loadProgressFromStorage();
  loadResultsHistoryDisplay(); // just for modal, not needed on main
  renderCurrentQuestion();
  updateNavButtons();
  attachEventListeners();
}

// Load saved answers from localStorage
function loadProgressFromStorage() {
  const saved = localStorage.getItem(STORAGE_PROGRESS);
  if (saved) {
    userAnswers = JSON.parse(saved);
    // ensure length matches total questions (in case questions changed)
    if (userAnswers.length !== totalQuestions) {
      userAnswers = new Array(totalQuestions).fill(null);
    }
  } else {
    userAnswers = new Array(totalQuestions).fill(null);
  }
}

// Save current answers to localStorage
function saveProgressToStorage() {
  localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(userAnswers));
}

// Render current question and options
function renderCurrentQuestion() {
  const question = QUIZ_QUESTIONS[currentQuestionIndex];
  questionText.textContent = question.text;
  currentQuestionNumSpan.textContent = currentQuestionIndex + 1;

  // Build options list
  let optionsHtml = "";
  question.options.forEach((opt, idx) => {
    const isSelected = userAnswers[currentQuestionIndex] === idx;
    const selectedClass = isSelected ? "selected" : "";
    optionsHtml += `
      <div class="option-item ${selectedClass}" data-opt-index="${idx}">
        <span class="option-radio"></span>
        <span class="option-text">${escapeHtml(opt)}</span>
      </div>
    `;
  });
  optionsContainer.innerHTML = optionsHtml;

  // Attach click listeners to options
  document.querySelectorAll(".option-item").forEach((optDiv) => {
    optDiv.addEventListener("click", (e) => {
      const optIndex = parseInt(optDiv.dataset.optIndex);
      selectOption(optIndex);
    });
  });
}

// Handle option selection
function selectOption(selectedIdx) {
  // update userAnswers array
  userAnswers[currentQuestionIndex] = selectedIdx;
  saveProgressToStorage();

  // re-render current question to reflect selected style
  renderCurrentQuestion();
}

// Update Next/Prev button states
function updateNavButtons() {
  prevBtn.disabled = currentQuestionIndex === 0;
  if (currentQuestionIndex === totalQuestions - 1) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    submitBtn.style.display = "none";
  }
}

// Move to next question
function nextQuestion() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    renderCurrentQuestion();
    updateNavButtons();
  }
}

// Move to previous question
function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderCurrentQuestion();
    updateNavButtons();
  }
}

// Calculate score and show results
function submitQuiz() {
  // check if all questions answered
  const allAnswered = userAnswers.every((ans) => ans !== null);
  if (!allAnswered) {
    alert("Please answer all questions before submitting!");
    return;
  }

  let score = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (userAnswers[i] === QUIZ_QUESTIONS[i].correct) {
      score++;
    }
  }

  // Save result to localStorage history
  const resultRecord = {
    date: new Date().toISOString(),
    score: score,
    total: totalQuestions,
    percentage: ((score / totalQuestions) * 100).toFixed(1),
  };
  saveResultToHistory(resultRecord);

  // Display results
  displayResults(score);
}

// Save quiz result to history array in localStorage
function saveResultToHistory(record) {
  let history = localStorage.getItem(STORAGE_RESULTS);
  let resultsArray = history ? JSON.parse(history) : [];
  resultsArray.unshift(record); // newest first
  // Keep max 10 entries (optional)
  if (resultsArray.length > 10) resultsArray.pop();
  localStorage.setItem(STORAGE_RESULTS, JSON.stringify(resultsArray));
}

// Show results card and hide quiz
function displayResults(score) {
  quizCard.style.display = "none";
  resultsCard.style.display = "block";
  scoreValueSpan.textContent = score;
  totalValueSpan.textContent = totalQuestions;
  const percent = ((score / totalQuestions) * 100).toFixed(1);
  let message = "";
  if (percent >= 80) message = "Excellent! You're a quiz master! 🎉";
  else if (percent >= 60) message = "Good job! Keep learning. 👍";
  else if (percent >= 40) message = "Not bad, but you can improve! 📚";
  else message = "Don't give up! Review the topics and try again. 💪";
  resultMessageP.textContent = message;
}

// Reset the entire quiz (clear progress, reset answers)
function resetQuiz() {
  if (
    confirm(
      "Are you sure? This will erase all your current answers and start over.",
    )
  ) {
    userAnswers = new Array(totalQuestions).fill(null);
    saveProgressToStorage();
    currentQuestionIndex = 0;
    renderCurrentQuestion();
    updateNavButtons();
    // If results card is visible, hide it and show quiz
    if (resultsCard.style.display === "block") {
      resultsCard.style.display = "none";
      quizCard.style.display = "block";
    }
  }
}

// Retake quiz: clear answers and reset to first question
function retakeQuiz() {
  userAnswers = new Array(totalQuestions).fill(null);
  saveProgressToStorage();
  currentQuestionIndex = 0;
  renderCurrentQuestion();
  updateNavButtons();
  resultsCard.style.display = "none";
  quizCard.style.display = "block";
}

// Show modal with history results from localStorage
function showHistoryModal() {
  const storedHistory = localStorage.getItem(STORAGE_RESULTS);
  const history = storedHistory ? JSON.parse(storedHistory) : [];
  if (history.length === 0) {
    historyListDiv.innerHTML =
      "<p>No quiz attempts yet. Take the quiz to see your history!</p>";
  } else {
    let historyHtml = "";
    history.forEach((record) => {
      const dateObj = new Date(record.date);
      const formattedDate = dateObj.toLocaleString();
      historyHtml += `
        <div class="history-item">
          <div class="history-score">Score: ${record.score}/${record.total} (${record.percentage}%)</div>
          <div class="history-date">${formattedDate}</div>
        </div>
      `;
    });
    historyListDiv.innerHTML = historyHtml;
  }
  historyModal.style.display = "flex";
}

function closeHistoryModal() {
  historyModal.style.display = "none";
}

// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// Load results history in background (just to preload, but not displayed)
function loadResultsHistoryDisplay() {
  // nothing needed, modal will fetch on open
}

// ======================== EVENT LISTENERS ========================
function attachEventListeners() {
  nextBtn.addEventListener("click", nextQuestion);
  prevBtn.addEventListener("click", prevQuestion);
  submitBtn.addEventListener("click", submitQuiz);
  resetQuizBtn.addEventListener("click", resetQuiz);
  retakeBtn.addEventListener("click", retakeQuiz);
  viewResultsBtn.addEventListener("click", showHistoryModal);
  closeModal.addEventListener("click", closeHistoryModal);
  window.addEventListener("click", (e) => {
    if (e.target === historyModal) closeHistoryModal();
  });
  // Home link smooth scroll to quiz
  document.getElementById("homeLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelector(".quiz-section")
      .scrollIntoView({ behavior: "smooth" });
  });
  // About link (already handled via hash, but add smooth)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}


init();
