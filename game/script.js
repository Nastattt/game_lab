
let playerName = "";
let startTime = 0;
let gameInterval;
let monsters = [];
let traps = [];
let lives = 5;
let gameTime = 0;
let canvas;
let ctx;
let playerX = 150;
let playerY = 150;
let playerSpeed = 3;
let monsterSpeed = 1;
let monsterCount = 10;
let timerInterval;
let timerSeconds = 3;

const keysPressed = {};
document.addEventListener("keydown", function (event) {
  keysPressed[event.key] = true;
});
document.addEventListener("keyup", function (event) {
  delete keysPressed[event.key];
});

const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");

let selectedMap = "";

function setCanvasBackground(mapUrl) {
  canvas.style.backgroundImage = `url('${mapUrl}')`;
}

function startGame() {
  playerName = document.getElementById("username").value;
  document.getElementById("player-name").textContent = playerName;
  loginScreen.style.display = "none";
  gameScreen.style.display = "block";
  startTime = Date.now();
  gameTime = 0;
  lives = 5;
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");
  setCanvasBackground(selectedMap);
  generateMonstersWithInterval();
  gameInterval = setInterval(updateGame, 20);
  generateMonsters();
  generateTraps();
  startTimer();
}

function switchScreens(mapUrl) {
  selectedMap = mapUrl;
  document.getElementById("map-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
  setCanvasBackground(selectedMap);
}

function startTimer() {
  document.getElementById("timer").textContent = timerSeconds;
  timerInterval = setInterval(function () {
    timerSeconds--;
    document.getElementById("timer").textContent = timerSeconds;
    if (timerSeconds === 0) {
      generateMonsters();
      timerSeconds = 4;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateGame() {
  clearCanvas();
  updateTime();
  updatePlayer();
  updateMonsters();
  updateTraps();
  drawPlayer();
  checkCollisions();
  generateMonstersWithInterval();
  if (lives <= 0) {
    endGame();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateTime() {
  let currentTime = new Date();
  document.getElementById("current-time").textContent = currentTime.toLocaleTimeString();
  gameTime = Math.floor((currentTime.getTime() - startTime) / 1000);
  document.getElementById("game-time").textContent = formatTime(gameTime);
}

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updatePlayer() {
  if (keysPressed["ArrowUp"]) playerY -= playerSpeed;
  if (keysPressed["ArrowDown"]) playerY += playerSpeed;
  if (keysPressed["ArrowLeft"]) playerX -= playerSpeed;
  if (keysPressed["ArrowRight"]) playerX += playerSpeed;
  if (playerX < 0) playerX = 0;
  if (playerY < 0) playerY = 0;
  if (playerX > canvas.width - 20) playerX = canvas.width - 20;
  if (playerY > canvas.height - 20) playerY = canvas.height - 20;
}

function generateMonsters() {
  for (let i = 0; i < monsterCount; i++) {
    let monsterX = Math.floor(Math.random() * (canvas.width - 40));
    let monsterY = Math.floor(Math.random() * (canvas.height - 40));
    monsters.push({ x: monsterX, y: monsterY });
  }
}

function drawMonster(monster) {
  let monsterImage = new Image();
  monsterImage.src = "./img/monster.png";
  ctx.drawImage(monsterImage, monster.x, monster.y, 40, 40);
}

function updateMonsters() {
  for (let i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    let speed = 5;
    let direction = Math.floor(Math.random() * 4);
    if (direction === 0) {
      monster.x += speed;
    } else if (direction === 1) {
      monster.y -= speed;
    } else if (direction === 2) {
      monster.x -= speed;
    } else if (direction === 3) {
      monster.y += speed;
    }
    drawMonster(monster);
  }
}

let monsterTimer;

function generateMonstersWithInterval() {
  monsterTimer = setInterval(function () {
    generateMonsters();
  }, 300000);
}

function updateTraps() {
  for (let i = 0; i < traps.length; i++) {
    let trap = traps[i];
    let trapImage = new Image();
    trapImage.src = "./img/trap.jpg";
    ctx.drawImage(trapImage, trap.x, trap.y, 40, 40);
  }
}

let playerImage = new Image();
playerImage.src = "./img/player.jpg";

function drawPlayer() {
  ctx.drawImage(playerImage, playerX, playerY, 40, 40);
}

function checkCollisions() {
  let collidedMonsters = 0;
  let collidedTraps = 0;
  for (let i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    if (playerCollision(monster)) {
      lives--;
      document.getElementById("lives").textContent = lives;
      collidedMonsters++;
      monsters.splice(i, 1);
    }
  }
  for (let i = 0; i < traps.length; i++) {
    let trap = traps[i];
    if (playerCollision(trap)) {
      lives--;
      document.getElementById("lives").textContent = lives;
      collidedTraps++;
      traps.splice(i, 1);
    }
  }
  if (lives <= 0) {
    endGame(collidedMonsters, collidedTraps);
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    togglePause();
  }
});

function togglePause() {
  if (gameInterval) {
    stopTimer()
    clearInterval(gameInterval);
    gameInterval = null;
  } else {
    gameInterval = setInterval(updateGame, 20);
  }
}

function endGame() {
  clearInterval(gameInterval);
  stopTimer();
  gameScreen.style.display = "none";
  resultsScreen.style.display = "block";
  document.getElementById("result-time").textContent = formatTime(gameTime);
  let monsterCount = monsters.length;
  let trapCount = traps.length;
  document.getElementById("result-monsters").textContent = monsterCount;
  document.getElementById("result-traps").textContent = trapCount;
  document.getElementById("result-lives").textContent = lives;
}

function restartGame() {
  clearInterval(gameInterval);
  gameScreen.style.display

 = "none";
  resultsScreen.style.display = "none";
  loginScreen.style.display = "block";
}

function playerCollision(object) {
  return (
    playerX < object.x + 40 &&
    playerX + 40 > object.x &&
    playerY < object.y + 40 &&
    playerY + 40 > object.y
  );
}

function generateTraps() {
  for (let i = 0; i < 5; i++) {
    let trapX = Math.floor(Math.random() * (canvas.width - 40));
    let trapY = Math.floor(Math.random() * (canvas.height - 40));
    traps.push({ x: trapX, y: trapY });
  }
}
