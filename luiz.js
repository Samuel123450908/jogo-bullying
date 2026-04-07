const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== CONFIG =====
const GRAVITY = 1400;
const JUMP_FORCE = -420;
const PIPE_SPEED = 180;
const PIPE_GAP = 150;
const PIPE_INTERVAL = 1.2;

// ===== STATE =====
let state = "menu";
let bird, pipes, score, highScore, particles;
let lastTime = 0;
let pipeTimer = 0;

// ===== INIT =====
highScore = localStorage.getItem("highScore") || 0;

function resetGame() {
  bird = {
    x: 80,
    y: 250,
    w: 34,
    h: 24,
    vel: 0,
    rot: 0
  };

  pipes = [];
  particles = [];
  score = 0;
  pipeTimer = 0;

  state = "game";
}

// ===== INPUT =====
document.addEventListener("click", input);
document.addEventListener("keydown", input);

function input() {
  if (state === "menu") resetGame();
  else if (state === "game") bird.vel = JUMP_FORCE;
  else state = "menu";
}

// ===== PIPE =====
function createPipe() {
  let margin = 60;
  let top = Math.random() * (canvas.height - PIPE_GAP - margin * 2) + margin;

  pipes.push({
    x: canvas.width,
    top,
    bottom: top + PIPE_GAP,
    w: 60,
    passed: false
  });
}

// ===== PARTICLES =====
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      life: 1
    });
  }
}

// ===== UPDATE =====
function update(dt) {
  if (state !== "game") return;

  bird.vel += GRAVITY * dt;
  bird.y += bird.vel * dt;

  // Rotação
  bird.rot += ((bird.vel * 0.05) - bird.rot) * 10 * dt;

  // Pipes
  pipeTimer += dt;
  if (pipeTimer > PIPE_INTERVAL) {
    createPipe();
    pipeTimer = 0;
  }

  pipes.forEach(p => {
    p.x -= PIPE_SPEED * dt;

    if (!p.passed && p.x + p.w < bird.x) {
      p.passed = true;
      score++;

      if (score === 10) state = "bullying";
    }

    // Colisão
    if (
      bird.x < p.x + p.w &&
      bird.x + bird.w > p.x &&
      (bird.y < p.top || bird.y + bird.h > p.bottom)
    ) {
      createParticles(bird.x, bird.y);
      state = "gameover";
    }
  });

  pipes = pipes.filter(p => p.x + p.w > 0);

  // chão
  if (bird.y + bird.h > canvas.height) {
    createParticles(bird.x, bird.y);
    state = "gameover";
  }

  // partículas
  particles.forEach(pt => {
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt;
  });

  particles = particles.filter(p => p.life > 0);

  // high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "menu") {
    ctx.fillStyle = "#000";
    ctx.font = "32px Arial";
    ctx.fillText("Flappy Pro", 120, 250);
    ctx.font = "18px Arial";
    ctx.fillText("Clique para jogar", 120, 300);
    ctx.fillText("Recorde: " + highScore, 130, 340);
    return;
  }

  if (state === "bullying") {
    ctx.fillStyle = "red";
    ctx.font = "26px Arial";
    ctx.fillText("Você cometeu bullying", 50, 280);
    ctx.font = "16px Arial";
    ctx.fillText("Reflita sobre suas ações", 90, 320);
    return;
  }

  // pipes
  ctx.fillStyle = "#2ecc71";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.bottom, p.w, canvas.height);
  });

  // bird
  ctx.save();
  ctx.translate(bird.x + bird.w / 2, bird.y + bird.h / 2);
  ctx.rotate(bird.rot);
  ctx.fillStyle = "gold";
  ctx.fillRect(-bird.w / 2, -bird.h / 2, bird.w, bird.h);
  ctx.restore();

  // partículas
  ctx.fillStyle = "orange";
  particles.forEach(pt => {
    ctx.fillRect(pt.x, pt.y, 4, 4);
  });

  // UI
  ctx.fillStyle = "#000";
  ctx.font = "22px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (state === "gameover") {
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 110, 280);
    ctx.font = "16px Arial";
    ctx.fillText("Clique para voltar", 110, 320);
  }
}

// ===== LOOP =====
function loop(t = 0) {
  let dt = (t - lastTime) / 1000;
  lastTime = t;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loop();




