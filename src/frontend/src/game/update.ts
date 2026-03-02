import {
  BULLET_HEIGHT,
  BULLET_WIDTH,
  COLOR_ENEMY_BULLET,
  COLOR_EXPLOSION_1,
  COLOR_EXPLOSION_2,
  COLOR_PLAYER_BULLET,
  COLOR_POWERUP_MULTI,
  COLOR_POWERUP_RAPID,
  COLOR_POWERUP_SHIELD,
  ENEMY_BULLET_HEIGHT,
  ENEMY_BULLET_SPEED,
  ENEMY_BULLET_WIDTH,
  ENEMY_DESCEND_STEP,
  ENEMY_SHOOT_CHANCE,
  INVINCIBILITY_DURATION,
  PLAYER_BULLET_SPEED,
  PLAYER_FIRE_RATE,
  PLAYER_SPEED,
  POWERUP_DROP_CHANCE,
  POWERUP_DURATION,
  POWERUP_SIZE,
  POWERUP_SPEED,
  RAPID_FIRE_RATE,
  SCORE_PER_KILL_BASE,
  WAVE_COMPLETE_DURATION,
} from "./constants";
import { resetForNewWave } from "./init";
import type {
  ActivePowerUp,
  Bullet,
  Enemy,
  Explosion,
  ExplosionParticle,
  GameData,
  PowerUp,
  PowerUpType,
} from "./types";
import type { InputState } from "./types";

// Color lookup reserved for future visual feedback features
const _POWERUP_COLORS: Record<PowerUpType, string> = {
  "rapid-fire": COLOR_POWERUP_RAPID,
  "multi-shot": COLOR_POWERUP_MULTI,
  shield: COLOR_POWERUP_SHIELD,
};
void _POWERUP_COLORS;

function createExplosion(
  data: GameData,
  x: number,
  y: number,
  size: number,
  color: string,
): Explosion {
  const particles: ExplosionParticle[] = [];
  const count = Math.floor(8 + Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 40 + Math.random() * 80;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 4,
      alpha: 1,
      color: Math.random() > 0.5 ? color : COLOR_EXPLOSION_2,
    });
  }
  return {
    id: data.nextExplosionId,
    x,
    y,
    radius: 2,
    maxRadius: size,
    alpha: 1,
    color,
    particles,
  };
}

function hasPowerUp(data: GameData, type: PowerUpType): boolean {
  return data.activePowerUps.some((p) => p.type === type);
}

