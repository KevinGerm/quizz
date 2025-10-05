//Global variable
const API_URL = "https://quizzapi.jomoreschi.fr/api/v2/quiz?limit=10";

let quizzes = [];
let index = 0;
let choices = [];
let score = 0;
let isFinished = false;

const progressScoreElement = document.querySelector(".progress-question");
const progressElement = document.querySelector(".progress-bar > div");
const questionNumberElement = document.querySelector(".question-number");
const difficultyLevelElement = document.querySelector(".difficulty");
const questionElement = document.querySelector(".question");
const choiceContainerElement = document.querySelector(".choice");
const choiceElement = document.querySelectorAll(".option-text");
const inputElement = document.querySelectorAll("input[type='radio']");
const nextButtonElement = document.querySelector(".btn.btn-primary");
const scoreElement = document.querySelector(".result");

//Loading
function loading() {
  questionElement.textContent = "Waiting for questions...";
  choiceElement.forEach((choice) => {
    choice.textContent = "Waiting for answers";
  });
}

//Algorithme randomize choices (Fisher-Yates)
function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

//Render

function displayQuestion() {
  nextButtonElement.disabled = true;

  //Question display
  questionElement.textContent = quizzes[index].question;
  progressScoreElement.textContent = `${index + 1}/${quizzes.length}`;
  difficultyLevelElement.textContent = `${quizzes[index].difficulty}`;
  if (quizzes[index].difficulty === "facile") {
    difficultyLevelElement.style.color = "#2E8B57";
  } else if (quizzes[index].difficulty === "difficile") {
    difficultyLevelElement.style.color = "#FF474C";
  } else {
    difficultyLevelElement.style.color = "#2563eb";
  }
  //answer display
  choices = [...quizzes[index].badAnswers, quizzes[index].answer];
  shuffle(choices);
  choices.forEach((answer, i) => {
    choiceElement[i].textContent = answer;
    inputElement[i].value = answer;
    inputElement[i].checked = false;
  });

  inputElement.forEach((input) => {
    input.addEventListener("change", () => {
      nextButtonElement.disabled = false;
    });
  });
}

function handleClick() {
  nextButtonElement.addEventListener("click", () => {
    progressElement.style.width = `${((index + 1) / quizzes.length) * 100}%`;
    if (isFinished) {
      location.reload();
      return;
    }

    const checkedElement = document.querySelector(
      "input[type='radio']:checked"
    );

    if (!checkedElement) return;

    if (checkedElement.value === quizzes[index].answer) {
      score++;
      scoreElement.textContent = `Score: ${score}`;
    } else {
      console.log("❌");
    }

    if (index >= quizzes.length - 1) {
      questionNumberElement.textContent = "Fin du quizz";
      questionElement.textContent = `Score: ${score}/${quizzes.length}`;
      nextButtonElement.textContent = "Recommencer";
      choiceContainerElement.style.display = "none";
      scoreElement.style.display = "none";
      isFinished = true;
      nextButtonElement.disabled = false;
      return;
    } else {
      index++;
      questionNumberElement.textContent = `Question ${index + 1}`;
      displayQuestion();
    }
  });
}

//API Connection
async function getQuizz() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.error("Echec lors de la connexion à l'API", res);
    } else {
      const data = await res.json();
      quizzes = data.quizzes;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'API: ", error);
  }
}

async function init() {
  loading();
  await getQuizz();
  displayQuestion();
  handleClick();
}

init();
