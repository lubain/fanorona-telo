import isPlacement from "@/applications/utils/isPlacement";
import { FANORONA_ADJ, O, X } from "@/domain/constants";
import ResetBtn from "@/presentation/components/ui/ResetBtn";
import GameStatusBar from "@/presentation/components/GameStatusBar";
import ThinkingOverlay from "@/presentation/components/ThinkingOverlay";
import { useFanoronaGame } from "@/applications/hooks/useFanoronaGame";
import type { Difficulty, GameMode } from "@/domain/types";

interface Props {
  mode: GameMode;
  difficulty: Difficulty;
  onBack: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

export default function FanoronaGame({ mode, difficulty, onBack }: Props) {
  const {
    board,
    selected,
    thinking,
    statusLabel,
    winner,
    isDraw,
    handleClick,
    reset,
  } = useFanoronaGame(mode, difficulty);

  const modeLabel =
    mode === "hvh"
      ? "Humain vs Humain"
      : `Humain vs IA — ${DIFFICULTY_LABELS[difficulty]}`;

  const gameOver = winner !== 0 || isDraw;

  return (
    <div className="hub-game-wrap">
      <div className="hub-game-header">
        <button className="hub-back-btn" onClick={onBack}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
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

      <div className="hub-game-surface" style={{ position: "relative" }}>
        <div
          className={`fanorona-board${thinking ? " is-thinking" : ""}${gameOver ? " game-over" : ""}`}
        >
          <svg className="fanorona-svg" viewBox="0 0 200 200">
            {/* Lignes de la grille */}
            <line
              x1="100"
              y1="0"
              x2="100"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="100"
              x2="200"
              y2="100"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="0"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="200"
              y1="0"
              x2="0"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="200"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="200"
              stroke="var(--fan-line)"
              strokeWidth="2"
            />
          </svg>

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
              return (
                <button
                  key={idx}
                  className={`fanorona-point${isSelected ? " selected" : ""}${isValidTarget ? " valid-target" : ""}`}
                  style={{ top: `${row * 50}%`, left: `${col * 50}%` }}
                  onClick={() => handleClick(idx)}
                  disabled={gameOver || thinking}
                  aria-label={`Case ${idx}`}
                >
                  <div
                    className={`fanorona-piece${cell === X ? " piece-x" : cell === O ? " piece-o" : " piece-empty"}`}
                  >
                    {cell === X && <span>✕</span>}
                    {cell === O && <span>◯</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {thinking && <ThinkingOverlay text="L'IA réfléchit…" />}
      </div>
    </div>
  );
}
