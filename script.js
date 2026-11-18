const QUESTIONS = [
  // 한국사
  { category: "한국사", question: "훈민정음을 창제한 조선의 왕은?", choices: ["태조", "세종대왕", "정조", "영조"], answer: 1 },
  { category: "한국사", question: "고려를 건국한 인물은?", choices: ["궁예", "견훤", "왕건", "이성계"], answer: 2 },
  { category: "한국사", question: "임진왜란 때 한산도 대첩을 승리로 이끈 장군은?", choices: ["이순신", "권율", "김시민", "강감찬"], answer: 0 },
  { category: "한국사", question: "3·1 운동이 일어난 해는?", choices: ["1910년", "1919년", "1929년", "1945년"], answer: 1 },
  { category: "한국사", question: "고조선을 건국했다고 전해지는 인물은?", choices: ["주몽", "박혁거세", "온조", "단군왕검"], answer: 3 },
  // 과학
  { category: "과학", question: "물의 화학식은?", choices: ["CO₂", "O₂", "H₂O", "NaCl"], answer: 2 },
  { category: "과학", question: "태양계에서 가장 큰 행성은?", choices: ["토성", "목성", "지구", "해왕성"], answer: 1 },
  { category: "과학", question: "식물이 광합성을 할 때 흡수하는 기체는?", choices: ["산소", "질소", "수소", "이산화탄소"], answer: 3 },
  { category: "과학", question: "원소 기호 'Fe'가 나타내는 원소는?", choices: ["철", "금", "은", "구리"], answer: 0 },
  { category: "과학", question: "진공에서 빛의 속도는 초속 약 얼마인가?", choices: ["3만 km", "30만 km", "300만 km", "3,000 km"], answer: 1 },
  // 지리
  { category: "지리", question: "세계에서 면적이 가장 넓은 나라는?", choices: ["캐나다", "중국", "미국", "러시아"], answer: 3 },
  { category: "지리", question: "대한민국에서 가장 높은 산은?", choices: ["한라산", "지리산", "설악산", "백두산"], answer: 0 },
  { category: "지리", question: "오스트레일리아(호주)의 수도는?", choices: ["시드니", "멜버른", "캔버라", "브리즈번"], answer: 2 },
  { category: "지리", question: "세계에서 가장 넓은 대양은?", choices: ["대서양", "인도양", "북극해", "태평양"], answer: 3 },
  { category: "지리", question: "독도가 속한 광역 행정구역은?", choices: ["강원특별자치도", "경상북도", "경상남도", "전라남도"], answer: 1 },
  // 예술문화
  { category: "예술문화", question: "'모나리자'를 그린 화가는?", choices: ["미켈란젤로", "라파엘로", "레오나르도 다빈치", "렘브란트"], answer: 2 },
  { category: "예술문화", question: "교향곡 제5번 '운명'의 작곡가는?", choices: ["모차르트", "베토벤", "바흐", "쇼팽"], answer: 1 },
  { category: "예술문화", question: "'별이 빛나는 밤'을 그린 화가는?", choices: ["빈센트 반 고흐", "클로드 모네", "파블로 피카소", "폴 세잔"], answer: 0 },
  { category: "예술문화", question: "희곡 '햄릿'의 작가는?", choices: ["괴테", "톨스토이", "셰익스피어", "단테"], answer: 2 },
  { category: "예술문화", question: "대한민국 국보 제1호로 지정되었던 문화유산은?", choices: ["흥인지문", "숭례문", "경복궁", "석굴암"], answer: 1 },
];

const $ = (id) => document.getElementById(id);
const screens = { start: $("start-screen"), quiz: $("quiz-screen"), result: $("result-screen") };

const TIME_LIMIT = 15;     // 스피드 퀴즈 문제당 제한 시간(초)
const SPEED_POINTS = 10;   // 스피드 퀴즈 정답 점수
const HINT_PENALTY = 5;    // 힌트 사용 시 차감 점수
const MODE_NAMES = { all: "전체 도전", category: "카테고리별", speed: "스피드 퀴즈" };

let mode = "all";
let selectedCategory = null;
let quizList = [];
let current = 0;
let score = 0;
let points = 0;
let categoryScore = {};
let categoryTotal = {};
let hintUsed = false;
let timerId = null;
let timeLeft = 0;

