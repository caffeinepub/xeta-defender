import {
  COLOR_ENEMY_ROW0,
  COLOR_ENEMY_ROW1,
  COLOR_ENEMY_ROW2,
  COLOR_ENEMY_ROW3,
  ENEMY_BASE_SPEED,
  ENEMY_COLS,
  ENEMY_HEIGHT,
  ENEMY_H_GAP,
  ENEMY_ROWS,
  ENEMY_START_Y,
  ENEMY_V_GAP,
  ENEMY_WIDTH,
  MAX_LIVES,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  STAR_FAST_COUNT,
  STAR_SLOW_COUNT,
} from "./constants";
import type { Enemy, EnemyGrid, GameData, Player, Star } from "./types";

const ENEMY_COLORS = [
  COLOR_ENEMY_ROW0,
  COLOR_ENEMY_ROW1,
  COLOR_ENEMY_ROW2,
  COLOR_ENEMY_ROW3,
];

export function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  // Slow layer
  for (let i = 0; i < STAR_SLOW_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 15 + Math.random() * 20,
      size: 0.5 + Math.random() * 1.2,
      brightness: 0.3 + Math.random() * 0.5,
    });
  }
  // Fast layer
  for (let i = 0; i < STAR_FAST_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 55 + Math.random() * 45,
      size: 0.8 + Math.random() * 1.5,
      brightness: 0.6 + Math.random() * 0.4,
    });
  }
  return stars;
}

export function createPlayer(width: number, height: number): Player {
  return {
    x: width / 2 - PLAYER_WIDTH / 2,
    y: height - 80,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    lives: MAX_LIVES,
    score: 0,
    isInvincible: false,
    invincibilityTimer: 0,
    shieldActive: false,
    shieldHits: 0,
  };
}

export function createEnemyGrid(width: number, wave: number): EnemyGrid {
  const cols = Math.min(ENEMY_COLS, 5 + Math.floor(wave * 0.8));
  const rows = Math.min(ENEMY_ROWS + 1, 3 + Math.floor(wave * 0.4));
  const totalW = cols * (ENEMY_WIDTH + ENEMY_H_GAP) - ENEMY_H_GAP;
  const startX = (width - totalW) / 2;
  const enemies: Enemy[] = [];
  let id = 0;

  for (let row = 0; row < rows; row++) {
    const rowType = Math.min(row, 3) as 0 | 1 | 2;
    for (let col = 0; col < cols; col++) {
      enemies.push({
        id: id++,
        x: startX + col * (ENEMY_WIDTH + ENEMY_H_GAP),
        y: ENEMY_START_Y + row * (ENEMY_HEIGHT + ENEMY_V_GAP),
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        type: rowType as 0 | 1 | 2,
        alive: true,
        shootCooldown: Math.random() * 3,
        color: ENEMY_COLORS[rowType % ENEMY_COLORS.length],
      });
    }
  }

  const speedMultiplier = 1 + (wave - 1) * 0.25;

  return {
    enemies,
    direction: 1,
    speed: ENEMY_BASE_SPEED * speedMultiplier,
    descend: false,
    descendAmount: 0,
  };
}

export function initGameData(
  width: number,
  height: number,
  existingScore?: number,
  highScore?: number,
): GameData {
  return {
    player: createPlayer(width, height),
    enemyGrid: createEnemyGrid(width, 1),
    bullets: [],
    powerUps: [],
    explosions: [],
    stars: createStars(width, height),
    wave: 1,
    score: existingScore ?? 0,
    highScore: highScore ?? 0,
    activePowerUps: [],
    gameState: "start",
    waveCompleteTimer: 0,
    nextBulletId: 0,
    nextExplosionId: 0,
    nextPowerUpId: 0,
    playerFireCooldown: 0,
    waveStartTime: 0,
    canvasWidth: width,
    canvasHeight: height,
  };
}

export function resetForNewWave(data: GameData): GameData {
  const nextWave = data.wave + 1;
  return {
    ...data,
    enemyGrid: createEnemyGrid(data.canvasWidth, nextWave),
    bullets: [],
    powerUps: [],
    wave: nextWave,
    activePowerUps: [],
    playerFireCooldown: 0,
    waveStartTime: 0,
    gameState: "playing",
    waveCompleteTimer: 0,
  };
}
