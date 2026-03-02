// ─── Game Constants ───────────────────────────────────────────────────────────

export const PLAYER_SPEED = 280; // px/sec
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 36;
export const PLAYER_BULLET_SPEED = 520;
export const PLAYER_FIRE_RATE = 0.22; // seconds between shots
export const RAPID_FIRE_RATE = 0.1;
export const INVINCIBILITY_DURATION = 2.0; // seconds
export const MAX_LIVES = 3;

export const ENEMY_COLS = 9;
export const ENEMY_ROWS = 4;
export const ENEMY_WIDTH = 36;
export const ENEMY_HEIGHT = 28;
export const ENEMY_H_GAP = 18;
export const ENEMY_V_GAP = 16;
export const ENEMY_START_Y = 72;
export const ENEMY_DESCEND_STEP = 18;
export const ENEMY_BASE_SPEED = 60; // px/sec

export const ENEMY_BULLET_SPEED = 180;
export const ENEMY_SHOOT_CHANCE = 0.0012; // per enemy per frame check

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 14;
export const ENEMY_BULLET_WIDTH = 5;
export const ENEMY_BULLET_HEIGHT = 12;

export const POWERUP_DROP_CHANCE = 0.15;
export const POWERUP_SPEED = 80;
export const POWERUP_DURATION = 5; // seconds
export const POWERUP_SIZE = 18;

export const WAVE_COMPLETE_DURATION = 2.5; // seconds
export const SCORE_PER_KILL_BASE = 10;

// Star layers
export const STAR_SLOW_COUNT = 60;
export const STAR_FAST_COUNT = 40;

// HUD
export const HUD_HEIGHT = 56;
export const HUD_PADDING = 16;

// Colors (literal for Canvas API)
export const COLOR_SPACE = "#070a14";
export const COLOR_PLAYER = "#00f5ff";
export const COLOR_PLAYER_DARK = "#006070";
export const COLOR_PLAYER_BULLET = "#00f5ff";
export const COLOR_ENEMY_ROW0 = "#ff00cc";
export const COLOR_ENEMY_ROW1 = "#cc44ff";
export const COLOR_ENEMY_ROW2 = "#ff6622";
export const COLOR_ENEMY_ROW3 = "#aa00ff";
export const COLOR_ENEMY_BULLET = "#ff4422";
export const COLOR_POWERUP_RAPID = "#ffee00";
export const COLOR_POWERUP_MULTI = "#00ff88";
export const COLOR_POWERUP_SHIELD = "#44aaff";
export const COLOR_EXPLOSION_1 = "#ffaa00";
export const COLOR_EXPLOSION_2 = "#ff4400";
export const COLOR_HUD_BG = "rgba(4, 8, 20, 0.92)";
export const COLOR_HUD_BORDER = "rgba(0, 245, 255, 0.25)";
export const COLOR_TEXT = "#e0f8ff";
export const COLOR_TEXT_ACCENT = "#00f5ff";
export const COLOR_TEXT_SCORE = "#ffe040";
export const COLOR_TEXT_WAVE = "#ff44cc";
export const COLOR_SHIELD = "#44aaff";
