let problems = [];
let currentProblemIndex = 0;
let timeLimit = 180;
let timeRemaining = 0;
let timerInterval = null;
let digitCount = 8;

function generateRandomNumber(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblems() {
    problems = [];
    for (let i = 0; i < 10; i++) {
        const num1 = generateRandomNumber(digitCount);
        const num2 = generateRandomNumber(digitCount);
        problems.push({
            id: i,
            num1: num1,
            num2: num2,
            correctAnswer: (num1 * num2).toString(),
            userAnswer: '',
            status: 'pending' // pending, correct, wrong
        });
    }
}

function startGame() {
    const timeInput = document.getElementById('timeInput');
    const digitInput = document.getElementById('digitInput');
    timeLimit = parseInt(timeInput.value);
    digitCount = parseInt(digitInput.value);
    
    if (timeLimit < 30 || timeLimit > 600) {
        alert('Lütfen 30 ile 600 saniye arasında bir değer girin!');
        return;
    }
    
    if (digitCount < 2 || digitCount > 10) {
        alert('Lütfen 2 ile 10 arasında bir basamak sayısı girin!');
        return;
    }
    
    generateProblems();
    timeRemaining = timeLimit;
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    renderProblems();
    selectProblem(0);
    startTimer();
}

function renderProblems() {
    const grid = document.getElementById('problemsGrid');
    grid.innerHTML = '';
    
    problems.forEach((problem, index) => {
        const col = document.createElement('div');
        col.className = 'col';
        
        const card = document.createElement('div');
        card.className = 'problem-card card h-100';
        card.onclick = () => selectProblem(index);
        
        card.innerHTML = `
            <div class="card-body p-3">
                <div class="problem-number">${problem.num1}</div>
                <div class="problem-multiplier">× ${problem.num2}</div>
                <input type="text" class="problem-answer form-control form-control-sm" id="answer-${index}" 
                       placeholder="?" 
                       onclick="event.stopPropagation(); selectProblem(${index})"
                       onchange="updateAnswer(${index}, this.value)">
            </div>
        `;
        
        col.appendChild(card);
        grid.appendChild(col);
    });
}

function selectProblem(index) {
    currentProblemIndex = index;
    
    // Tüm kartların seçili durumunu kaldır
    document.querySelectorAll('.problem-card').forEach((card, i) => {
        if (i === index) {
            if (!card.classList.contains('correct') && !card.classList.contains('wrong')) {
                card.classList.add('selected');
            }
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Hesap makinesini güncelle
    const problem = problems[index];
    document.getElementById('multiplicand').textContent = problem.num1;
    document.getElementById('multiplier').textContent = problem.num2;
    document.getElementById('resultInput').value = problem.userAnswer;
    
    // Basamak kutularını güncelle
    updateDigitBoxes(problem.userAnswer);
    
    // Input'a focus
    document.getElementById('resultInput').focus();
}

function updateDigitBoxes(answer) {
    const digitBoxes = document.getElementById('digitBoxes');
    digitBoxes.innerHTML = '';
    
    const maxDigits = Math.max(8, digitCount * 2);
    const digits = answer.padEnd(maxDigits, ' ').split('');
    digits.forEach(digit => {
        const box = document.createElement('div');
        box.className = 'digit-box';
        box.textContent = digit === ' ' ? '' : digit;
        digitBoxes.appendChild(box);
    });
}

function updateAnswer(index, value) {
    problems[index].userAnswer = value;
    updateDigitBoxes(value);
}

// Hesap makinesindeki input'tan cevabı güncelle
document.addEventListener('DOMContentLoaded', function() {
    const resultInput = document.getElementById('resultInput');
    if (resultInput) {
        resultInput.addEventListener('input', function() {
            problems[currentProblemIndex].userAnswer = this.value;
            document.getElementById("answer-${currentProblemIndex}").value = this.value;
            updateDigitBoxes(this.value);
        });
        
        // Enter tuşuna basıldığında sonraki probleme geç
        resultInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const nextIndex = currentProblemIndex + 1;
                if (nextIndex < problems.length) {
                    selectProblem(nextIndex);
                }
            }
        });
    }
});

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            finishGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function goBack() {
    if (confirm('Oyunu bırakmak istediğinize emin misiniz?')) {
        resetGame();
    }
}

function finishGame() {
    clearInterval(timerInterval);
    
    // Cevapları kontrol et
    let correct = 0;
    let wrong = 0;
    let empty = 0;
    
    problems.forEach((problem, index) => {
        const card = document.querySelectorAll('.problem-card')[index];
        
        if (problem.userAnswer === '') {
            empty++;
            problem.status = 'empty';
        } else if (problem.userAnswer === problem.correctAnswer) {
            correct++;
            problem.status = 'correct';
            card.classList.add('correct');
        } else {
            wrong++;
            problem.status = 'wrong';
            card.classList.add('wrong');
        }
        
        // Doğru cevabı göster
        const answerInput = document.getElementById("answer-${index}");
        if (answerInput && problem.status === 'wrong') {
            answerInput.value = "❌ ${problem.correctAnswer}";
            answerInput.style.color = 'red';
        } else if (answerInput && problem.status === 'correct') {
            answerInput.style.color = 'green';
        }
    });
    
    // Sonuçları göster
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    document.getElementById('emptyCount').textContent = empty;
    
    setTimeout(() => {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'block';
    }, 2000);
}

function resetGame() {
    clearInterval(timerInterval);
    problems = [];
    currentProblemIndex = 0;
    timeRemaining = 0;
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}