export function updateGame(
  data: GameData,
  dt: number,
  input: InputState,
): GameData {
  // Clamp dt to avoid huge jumps after tab focus
  const safeDt = Math.min(dt, 0.05);

  if (data.gameState === "wave-complete") {
    const timer = data.waveCompleteTimer - safeDt;
    if (timer <= 0) {
      return resetForNewWave(data);
    }
    return {
      ...data,
      waveCompleteTimer: timer,
      stars: updateStars(data, safeDt),
    };
  }

  if (data.gameState !== "playing") return data;

  let next = { ...data };
  next.stars = updateStars(data, safeDt);

  // ── Player movement ──────────────────────────────────────────────────────
  let px = next.player.x;
  if (input.left) px -= PLAYER_SPEED * safeDt;
  if (input.right) px += PLAYER_SPEED * safeDt;
  px = Math.max(0, Math.min(next.canvasWidth - next.player.width, px));

  // ── Player shooting ──────────────────────────────────────────────────────
  const fireRate = hasPowerUp(next, "rapid-fire")
    ? RAPID_FIRE_RATE
    : PLAYER_FIRE_RATE;
  let fireCooldown = next.playerFireCooldown - safeDt;
  const newBullets: Bullet[] = [...next.bullets];
  let bulletId = next.nextBulletId;

  if (input.shoot && fireCooldown <= 0) {
    const cx = px + next.player.width / 2;
    const by = next.player.y - 4;

    if (hasPowerUp(next, "multi-shot")) {
      // 3-spread bullets
      const angles = [-0.18, 0, 0.18];
      for (const angle of angles) {
        newBullets.push({
          id: bulletId++,
          x: cx - BULLET_WIDTH / 2,
          y: by,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speedY: -PLAYER_BULLET_SPEED,
          speedX: Math.sin(angle) * PLAYER_BULLET_SPEED * 0.4,
          isPlayer: true,
          color: COLOR_PLAYER_BULLET,
        });
      }
    } else {
      newBullets.push({
        id: bulletId++,
        x: cx - BULLET_WIDTH / 2,
        y: by,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speedY: -PLAYER_BULLET_SPEED,
        speedX: 0,
        isPlayer: true,
        color: COLOR_PLAYER_BULLET,
      });
    }
    fireCooldown = fireRate;
  }

  // ── Invincibility ────────────────────────────────────────────────────────
  let invTimer = next.player.invincibilityTimer;
  let isInvincible = next.player.isInvincible;
  if (isInvincible) {
    invTimer -= safeDt;
    if (invTimer <= 0) {
      invTimer = 0;
      isInvincible = false;
    }
  }

  // ── Enemy grid movement ──────────────────────────────────────────────────
  let { direction, speed } = next.enemyGrid;
  const livingEnemies = next.enemyGrid.enemies.filter((e) => e.alive);
  const speedMultiplier =
    livingEnemies.length < 10 ? 1 + (10 - livingEnemies.length) * 0.12 : 1;
  const effectiveSpeed = speed * speedMultiplier;

  let newEnemies = next.enemyGrid.enemies.map((e) => ({ ...e }));
  let newDirection = direction;
  let newDescend = false;

  // Find bounding box of living enemies
  const living = newEnemies.filter((e) => e.alive);
  if (living.length > 0) {
    const minX = Math.min(...living.map((e) => e.x));
    const maxX = Math.max(...living.map((e) => e.x + e.width));

    // Check wall collision
    if (maxX + effectiveSpeed * safeDt >= next.canvasWidth - 4) {
      newDirection = -1;
      newDescend = true;
    } else if (minX + effectiveSpeed * safeDt * -1 <= 4) {
      newDirection = 1;
      newDescend = true;
    }
  }

  const descendStep = newDescend ? ENEMY_DESCEND_STEP : 0;

  // Move all enemies
  newEnemies = newEnemies.map((e) => ({
    ...e,
    x: e.x + effectiveSpeed * safeDt * newDirection,
    y: e.y + descendStep,
  }));

  // ── Enemy shooting ───────────────────────────────────────────────────────
  const shootingEnemies = newEnemies.filter((e) => e.alive);
  for (const enemy of shootingEnemies) {
    if (Math.random() < ENEMY_SHOOT_CHANCE * (1 + (next.wave - 1) * 0.3)) {
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height;
      const playerCx = px + next.player.width / 2;
      const dx = playerCx - ex;
      const dist = Math.hypot(dx, next.player.y - ey);
      const angleX = dist > 0 ? (dx / dist) * ENEMY_BULLET_SPEED * 0.3 : 0;

      newBullets.push({
        id: bulletId++,
        x: ex - ENEMY_BULLET_WIDTH / 2,
        y: ey,
        width: ENEMY_BULLET_WIDTH,
        height: ENEMY_BULLET_HEIGHT,
        speedY: ENEMY_BULLET_SPEED,
        speedX: angleX,
        isPlayer: false,
        color: COLOR_ENEMY_BULLET,
      });
    }
  }

  // ── Move bullets ─────────────────────────────────────────────────────────
  const updatedBullets = newBullets
    .map((b) => ({
      ...b,
      x: b.x + b.speedX * safeDt,
      y: b.y + b.speedY * safeDt,
    }))
    .filter((b) => b.y > -20 && b.y < next.canvasHeight + 20);

  // ── Collision: player bullets vs enemies ─────────────────────────────────
  const newExplosions: Explosion[] = next.explosions.map((e) => ({ ...e }));
  let expId = next.nextExplosionId;
  let score = next.score;
  const newPowerUps: PowerUp[] = [...next.powerUps];
  let powerUpId = next.nextPowerUpId;
  const survivingBullets: Bullet[] = [];
  const killedEnemyIds = new Set<number>();

  for (const bullet of updatedBullets) {
    if (!bullet.isPlayer) {
      survivingBullets.push(bullet);
      continue;
    }
    let hit = false;
    for (const enemy of newEnemies) {
      if (!enemy.alive || killedEnemyIds.has(enemy.id)) continue;
      if (rectsOverlap(bullet, enemy)) {
        killedEnemyIds.add(enemy.id);
        hit = true;
        score += SCORE_PER_KILL_BASE * next.wave;
        const exp = createExplosion(
          { ...next, nextExplosionId: expId },
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          28,
          enemy.color,
        );
        exp.id = expId++;
        newExplosions.push(exp);

        // Drop power-up?
        if (Math.random() < POWERUP_DROP_CHANCE) {
          const types: PowerUpType[] = ["rapid-fire", "multi-shot", "shield"];
          const t = types[Math.floor(Math.random() * types.length)];
          newPowerUps.push({
            id: powerUpId++,
            x: enemy.x + enemy.width / 2 - POWERUP_SIZE / 2,
            y: enemy.y,
            width: POWERUP_SIZE,
            height: POWERUP_SIZE,
            type: t,
            speed: POWERUP_SPEED,
            rotation: 0,
            pulse: 0,
          });
        }
        break;
      }
    }
    if (!hit) survivingBullets.push(bullet);
  }

  // Apply killed
  for (const enemy of newEnemies) {
    if (killedEnemyIds.has(enemy.id)) {
      enemy.alive = false;
    }
  }

  // ── Collision: enemy bullets vs player ────────────────────────────────────
  const finalBullets: Bullet[] = [];
  let playerHit = false;
  let lives = next.player.lives;
  let shieldActive = next.player.shieldActive;

  for (const bullet of survivingBullets) {
    if (bullet.isPlayer || isInvincible) {
      finalBullets.push(bullet);
      continue;
    }
    const playerRect = {
      x: px,
      y: next.player.y,
      width: next.player.width,
      height: next.player.height,
    };
    if (rectsOverlap(bullet, playerRect)) {
      playerHit = true;
      // Explosion at player
      const exp = createExplosion(
        { ...next, nextExplosionId: expId },
        px + next.player.width / 2,
        next.player.y + next.player.height / 2,
        20,
        COLOR_EXPLOSION_1,
      );
      exp.id = expId++;
      newExplosions.push(exp);
    } else {
      finalBullets.push(bullet);
    }
  }

  if (playerHit) {
    if (shieldActive) {
      shieldActive = false;
    } else {
      lives--;
      isInvincible = true;
      invTimer = INVINCIBILITY_DURATION;
    }
  }

  // ── Power-up collection ───────────────────────────────────────────────────
  const activePowerUps: ActivePowerUp[] = next.activePowerUps
    .map((p) => ({ ...p, timeLeft: p.timeLeft - safeDt }))
    .filter((p) => p.timeLeft > 0);

  const remainingPowerUps: PowerUp[] = [];
  for (const pu of newPowerUps) {
    const puy = pu.y + pu.speed * safeDt;
    const puUpdated = {
      ...pu,
      y: puy,
      rotation: pu.rotation + safeDt * 2,
      pulse: pu.pulse + safeDt * 3,
    };
    const playerRect = {
      x: px,
      y: next.player.y,
      width: next.player.width,
      height: next.player.height,
    };
    const puRect = { x: pu.x, y: pu.y, width: pu.width, height: pu.height };
    if (rectsOverlap(puRect, playerRect)) {
      // Apply power-up
      const existing = activePowerUps.findIndex((p) => p.type === pu.type);
      if (existing >= 0) {
        activePowerUps[existing].timeLeft = POWERUP_DURATION;
      } else {
        activePowerUps.push({
          type: pu.type,
          timeLeft: POWERUP_DURATION,
          duration: POWERUP_DURATION,
        });
      }
      if (pu.type === "shield") {
        shieldActive = true;
      }
    } else if (puy < next.canvasHeight + 40) {
      remainingPowerUps.push(puUpdated);
    }
  }

  // ── Update explosions ─────────────────────────────────────────────────────
  const updatedExplosions = newExplosions
    .map((exp) => {
      const r = exp.radius + 120 * safeDt;
      const a = Math.max(0, exp.alpha - 2 * safeDt);
      const parts = exp.particles.map((p) => ({
        ...p,
        x: p.x + p.vx * safeDt,
        y: p.y + p.vy * safeDt,
        vy: p.vy + 60 * safeDt, // gravity
        alpha: Math.max(0, p.alpha - 1.8 * safeDt),
      }));
      return { ...exp, radius: r, alpha: a, particles: parts };
    })
    .filter((exp) => exp.alpha > 0);

  // ── Check wave complete ───────────────────────────────────────────────────
  const aliveCount = newEnemies.filter((e) => e.alive).length;
  let gameState = next.gameState;
  let waveCompleteTimer = next.waveCompleteTimer;

  if (aliveCount === 0) {
    // Bonus for fast clear
    const elapsed = (Date.now() - next.waveStartTime) / 1000;
    const bonus = Math.max(0, Math.floor((30 - elapsed) * next.wave * 5));
    score += bonus;
    gameState = "wave-complete";
    waveCompleteTimer = WAVE_COMPLETE_DURATION;
  }

  // ── Check game over conditions ────────────────────────────────────────────
  if (lives <= 0) {
    gameState = "game-over";
  }

  // Check if any enemy reached player level
  const playerYLine = next.player.y - 20;
  if (newEnemies.some((e) => e.alive && e.y + e.height >= playerYLine)) {
    lives = 0;
    gameState = "game-over";
  }

  return {
    ...next,
    player: {
      ...next.player,
      x: px,
      isInvincible,
      invincibilityTimer: invTimer,
      lives,
      shieldActive,
    },
    enemyGrid: {
      ...next.enemyGrid,
      enemies: newEnemies,
      direction: newDirection,
      descend: newDescend,
      speed,
    },
    bullets: finalBullets,
    powerUps: remainingPowerUps,
    explosions: updatedExplosions,
    score,
    activePowerUps,
    gameState,
    waveCompleteTimer,
    playerFireCooldown: Math.max(0, fireCooldown),
    nextBulletId: bulletId,
    nextExplosionId: expId,
    nextPowerUpId: powerUpId,
  };
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateStars(data: GameData, dt: number) {
  return data.stars.map((s) => {
    let y = s.y + s.speed * dt;
    if (y > data.canvasHeight) {
      y = -2;
    }
    return { ...s, y };
  });
}
