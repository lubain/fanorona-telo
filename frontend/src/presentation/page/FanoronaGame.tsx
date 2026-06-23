import isPlacement from "@/applications/utils/isPlacement";
import { FANORONA_ADJ, O, X } from "@/domain/constants";
import ResetBtn from "@/presentation/components/ui/ResetBtn";
import GameStatusBar from "@/presentation/components/GameStatusBar";
import { useFanoronaGame } from "@/applications/hooks/useFanoronaGame";

export default function FanoronaGame() {
  const { board, selected, thinking, statusLabel, handleClick, reset } =
    useFanoronaGame();

  return (
    <div className="hub-game-wrap">
      <div className="hub-game-header">
        <button className="hub-back-btn">
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
          Hub
        </button>
        <h2 className="hub-game-title fanorona-accent">Fanorona Telo</h2>
        <ResetBtn onClick={reset} />
      </div>

      <GameStatusBar label={statusLabel} />

      <div className="hub-game-surface" style={{ position: "relative" }}>
        <div className={`fanorona-board${thinking ? " is-thinking" : ""}`}>
          <svg className="fanorona-svg" viewBox="0 0 200 200">
            {/* Grid lines */}
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
              const row = Math.floor(idx / 3),
                col = idx % 3;
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
        {/* {thinking && <ThinkingOverlay text="L'IA cherche son mouvement…" />} */}
      </div>
    </div>
  );
}
