// Интерактивный квиз
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let selectedAnswer = null;

function startQuiz() {
    // Выбираем случайные 10 вопросов из базы
    const shuffled = [...quizData].sort(() => Math.random() - 0.5);
    currentQuizQuestions = shuffled.slice(0, 10);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    
    document.getElementById('quizIntro')?.style.setProperty('display', 'none');
    document.getElementById('quizQuestion')?.style.setProperty('display', 'block');
    document.getElementById('quizResult')?.style.setProperty('display', 'none');
    
    showQuestion();
}

function showQuestion() {
    const question = currentQuizQuestions[currentQuestionIndex];
    if (!question) return;
    
    const progress = ((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.setProperty('--progress', `${progress}%`);
        progressBar.querySelector('::after')?.style.setProperty('width', `${progress}%`);
    }
    
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${currentQuizQuestions.length}`;
    }
    
    const questionImage = document.getElementById('questionImage');
    if (questionImage) {
        questionImage.src = `assets/images/${question.image}`;
        questionImage.alt = 'Арт-объект для вопроса';
    }
    
    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.textContent = question.question;
    }
    
    const questionOptions = document.getElementById('questionOptions');
    if (questionOptions) {
        questionOptions.innerHTML = question.options.map(option => `
            <button class="quiz-option" data-option="${option}">${option}</button>
        `).join('');
        
        questionOptions.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (selectedAnswer !== null) return; // Уже отвечен
                selectAnswer(btn.dataset.option);
            });
        });
    }
    
    const explanation = document.getElementById('questionExplanation');
    if (explanation) {
        explanation.style.display = 'none';
    }
    
    // Обновляем текст кнопки в зависимости от номера вопроса
    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
        if (currentQuestionIndex === currentQuizQuestions.length - 1) {
            nextBtn.textContent = 'Закончить квиз';
        } else {
            nextBtn.textContent = 'Следующий вопрос';
        }
    }
    
    selectedAnswer = null;
}

function selectAnswer(option) {
    selectedAnswer = option;
    const question = currentQuizQuestions[currentQuestionIndex];
    const isCorrect = option === question.answer;
    
    if (isCorrect) {
        correctAnswers++;
    }
    
    // Подсветка ответов
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.option === question.answer) {
            btn.classList.add('correct');
        } else if (btn.dataset.option === option && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Показываем объяснение
    const explanation = document.getElementById('questionExplanation');
    const explanationText = document.getElementById('explanationText');
    
    if (explanation && explanationText) {
        explanationText.textContent = question.explanation;
        explanation.style.display = 'block';
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= currentQuizQuestions.length) {
        showResult();
    } else {
        showQuestion();
    }
}

function showResult() {
    const total = currentQuizQuestions.length;
    const score = correctAnswers;
    const percentage = Math.round((score / total) * 100);
    
    let rating = '';
    if (percentage >= 90) {
        rating = 'Эксперт стрит-арта!';
    } else if (percentage >= 70) {
        rating = 'Отличное знание!';
    } else if (percentage >= 50) {
        rating = 'Неплохо!';
    } else if (percentage >= 30) {
        rating = 'Есть куда расти';
    } else {
        rating = 'Начало пути';
    }
    
    document.getElementById('quizIntro')?.style.setProperty('display', 'none');
    document.getElementById('quizQuestion')?.style.setProperty('display', 'none');
    document.getElementById('quizResult')?.style.setProperty('display', 'block');
    
    const resultScore = document.getElementById('resultScore');
    if (resultScore) {
        resultScore.textContent = `Правильных ответов: ${score} из ${total}`;
    }
    
    const resultRating = document.getElementById('resultRating');
    if (resultRating) {
        resultRating.textContent = rating;
    }
}

function restartQuiz() {
    startQuiz();
}

function viewGallery() {
    window.location.href = 'index.html';
}

function shareResult() {
    const total = currentQuizQuestions.length;
    const score = correctAnswers;
    const percentage = Math.round((score / total) * 100);
    
    const text = `Я прошел квиз "Угадай стиль стрит-арта"! Результат: ${score} из ${total} правильных ответов (${percentage}%). Попробуйте и вы!`;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Результат квиза StreetArt Guide',
            text: text,
            url: url
        }).catch(() => {
            copyShareText(text, url);
        });
    } else {
        copyShareText(text, url);
    }
}

function copyShareText(text, url) {
    const fullText = `${text}\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
        showNotification('Результат скопирован!', 'success');
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startQuiz');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
    
    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    const restartBtn = document.getElementById('restartQuiz');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartQuiz);
    }
    
    const viewGalleryBtn = document.getElementById('viewGallery');
    if (viewGalleryBtn) {
        viewGalleryBtn.addEventListener('click', viewGallery);
    }
    
    const shareBtn = document.getElementById('shareResult');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResult);
    }
    
    // CSS переменная для прогресс-бара
    const style = document.createElement('style');
    style.textContent = `
        .quiz-question__progress-bar::after {
            width: var(--progress, 10%);
        }
    `;
    document.head.appendChild(style);
});
