import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ScoreEntry, backendInterface } from "./backend.d";
import { createActorWithConfig } from "./config";
import { initGameData } from "./game/init";
import { renderFrame } from "./game/render";
import type { GameData, InputState } from "./game/types";
import { updateGame } from "./game/update";

// ─── Constants ────────────────────────────────────────────────────────────────
const FONT_MONO = "'JetBrains Mono', 'Geist Mono', monospace";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameDataRef = useRef<GameData | null>(null);
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    shoot: false,
    pause: false,
  });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const prevPauseRef = useRef<boolean>(false);
  const actorRef = useRef<backendInterface | null>(null);

  // Stable refs to avoid stale closures in game loop and event handlers
  const startGameRef = useRef<(() => void) | null>(null);
  const highScoreRef = useRef<number>(0);

  // React state for UI
  const [uiState, setUiState] = useState<{
    gameState: "start" | "playing" | "paused" | "wave-complete" | "game-over";
    score: number;
    wave: number;
    lives: number;
  }>({ gameState: "start", score: 0, wave: 1, lives: 3 });

  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // ── Init actor ────────────────────────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      try {
        actorRef.current = await createActorWithConfig();
      } catch (err) {
        console.error("Failed to init actor:", err);
      }
    })();
  }, []);

  // ── Load leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      if (!actorRef.current) {
        actorRef.current = await createActorWithConfig();
      }
      const scores = await actorRef.current.getTopScores();
      setLeaderboard(scores);
      const topScore = scores.length > 0 ? Number(scores[0].score) : 0;
      highScoreRef.current = topScore;
      if (gameDataRef.current) {
        gameDataRef.current.highScore = topScore;
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ── Submit score ──────────────────────────────────────────────────────────
  const handleSubmitScore = useCallback(async () => {
    const name = playerName.trim();
    if (!name || !gameDataRef.current) return;
    try {
      if (!actorRef.current) {
        actorRef.current = await createActorWithConfig();
      }
      await actorRef.current.submitScore(
        name,
        BigInt(gameDataRef.current.score),
      );
      setSubmitted(true);
      toast.success("Score submitted!");
      await fetchLeaderboard();
    } catch (err) {
      console.error("Failed to submit score:", err);
      toast.error("Failed to submit score. Try again.");
    }
  }, [playerName, fetchLeaderboard]);

  // ── Start game (stable ref) ───────────────────────────────────────────────
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const hs = gameDataRef.current?.highScore ?? highScoreRef.current;
    gameDataRef.current = initGameData(w, h, 0, hs);
    gameDataRef.current.gameState = "playing";
    gameDataRef.current.waveStartTime = Date.now();
    setSubmitted(false);
    setPlayerName("");
    setUiState({ gameState: "playing", score: 0, wave: 1, lives: 3 });
  }, []);

  // Keep ref in sync
  useEffect(() => {
    startGameRef.current = startGame;
  }, [startGame]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  const gameLoopRef = useRef<((timestamp: number) => void) | null>(null);

  useEffect(() => {
    function gameLoop(timestamp: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !gameDataRef.current) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const dt =
        lastTimeRef.current > 0
          ? (timestamp - lastTimeRef.current) / 1000
          : 0.016;
      lastTimeRef.current = timestamp;
      timeRef.current += dt;

      const input = inputRef.current;

      // Handle pause toggle
      if (input.pause && !prevPauseRef.current) {
        const g = gameDataRef.current;
        if (g.gameState === "playing") {
          gameDataRef.current = { ...g, gameState: "paused" };
        } else if (g.gameState === "paused") {
          gameDataRef.current = { ...g, gameState: "playing" };
          lastTimeRef.current = timestamp;
        }
      }
      prevPauseRef.current = input.pause;

      // Update
      if (
        gameDataRef.current.gameState === "playing" ||
        gameDataRef.current.gameState === "wave-complete"
      ) {
        if (
          gameDataRef.current.gameState === "playing" &&
          gameDataRef.current.waveStartTime === 0
        ) {
          gameDataRef.current = {
            ...gameDataRef.current,
            waveStartTime: Date.now(),
          };
        }
        gameDataRef.current = updateGame(gameDataRef.current, dt, input);
      }

      // Render
      renderFrame(ctx, gameDataRef.current, timeRef.current);

      // Sync React state (batched, minimal updates)
      const g = gameDataRef.current;
      setUiState((prev) => {
        if (
          prev.gameState !== g.gameState ||
          prev.score !== g.score ||
          prev.lives !== g.player.lives
        ) {
          return {
            gameState: g.gameState,
            score: g.score,
            wave: g.wave,
            lives: g.player.lives,
          };
        }
        return prev;
      });

      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoopRef.current = gameLoop;

    function onKeyDown(e: KeyboardEvent) {
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          inputRef.current.left = true;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          inputRef.current.right = true;
          e.preventDefault();
          break;
        case "Space":
        case "ArrowUp":
          inputRef.current.shoot = true;
          e.preventDefault();
          break;
        case "KeyP":
        case "Escape":
          inputRef.current.pause = true;
          e.preventDefault();
          break;
      }
      if (e.code === "Space" && gameDataRef.current?.gameState === "start") {
        startGameRef.current?.();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          inputRef.current.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          inputRef.current.right = false;
          break;
        case "Space":
        case "ArrowUp":
          inputRef.current.shoot = false;
          break;
        case "KeyP":
        case "Escape":
          inputRef.current.pause = false;
          break;
      }
    }

    function onResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx2 = canvas.getContext("2d");
      if (ctx2) ctx2.scale(dpr, dpr);
      if (gameDataRef.current) {
        const g = gameDataRef.current;
        if (g.gameState === "start") {
          gameDataRef.current = initGameData(w, h, 0, highScoreRef.current);
        } else {
          gameDataRef.current = { ...g, canvasWidth: w, canvasHeight: h };
        }
      }
    }

    // Init canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx2 = canvas.getContext("2d");
      if (ctx2) ctx2.scale(dpr, dpr);
      gameDataRef.current = initGameData(w, h, 0, highScoreRef.current);
      canvas.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []); // One-time init — all dependencies accessed via refs

  // ── Touch helpers ─────────────────────────────────────────────────────────
  const setTouchLeft = (active: boolean) => {
    inputRef.current.left = active;
  };
  const setTouchRight = (active: boolean) => {
    inputRef.current.right = active;
  };
  const setTouchShoot = (active: boolean) => {
    inputRef.current.shoot = active;
  };

  const touchProps = (setter: (v: boolean) => void) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      setter(true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      setter(false);
    },
    onMouseDown: () => setter(true),
    onMouseUp: () => setter(false),
    onMouseLeave: () => setter(false),
  });

  const isGameOver = uiState.gameState === "game-over";
  const isStart = uiState.gameState === "start";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <Toaster theme="dark" position="top-center" />

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="absolute inset-0 outline-none"
        style={{ display: "block", cursor: "none" }}
      />

      {/* Start screen — tap button for mobile */}
      {isStart && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 md:hidden">
          <button
            type="button"
            className="px-10 py-3 text-sm font-bold tracking-widest border border-cyan-400/60 text-cyan-300 bg-black/70 rounded active:scale-95 transition-transform"
            style={{ fontFamily: FONT_MONO }}
            onClick={startGame}
          >
            TAP TO START
          </button>
        </div>
      )}

      {/* Game Over React Overlay */}
      {isGameOver && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontFamily: FONT_MONO }}
        >
          {/* Spacer to sit below canvas GAME OVER text */}
          <div className="h-[42vh]" />

          {/* Score display */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-400 tracking-widest mb-1">
              FINAL SCORE
            </div>
            <div
              className="text-5xl font-bold tracking-wider"
              style={{ color: "#ffe040", textShadow: "0 0 20px #ffe040" }}
            >
              {String(uiState.score).padStart(6, "0")}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              WAVE {uiState.wave} REACHED
            </div>
          </div>

          {/* Leaderboard submit */}
          {!submitted ? (
            <div className="flex flex-col items-center gap-3 w-64">
              <div className="text-xs text-gray-500 tracking-widest">
                ENTER YOUR NAME
              </div>
              <input
                type="text"
                maxLength={16}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") void handleSubmitScore();
                }}
                placeholder="PILOT NAME"
                className="w-full px-3 py-2 text-center text-sm tracking-widest bg-black/70 border border-cyan-500/40 text-cyan-200 rounded outline-none focus:border-cyan-400 placeholder:text-gray-600"
                style={{ fontFamily: FONT_MONO }}
              />
              <button
                type="button"
                onClick={() => void handleSubmitScore()}
                disabled={!playerName.trim()}
                className="w-full px-6 py-2 text-sm font-bold tracking-widest bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 rounded hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: FONT_MONO }}
              >
                SUBMIT SCORE
              </button>
            </div>
          ) : (
            <div className="text-sm text-cyan-400 tracking-widest mb-3">
              ✓ SCORE SUBMITTED
            </div>
          )}

          {/* Leaderboard */}
          <div className="mt-6 w-72">
            <div className="text-xs text-gray-500 tracking-widest text-center mb-2">
              — TOP SCORES —
            </div>
            {loadingLeaderboard ? (
              <div className="text-xs text-gray-600 text-center">
                LOADING...
              </div>
            ) : (
              <div className="space-y-1">
                {leaderboard.slice(0, 8).map((entry, i) => (
                  <div
                    key={`${entry.playerName}-${String(entry.score)}-${i}`}
                    className="flex justify-between items-center px-3 py-1 rounded text-xs"
                    style={{
                      background:
                        i === 0
                          ? "rgba(0, 245, 255, 0.08)"
                          : "rgba(255,255,255,0.03)",
                      borderLeft:
                        i === 0
                          ? "2px solid rgba(0,245,255,0.4)"
                          : "2px solid transparent",
                      fontFamily: FONT_MONO,
                    }}
                  >
                    <span
                      className="text-gray-500"
                      style={{
                        color: i === 0 ? "#ffe040" : i < 3 ? "#aaa" : "#555",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex-1 mx-3 truncate"
                      style={{ color: i === 0 ? "#00f5ff" : "#999" }}
                    >
                      {entry.playerName.toUpperCase()}
                    </span>
                    <span style={{ color: i === 0 ? "#ffe040" : "#666" }}>
                      {String(Number(entry.score)).padStart(6, "0")}
                    </span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="text-xs text-gray-700 text-center py-2">
                    NO SCORES YET
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Play Again */}
          <button
            type="button"
            onClick={restartGame}
            className="mt-6 px-10 py-3 text-sm font-bold tracking-widest border border-cyan-400/60 text-cyan-300 bg-black/70 rounded hover:bg-cyan-500/10 active:scale-95 transition-all"
            style={{
              fontFamily: FONT_MONO,
              boxShadow: "0 0 20px rgba(0,245,255,0.15)",
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Touch Controls */}
      <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-between items-end px-6 pointer-events-none">
        {/* Left / Right */}
        <div className="flex gap-3 pointer-events-auto">
          <button
            type="button"
            className="w-16 h-16 rounded-full bg-black/60 border border-cyan-500/30 text-cyan-300 text-2xl flex items-center justify-center active:bg-cyan-500/20 select-none"
            {...touchProps(setTouchLeft)}
            aria-label="Move left"
          >
            ◀
          </button>
          <button
            type="button"
            className="w-16 h-16 rounded-full bg-black/60 border border-cyan-500/30 text-cyan-300 text-2xl flex items-center justify-center active:bg-cyan-500/20 select-none"
            {...touchProps(setTouchRight)}
            aria-label="Move right"
          >
            ▶
          </button>
        </div>

        {/* Fire */}
        <div className="pointer-events-auto">
          <button
            type="button"
            className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-200 text-sm font-bold flex items-center justify-center active:bg-cyan-500/40 select-none tracking-widest"
            style={{
              fontFamily: FONT_MONO,
              boxShadow: "0 0 20px rgba(0,245,255,0.2)",
            }}
            {...touchProps(setTouchShoot)}
            aria-label="Fire"
          >
            FIRE
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center text-xs pointer-events-none md:block hidden"
        style={{ color: "rgba(100,140,160,0.35)", fontFamily: FONT_MONO }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="hover:text-cyan-600 transition-colors pointer-events-auto"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(100,140,160,0.35)" }}
        >
          Built with ♥ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
