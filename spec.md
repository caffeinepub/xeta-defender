# Xeta Defender

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A 2D space shooter / tower defense game called "Xeta Defender"
- Player controls a spaceship at the bottom of the screen, moves left/right
- Waves of alien/enemy ships descend from the top
- Player shoots bullets upward to destroy enemies
- Enemies drop bombs/shoot back at the player
- Score tracking (current score, high score)
- Lives system (player starts with 3 lives)
- Wave/level progression (enemies get faster and more numerous each wave)
- Power-ups that drop from defeated enemies (e.g. rapid fire, shield, multi-shot)
- Game states: Start Screen, Playing, Game Over, Level Complete
- Sound/visual effects using Canvas API animations
- Responsive canvas that fits the browser window

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: Minimal backend with leaderboard/high score storage
2. Frontend: Full Canvas-based 2D game
   - Game loop using requestAnimationFrame
   - Player ship sprite (drawn with canvas)
   - Enemy ships in formation (multiple rows/columns)
   - Bullet system for player and enemies
   - Collision detection (bullets vs enemies, enemy bombs vs player)
   - Score, lives, wave HUD overlay
   - Power-up drops and effects
   - Start screen, pause, game over screens
   - Keyboard controls (arrow keys / WASD to move, space to shoot)