function show(name) {
  Object.values(screens).forEach((s) => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function goHome() {
  stopTimer();
  $("mode-select").classList.remove("hidden");
  $("category-select").classList.add("hidden");
  show("start");
}

function chooseMode(m) {
  if (m === "category") {
    $("mode-select").classList.add("hidden");
    $("category-select").classList.remove("hidden");
  } else {
    startQuiz(m);
  }
}

function startQuiz(m, category = null) {
  mode = m;
  selectedCategory = category;
  if (mode === "category") quizList = QUESTIONS.filter((q) => q.category === category);
  else if (mode === "speed") quizList = shuffle(QUESTIONS);
  else quizList = QUESTIONS;

  current = 0;
  score = 0;
  points = 0;
  categoryScore = {};
  categoryTotal = {};
  quizList.forEach((q) => {
    categoryScore[q.category] = 0;
    categoryTotal[q.category] = (categoryTotal[q.category] || 0) + 1;
  });
  $("timer").classList.toggle("hidden", mode !== "speed");
  $("hint-btn").classList.toggle("hidden", mode !== "speed");
  show("quiz");
  renderQuestion();
}

function startTimer() {
  stopTimer();
  timeLeft = TIME_LIMIT;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) selectAnswer(-1); // 시간 초과
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function updateTimer() {
  $("timer").textContent = `⏱ ${timeLeft}초`;
  $("timer").classList.toggle("urgent", timeLeft <= 5);
}

function useHint() {
  if (hintUsed) return;
  hintUsed = true;
  $("hint-btn").disabled = true;
  const q = quizList[current];
  const buttons = $("choices").querySelectorAll(".choice");
  const wrongIdx = shuffle([0, 1, 2, 3].filter((i) => i !== q.answer)).slice(0, 2);
  wrongIdx.forEach((i) => {
    buttons[i].disabled = true;
    buttons[i].classList.add("removed");
  });
}

function renderQuestion() {
  const q = quizList[current];
  $("category").textContent = q.category;
  $("progress-text").textContent = `${current + 1} / ${quizList.length}`;
  $("progress-bar").style.width = `${(current / quizList.length) * 100}%`;
  $("question").textContent = `Q${current + 1}. ${q.question}`;
  $("feedback").textContent = "";
  $("feedback").className = "";
  $("next-btn").classList.add("hidden");
  hintUsed = false;
  $("hint-btn").disabled = false;

  const box = $("choices");
  box.innerHTML = "";
  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = `${i + 1}. ${text}`;
    btn.addEventListener("click", () => selectAnswer(i));
    box.appendChild(btn);
  });

  if (mode === "speed") startTimer();
}

function selectAnswer(selected) {
  stopTimer();
  $("hint-btn").disabled = true;
  const q = quizList[current];
  const buttons = $("choices").querySelectorAll(".choice");
  buttons.forEach((b) => (b.disabled = true));
  buttons[q.answer].classList.add("correct");

  const fb = $("feedback");
  if (selected === q.answer) {
    score++;
    categoryScore[q.category]++;
    fb.textContent = "정답입니다! 🎉";
    if (mode === "speed") {
      const gained = SPEED_POINTS - (hintUsed ? HINT_PENALTY : 0);
      points += gained;
      fb.textContent += ` +${gained}점${hintUsed ? " (힌트 -5)" : ""}`;
    }
    fb.className = "ok";
  } else if (selected === -1) {
    fb.textContent = `⏰ 시간 초과! 정답은 '${q.choices[q.answer]}'입니다.`;
    fb.className = "no";
  } else {
    buttons[selected].classList.add("wrong");
    fb.textContent = `오답입니다. 정답은 '${q.choices[q.answer]}'입니다.`;
    fb.className = "no";
  }

  $("progress-bar").style.width = `${((current + 1) / quizList.length) * 100}%`;
  const next = $("next-btn");
  next.textContent = current === quizList.length - 1 ? "결과 보기" : "다음 문제";
  next.classList.remove("hidden");
}

function nextQuestion() {
  current++;
  if (current < quizList.length) renderQuestion();
  else showResult();
}

function showResult() {
  stopTimer();
  show("result");
  const total = quizList.length;
  $("result-mode").textContent = MODE_NAMES[mode] + (selectedCategory ? ` · ${selectedCategory}` : "");
  $("score").textContent = score;
  $("total").textContent = total;

  const pointsEl = $("points");
  pointsEl.classList.toggle("hidden", mode !== "speed");
  pointsEl.textContent = `획득 점수: ${points}점 / ${total * SPEED_POINTS}점`;

  const ratio = score / total;
  let msg;
  if (ratio === 1) msg = "만점! 상식 박사시네요! 🏆";
  else if (ratio >= 0.75) msg = "훌륭해요! 상식이 풍부하네요. 👏";
  else if (ratio >= 0.5) msg = "좋아요! 조금만 더 힘내세요. 💪";
  else msg = "다시 도전해 보세요! 📚";
  $("message").textContent = msg;

  $("category-scores").innerHTML = Object.entries(categoryScore)
    .map(([cat, s]) => `<li><span>${cat}</span><strong>${s} / ${categoryTotal[cat]}</strong></li>`)
    .join("");
}

document.querySelectorAll(".mode-btn").forEach((b) =>
  b.addEventListener("click", () => chooseMode(b.dataset.mode))
);
document.querySelectorAll(".cat-btn").forEach((b) =>
  b.addEventListener("click", () => startQuiz("category", b.dataset.category))
);
$("back-btn").addEventListener("click", goHome);
$("hint-btn").addEventListener("click", useHint);
$("next-btn").addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", () => startQuiz(mode, selectedCategory));
$("home-btn").addEventListener("click", goHome);
