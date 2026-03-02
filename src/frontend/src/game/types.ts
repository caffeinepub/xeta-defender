// ─── Game Entity Types ──────────────────────────────────────────────────────

export type GameState =
  | "start"
  | "playing"
  | "paused"
  | "wave-complete"
  | "game-over";

export type PowerUpType = "rapid-fire" | "multi-shot" | "shield";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
  score: number;
  isInvincible: boolean;
  invincibilityTimer: number;
  shieldActive: boolean;
  shieldHits: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 0 | 1 | 2; // Row type determines shape
  alive: boolean;
  shootCooldown: number;
  color: string;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  speedX: number;
  isPlayer: boolean;
  color: string;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  speed: number;
  rotation: number;
  pulse: number;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  particles: ExplosionParticle[];
}

export interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number;
  duration: number;
}

export interface EnemyGrid {
  enemies: Enemy[];
  direction: 1 | -1;
  speed: number;
  descend: boolean;
  descendAmount: number;
}

export interface GameData {
  player: Player;
  enemyGrid: EnemyGrid;
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  stars: Star[];
  wave: number;
  score: number;
  highScore: number;
  activePowerUps: ActivePowerUp[];
  gameState: GameState;
  waveCompleteTimer: number;
  nextBulletId: number;
  nextExplosionId: number;
  nextPowerUpId: number;
  playerFireCooldown: number;
  waveStartTime: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ScoreEntry {
  playerName: string;
  score: bigint;
}

export interface InputState {
  left: boolean;
  right: boolean;
  shoot: boolean;
  pause: boolean;
}
