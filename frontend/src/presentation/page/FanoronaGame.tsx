import isPlacement from "@/applications/utils/isPlacement";
import { FANORONA_ADJ, O, X } from "@/domain/constants";
import ResetBtn from "@/presentation/components/ui/ResetBtn";
import UndoRedoBtn from "@/presentation/components/ui/UndoRedoBtn";
import GameStatusBar from "@/presentation/components/GameStatusBar";
import { useFanoronaGame } from "@/applications/hooks/useFanoronaGame";
import type { Difficulty, GameMode } from "@/domain/types";

interface Props {
  mode: GameMode;
  difficulty: Difficulty;
  onBack: () => void;
  difficultyX: Difficulty | undefined;
  difficultyO: Difficulty | undefined;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

export default function FanoronaGame({
  mode,
  difficulty,
  onBack,
  difficultyX,
  difficultyO,
}: Props) {
  const {
    board,
    selected,
    thinking,
    statusLabel,
    winner,
    isDraw,
    lastPlaced,
    canUndo,
    canRedo,
    handleClick,
    reset,
    undo,
    redo,
  } = useFanoronaGame(mode, difficulty, difficultyX, difficultyO);

  const modeLabel =
    mode === "hvh"
      ? "Humain vs Humain"
      : `vs IA — ${DIFFICULTY_LABELS[difficulty]}`;

  const gameOver = winner !== 0 || isDraw;

  return (
    <div className="hub-game-wrap">
      {/* ── Header ── */}
      <div className="hub-game-header">
        <button className="hub-back-btn" onClick={onBack}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Menu
        </button>

        <div className="hub-game-title-wrap">
          <h2 className="hub-game-title fanorona-accent">Fanorona Telo</h2>
          <span className="hub-mode-badge">{modeLabel}</span>
        </div>

        <ResetBtn onClick={reset} />
      </div>

      {/* ── Status ── */}
      <GameStatusBar
        label={statusLabel}
        color={
          winner === X
            ? "var(--fan-a)"
            : winner === O
              ? "#f472b6"
              : isDraw
                ? "var(--muted2)"
                : undefined
        }
      />

      {/* ── Board ── */}
      <div className="hub-game-surface" style={{ position: "relative" }}>
        <div
          className={`fanorona-board${thinking ? " is-thinking" : ""}${gameOver ? " game-over" : ""}`}
        >
          {/* SVG Lines */}
          <svg className="fanorona-svg" viewBox="0 0 200 200">
            <line
              x1="100"
              y1="0"
              x2="100"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="100"
              x2="200"
              y2="100"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="0"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="200"
              y1="0"
              x2="0"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="200"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Pieces */}
          <div className="fanorona-points">
            {board.map((cell, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              const isSelected = selected === idx;
              const isValidTarget =
                selected !== null &&
                !isPlacement(board) &&
                FANORONA_ADJ[selected].includes(idx) &&
                cell === 0;
              const isNew = lastPlaced === idx;

              return (
                <button
                  key={idx}
                  className={[
                    "fanorona-point",
                    isSelected ? "selected" : "",
                    isValidTarget ? "valid-target" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ top: `${row * 50}%`, left: `${col * 50}%` }}
                  onClick={() => handleClick(idx)}
                  disabled={gameOver || thinking}
                  aria-label={`Case ${idx}`}
                >
                  <div
                    className={[
                      "fanorona-piece",
                      cell === X
                        ? "piece-x"
                        : cell === O
                          ? "piece-o"
                          : "piece-empty",
                      isNew && cell !== 0 ? "piece-new" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {cell === X && <span>✕</span>}
                    {cell === O && <span>◯</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* {thinking && <ThinkingOverlay text="L'IA réfléchit…" />} */}
      </div>

      {/* ── Undo / Redo ── */}
      <UndoRedoBtn
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* ── Game over CTA ── */}
      {gameOver && (
        <div className="game-over-cta">
          <p className="game-over-label">
            {winner !== 0
              ? winner === X
                ? mode === "hvh"
                  ? "🏆 Joueur 1 gagne !"
                  : "🏆 Vous avez gagné !"
                : mode === "hvh"
                  ? "🏆 Joueur 2 gagne !"
                  : "🤖 L'IA gagne !"
              : "🤝 Match nul !"}
          </p>
          <button className="cta-btn" onClick={reset}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}
