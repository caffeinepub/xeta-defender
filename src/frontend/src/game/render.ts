import {
  COLOR_ENEMY_BULLET,
  COLOR_HUD_BG,
  COLOR_HUD_BORDER,
  COLOR_PLAYER,
  COLOR_PLAYER_BULLET,
  COLOR_PLAYER_DARK,
  COLOR_POWERUP_MULTI,
  COLOR_POWERUP_RAPID,
  COLOR_POWERUP_SHIELD,
  COLOR_SHIELD,
  COLOR_SPACE,
  COLOR_TEXT,
  COLOR_TEXT_ACCENT,
  COLOR_TEXT_SCORE,
  COLOR_TEXT_WAVE,
  HUD_HEIGHT,
  HUD_PADDING,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from "./constants";
import type {
  Bullet,
  Enemy,
  Explosion,
  GameData,
  Player,
  PowerUp,
} from "./types";
import type { PowerUpType } from "./types";

const POWERUP_COLORS: Record<PowerUpType, string> = {
  "rapid-fire": COLOR_POWERUP_RAPID,
  "multi-shot": COLOR_POWERUP_MULTI,
  shield: COLOR_POWERUP_SHIELD,
};

const POWERUP_LABELS: Record<PowerUpType, string> = {
  "rapid-fire": "RAPID",
  "multi-shot": "MULTI",
  shield: "SHIELD",
};

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  data: GameData,
  time: number,
): void {
  const { canvasWidth: W, canvasHeight: H } = data;

  // ── Background ─────────────────────────────────────────────────────────
  ctx.fillStyle = COLOR_SPACE;
  ctx.fillRect(0, 0, W, H);

  // ── Stars ───────────────────────────────────────────────────────────────
  for (const star of data.stars) {
    ctx.globalAlpha = star.brightness;
    ctx.fillStyle = "#c8e8ff";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Nebula glow (static atmosphere) ────────────────────────────────────
  drawNebula(ctx, W, H);

  if (data.gameState === "start") {
    drawStartScreen(ctx, data, W, H, time);
    return;
  }

  // ── Bullets ─────────────────────────────────────────────────────────────
  for (const bullet of data.bullets) {
    drawBullet(ctx, bullet);
  }

  // ── Power-ups ────────────────────────────────────────────────────────────
  for (const pu of data.powerUps) {
    drawPowerUp(ctx, pu);
  }

  // ── Enemies ──────────────────────────────────────────────────────────────
  for (const enemy of data.enemyGrid.enemies) {
    if (enemy.alive) {
      drawEnemy(ctx, enemy, time);
    }
  }

  // ── Player ───────────────────────────────────────────────────────────────
  const showPlayer =
    !data.player.isInvincible ||
    Math.floor(data.player.invincibilityTimer * 8) % 2 === 0;

  if (showPlayer) {
    drawPlayer(ctx, data.player, data.player.shieldActive);
  }

  // ── Explosions ────────────────────────────────────────────────────────────
  for (const exp of data.explosions) {
    drawExplosion(ctx, exp);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  drawHUD(ctx, data, W);

  // ── Overlays ──────────────────────────────────────────────────────────────
  if (data.gameState === "paused") {
    drawPauseOverlay(ctx, W, H);
  }
  if (data.gameState === "wave-complete") {
    drawWaveComplete(ctx, data, W, H);
  }
  if (data.gameState === "game-over") {
    drawGameOverOverlay(ctx, W, H);
  }
}

function drawNebula(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Subtle atmospheric glow layers
  const grad1 = ctx.createRadialGradient(
    W * 0.2,
    H * 0.3,
    0,
    W * 0.2,
    H * 0.3,
    W * 0.45,
  );
  grad1.addColorStop(0, "rgba(80, 0, 160, 0.06)");
  grad1.addColorStop(1, "transparent");
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  const grad2 = ctx.createRadialGradient(
    W * 0.8,
    H * 0.6,
    0,
    W * 0.8,
    H * 0.6,
    W * 0.4,
  );
  grad2.addColorStop(0, "rgba(0, 60, 120, 0.05)");
  grad2.addColorStop(1, "transparent");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  shield: boolean,
) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Engine glow
  const engineGlow = ctx.createRadialGradient(
    0,
    player.height / 2 - 2,
    0,
    0,
    player.height / 2 - 2,
    12,
  );
  engineGlow.addColorStop(0, "rgba(0, 200, 255, 0.8)");
  engineGlow.addColorStop(1, "transparent");
  ctx.fillStyle = engineGlow;
  ctx.fillRect(-12, 8, 24, 20);

  // Main ship body - sleek triangle
  ctx.beginPath();
  ctx.moveTo(0, -player.height / 2 + 2); // Nose
  ctx.lineTo(-player.width / 2 + 2, player.height / 2 - 2); // Left wing
  ctx.lineTo(-8, player.height / 2 - 10); // Left body
  ctx.lineTo(0, player.height / 2 - 4); // Bottom center
  ctx.lineTo(8, player.height / 2 - 10); // Right body
  ctx.lineTo(player.width / 2 - 2, player.height / 2 - 2); // Right wing
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(
    0,
    -player.height / 2,
    0,
    player.height / 2,
  );
  bodyGrad.addColorStop(0, "#a0f8ff");
  bodyGrad.addColorStop(0.4, COLOR_PLAYER);
  bodyGrad.addColorStop(1, COLOR_PLAYER_DARK);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(0, -4, 6, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(180, 255, 255, 0.6)";
  ctx.fill();

  // Outline glow
  ctx.strokeStyle = COLOR_PLAYER;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 12;
  ctx.shadowColor = COLOR_PLAYER;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Shield
  if (shield) {
    ctx.beginPath();
    ctx.arc(0, 0, player.width * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = COLOR_SHIELD;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
    ctx.shadowBlur = 18;
    ctx.shadowColor = COLOR_SHIELD;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const cx = enemy.x + enemy.width / 2;
  const cy = enemy.y + enemy.height / 2;
  const pulse = Math.sin(time * 2 + enemy.id * 0.4) * 0.08 + 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);

  ctx.shadowBlur = 10;
  ctx.shadowColor = enemy.color;

  if (enemy.type === 0) {
    // Row 0: Squid-like — plus symbol body
    ctx.fillStyle = enemy.color;
    ctx.fillRect(-12, -4, 24, 8);
    ctx.fillRect(-4, -12, 8, 24);
    ctx.fillRect(-8, -8, 16, 16);
    // Tentacles
    ctx.fillStyle = enemy.color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-14, 4, 5, 6);
    ctx.fillRect(-6, 4, 5, 6);
    ctx.fillRect(1, 4, 5, 6);
    ctx.fillRect(9, 4, 5, 6);
    ctx.globalAlpha = 1;
    // Eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(-5, -4, 4, 4);
    ctx.fillRect(1, -4, 4, 4);
    ctx.fillStyle = "#000";
    ctx.fillRect(-4, -3, 2, 2);
    ctx.fillRect(2, -3, 2, 2);
  } else if (enemy.type === 1) {
    // Row 1: Crab — wide body
    ctx.fillStyle = enemy.color;
    ctx.fillRect(-13, -6, 26, 12);
    ctx.fillRect(-9, -10, 18, 6);
    // Claws
    ctx.fillRect(-16, -4, 5, 8);
    ctx.fillRect(11, -4, 5, 8);
    ctx.fillRect(-18, -8, 4, 5);
    ctx.fillRect(14, -8, 4, 5);
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(-8, -8, 5, 5);
    ctx.fillRect(3, -8, 5, 5);
    ctx.fillStyle = "#000";
    ctx.fillRect(-7, -7, 3, 3);
    ctx.fillRect(4, -7, 3, 3);
  } else if (enemy.type === 2) {
    // Row 2: UFO — saucer
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -2, 8, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = enemy.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Glow lights
    const lights = [-10, -5, 0, 5, 10];
    for (const lx of lights) {
      ctx.beginPath();
      ctx.arc(lx, 4, 2, 0, Math.PI * 2);
      ctx.fillStyle =
        Math.sin(time * 4 + lx) > 0 ? "#fff" : "rgba(255,255,255,0.3)";
      ctx.fill();
    }
  } else {
    // Row 3: Diamond / crystalline
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Inner
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = bullet.color;

  if (bullet.isPlayer) {
    // Cyan plasma bolt
    const grad = ctx.createLinearGradient(
      bullet.x,
      bullet.y,
      bullet.x,
      bullet.y + bullet.height,
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, COLOR_PLAYER_BULLET);
    grad.addColorStop(1, "rgba(0, 200, 255, 0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  } else {
    // Red/orange enemy bolt
    const grad = ctx.createLinearGradient(
      bullet.x,
      bullet.y,
      bullet.x,
      bullet.y + bullet.height,
    );
    grad.addColorStop(0, "rgba(255, 80, 30, 0.2)");
    grad.addColorStop(0.7, COLOR_ENEMY_BULLET);
    grad.addColorStop(1, "#ffaa00");
    ctx.fillStyle = grad;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp) {
  const cx = pu.x + pu.width / 2;
  const cy = pu.y + pu.height / 2;
  const color = POWERUP_COLORS[pu.type];
  const s = pu.width / 2;
  const pulse = Math.abs(Math.sin(pu.pulse)) * 4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(pu.rotation);

  // Glow aura
  ctx.shadowBlur = 16 + pulse * 2;
  ctx.shadowColor = color;

  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(0, -(s + pulse));
  ctx.lineTo(s + pulse, 0);
  ctx.lineTo(0, s + pulse);
  ctx.lineTo(-(s + pulse), 0);
  ctx.closePath();

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s + pulse);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.4, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Label
  ctx.rotate(-pu.rotation);
  ctx.font = "bold 7px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(
    pu.type === "rapid-fire" ? "R" : pu.type === "multi-shot" ? "M" : "S",
    0,
    1,
  );

  ctx.restore();
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: Explosion) {
  // Ring
  ctx.save();
  ctx.globalAlpha = exp.alpha * 0.6;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
  ctx.strokeStyle = exp.color;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 12;
  ctx.shadowColor = exp.color;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Particles
  for (const p of exp.particles) {
    if (p.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, data: GameData, W: number) {
  // HUD background bar
  ctx.fillStyle = COLOR_HUD_BG;
  ctx.fillRect(0, 0, W, HUD_HEIGHT);
  ctx.fillStyle = COLOR_HUD_BORDER;
  ctx.fillRect(0, HUD_HEIGHT - 1, W, 1);

  // Scanline hint
  ctx.fillStyle = "rgba(0,245,255,0.03)";
  for (let y = 0; y < HUD_HEIGHT; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }

  ctx.font = "bold 13px 'JetBrains Mono', monospace";

  // Score (left)
  ctx.fillStyle = "#888";
  ctx.textAlign = "left";
  ctx.fillText("SCORE", HUD_PADDING, 18);
  ctx.fillStyle = COLOR_TEXT_SCORE;
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText(String(data.score).padStart(6, "0"), HUD_PADDING, 38);

  // Wave (center)
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#888";
  ctx.textAlign = "center";
  ctx.fillText("WAVE", W / 2, 18);
  ctx.fillStyle = COLOR_TEXT_WAVE;
  ctx.font = "bold 20px 'JetBrains Mono', monospace";
  ctx.fillText(String(data.wave), W / 2, 38);

  // Lives (right)
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#888";
  ctx.textAlign = "right";
  ctx.fillText("LIVES", W - HUD_PADDING, 18);
  for (let i = 0; i < data.player.lives; i++) {
    drawMiniShip(ctx, W - HUD_PADDING - i * 22, 33, 16);
  }

  // Active power-ups (bottom HUD area, shown above HUD)
  let puX = HUD_PADDING;
  for (const pu of data.activePowerUps) {
    const color = POWERUP_COLORS[pu.type];
    const label = POWERUP_LABELS[pu.type];
    const fraction = pu.timeLeft / pu.duration;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(puX, HUD_HEIGHT + 4, 80, 14);

    // Progress bar
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(puX, HUD_HEIGHT + 4, 80 * fraction, 14);
    ctx.globalAlpha = 1;

    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    ctx.fillText(
      `${label} ${pu.timeLeft.toFixed(1)}s`,
      puX + 3,
      HUD_HEIGHT + 14,
    );

    puX += 86;
  }
}

function drawMiniShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COLOR_PLAYER;
  ctx.shadowBlur = 6;
  ctx.shadowColor = COLOR_PLAYER;
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.lineTo(0, size / 4);
  ctx.lineTo(size / 2, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawStartScreen(
  ctx: CanvasRenderingContext2D,
  data: GameData,
  W: number,
  H: number,
  time: number,
) {
  const pulse = Math.sin(time * 2) * 0.3 + 0.7;

  // Title glow effect
  ctx.save();
  ctx.textAlign = "center";

  // XETA glow layers
  for (let i = 3; i >= 0; i--) {
    ctx.font = `bold ${72 + i * 3}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = `rgba(0, 245, 255, ${0.04 * i})`;
    ctx.fillText("XETA", W / 2, H * 0.28 + i);
  }
  ctx.font = "bold 72px 'JetBrains Mono', monospace";
  ctx.fillStyle = COLOR_TEXT_ACCENT;
  ctx.shadowBlur = 30;
  ctx.shadowColor = COLOR_TEXT_ACCENT;
  ctx.fillText("XETA", W / 2, H * 0.28);
  ctx.shadowBlur = 0;

  // DEFENDER
  for (let i = 2; i >= 0; i--) {
    ctx.font = `bold ${46 + i * 2}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = `rgba(255, 0, 204, ${0.05 * i})`;
    ctx.fillText("DEFENDER", W / 2, H * 0.38 + i);
  }
  ctx.font = "bold 46px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#ff00cc";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ff00cc";
  ctx.fillText("DEFENDER", W / 2, H * 0.38);
  ctx.shadowBlur = 0;

  // Subtitle line
  ctx.fillStyle = "rgba(0, 200, 255, 0.3)";
  ctx.fillRect(W / 2 - 180, H * 0.43, 360, 1);

  // High score
  if (data.highScore > 0) {
    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#888";
    ctx.fillText("HIGH SCORE", W / 2, H * 0.48);
    ctx.font = "bold 22px 'JetBrains Mono', monospace";
    ctx.fillStyle = COLOR_TEXT_SCORE;
    ctx.fillText(String(data.highScore).padStart(6, "0"), W / 2, H * 0.54);
  }

  // Press space
  ctx.font = `bold 16px 'JetBrains Mono', monospace`;
  ctx.fillStyle = `rgba(0, 245, 255, ${pulse})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLOR_TEXT_ACCENT;
  ctx.fillText("PRESS SPACE TO START", W / 2, H * 0.63);
  ctx.shadowBlur = 0;

  // Controls
  const controls = [
    "← / A  ·  MOVE LEFT",
    "→ / D  ·  MOVE RIGHT",
    "SPACE / ↑  ·  SHOOT",
    "P / ESC  ·  PAUSE",
  ];
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(150, 200, 220, 0.6)";
  for (let i = 0; i < controls.length; i++) {
    ctx.fillText(controls[i], W / 2, H * 0.72 + i * 18);
  }

  // Animated demo enemies
  const enemyColors = ["#ff00cc", "#cc44ff", "#ff6622"];
  for (let i = 0; i < 5; i++) {
    const ex = W / 2 - 120 + i * 60;
    const ey = H * 0.87 + Math.sin(time * 1.5 + i * 0.8) * 6;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.fillStyle = enemyColors[i % 3];
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemyColors[i % 3];
    ctx.fillRect(-10, -7, 20, 14);
    ctx.fillRect(-6, -11, 12, 6);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.restore();
}

function drawPauseOverlay(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = "rgba(4, 8, 24, 0.75)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.font = "bold 48px 'JetBrains Mono', monospace";
  ctx.fillStyle = COLOR_TEXT_ACCENT;
  ctx.shadowBlur = 20;
  ctx.shadowColor = COLOR_TEXT_ACCENT;
  ctx.fillText("PAUSED", W / 2, H / 2 - 24);
  ctx.shadowBlur = 0;

  ctx.font = "14px 'JetBrains Mono', monospace";
  ctx.fillStyle = COLOR_TEXT;
  ctx.fillText("PRESS P TO RESUME", W / 2, H / 2 + 14);
}

function drawWaveComplete(
  ctx: CanvasRenderingContext2D,
  data: GameData,
  W: number,
  H: number,
) {
  ctx.textAlign = "center";
  ctx.font = "bold 36px 'JetBrains Mono', monospace";
  ctx.fillStyle = COLOR_TEXT_SCORE;
  ctx.shadowBlur = 20;
  ctx.shadowColor = COLOR_TEXT_SCORE;
  ctx.fillText(`WAVE ${data.wave} COMPLETE!`, W / 2, H / 2);
  ctx.shadowBlur = 0;

  ctx.font = "13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#aaa";
  ctx.fillText("PREPARING NEXT WAVE...", W / 2, H / 2 + 26);
}

function drawGameOverOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
) {
  ctx.fillStyle = "rgba(4, 0, 16, 0.85)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.font = "bold 52px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#ff3333";
  ctx.shadowBlur = 24;
  ctx.shadowColor = "#ff3333";
  ctx.fillText("GAME OVER", W / 2, H / 2 - 40);
  ctx.shadowBlur = 0;
}
