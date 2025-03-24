// 获取元素
const mainMenu = document.querySelector('.left-panel');
const gameScreen = document.querySelector('.middle-panel');
const gameCanvas = document.getElementById('gameCanvas');
const pauseOverlay = document.getElementById('pauseOverlay');
const startGameButton = document.getElementById('startGame');
const resumeGameButton = document.getElementById('resumeGame');
const restartGameButton = document.getElementById('restartGame');
const difficultySelect = document.getElementById('difficulty'); // 获取难度选择下拉框
const gameScoreSpan = document.getElementById('gameScore');
const gameDurationSpan = document.getElementById('gameDuration');
const scoreboard = document.getElementById('scoreboard');

// 设置游戏画布的宽度和高度
gameCanvas.width = 400;
gameCanvas.height = 400;

// 游戏相关变量
let gameRunning = false;
let gamePaused = false;
let snake = [];
let food = {};
let direction = 'right';
let intervalId;
let gameStartTime;
let gameScore = 0;
let difficulty = 200;
let scoreCoefficient = 1; // 分数系数，默认为简单模式的 1 分

// 图片元素
const snakeHeadImg = new Image();
const snakeBodyImg = new Image();
const foodImg = new Image();

// 预加载图片
snakeHeadImg.src = 'img/snake.png';
snakeBodyImg.src = 'img/body.png';
foodImg.src = 'img/monster.png';

// 音频元素
const eatSound = new Audio('mp3/eat.mp3');
const overSound = new Audio('mp3/over.mp3');

// 初始化游戏
function initGame() {
    gameRunning = true;
    gamePaused = false;
    snake = [{ x: 10, y: 10 }];
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
    direction = 'right';
    gameScore = 0;
    gameScoreSpan.textContent = gameScore;
    gameStartTime = Date.now();
    clearInterval(intervalId);
    difficulty = parseInt(difficultySelect.value);
    // 根据难度设置分数系数
    switch (difficulty) {
        case 200: // 简单模式
            scoreCoefficient = 1;
            break;
        case 100: // 困难模式
            scoreCoefficient = 2;
            break;
        case 50: // 地狱模式
            scoreCoefficient = 3;
            break;
    }
    intervalId = setInterval(updateGame, difficulty);
    updateGameDuration();
}

// 更新游戏时长
function updateGameDuration() {
    if (gameRunning && !gamePaused) {
        const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
        gameDurationSpan.textContent = elapsedTime;
        requestAnimationFrame(updateGameDuration);
    }
}

// 更新游戏状态
function updateGame() {
    if (gamePaused) return;
    // 移动蛇
    let head = { ...snake[0] };
    switch (direction) {
        case 'right':
            head.x++;
            break;
        case 'left':
            head.x--;
            break;
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
    }
    snake.unshift(head);
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
        // 根据分数系数计算得分
        gameScore += scoreCoefficient;
        gameScoreSpan.textContent = gameScore;
        // 播放吃食物的音效
        eatSound.play();
    } else {
        snake.pop();
    }
    // 检查是否撞到墙或自己
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        gameOver();
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
    // 绘制游戏
    drawGame();
}

// 绘制游戏
function drawGame() {
    const ctx = gameCanvas.getContext('2d');
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // 绘制食物，调大食物图片尺寸
    if (foodImg.complete) {
        ctx.drawImage(foodImg, food.x * 20, food.y * 20, 30, 30);
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            if (snakeHeadImg.complete) {
                // 调大蛇头图片尺寸
                ctx.drawImage(snakeHeadImg, segment.x * 20, segment.y * 20, 30, 30);
            }
        } else {
            if (snakeBodyImg.complete) {
                // 计算偏移量以实现居中显示
                const offsetX = (30 - 15) / 2;
                const offsetY = (30 - 15) / 2;
                // 调小蛇身图片尺寸并居中绘制
                ctx.drawImage(snakeBodyImg, segment.x * 20 + offsetX, segment.y * 20 + offsetY, 15, 15);
            }
        }
    });
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(intervalId);
    updateScoreboard(gameScore);
    // 播放游戏结束的音效
    overSound.play();
    mainMenu.style.display = 'flex';
    gameScreen.style.display = 'flex';
}

// 更新排行榜
function updateScoreboard(score) {
    let scores = JSON.parse(localStorage.getItem('snakeScores')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 10);
    localStorage.setItem('snakeScores', JSON.stringify(scores));
    scoreboard.innerHTML = '';
    scores.forEach((s, index) => {
        const li = document.createElement('li');
        li.textContent = `第 ${index + 1} 名: ${s} 分`;
        scoreboard.appendChild(li);
    });
}

// 开始游戏
startGameButton.addEventListener('click', () => {
    mainMenu.style.display = 'flex';
    gameScreen.style.display = 'flex';
    initGame();
});

// 暂停游戏
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && gameRunning) {
        gamePaused = !gamePaused;
        pauseOverlay.style.display = gamePaused ? 'block' : 'none';
        if (!gamePaused) {
            updateGameDuration();
        }
    }
    // 处理方向控制
    if (gameRunning && !gamePaused) {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') direction = 'right';
                break;
        }
    }
});

// 继续游戏
resumeGameButton.addEventListener('click', () => {
    gamePaused = false;
    pauseOverlay.style.display = 'none';
    updateGameDuration();
});

// 重新开始游戏
restartGameButton.addEventListener('click', () => {
    pauseOverlay.style.display = 'none';
    initGame();
});

// 初始化排行榜
updateScoreboard(0);
