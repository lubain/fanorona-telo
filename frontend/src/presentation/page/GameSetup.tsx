import type { Difficulty, GameMode } from "@/domain/types";

interface Props {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Facile", desc: "L'IA joue au hasard" },
  { value: "medium", label: "Moyen", desc: "L'IA fait quelques erreurs" },
  { value: "hard", label: "Difficile", desc: "L'IA joue de façon optimale" },
];

export default function GameSetup({ onStart }: Props) {
  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <h1 className="setup-title fanorona-accent">Fanorona Telo</h1>
        <p className="setup-subtitle">Choisissez votre mode de jeu</p>

        {/* Mode Humain vs Humain */}
        <div className="setup-section">
          <button
            className="setup-mode-btn setup-mode-hvh"
            onClick={() => onStart("hvh", "hard")}
          >
            <span className="setup-mode-icon">👥</span>
            <span className="setup-mode-text">
              <strong>Humain vs Humain</strong>
              <small>Jouez en local à deux</small>
            </span>
          </button>
        </div>

        {/* Mode Humain vs IA */}
        <div className="setup-section">
          <p className="setup-section-label">Humain vs IA</p>
          <div className="setup-diff-grid">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                className={`setup-diff-btn setup-diff-${d.value}`}
                onClick={() => onStart("hvia", d.value)}
              >
                <strong>{d.label}</strong>
                <small>{d.desc}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
