import type { Difficulty, GameMode } from "@/domain/types";

interface Props {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
}

const DIFFICULTIES: {
  value: Difficulty;
  label: string;
  desc: string;
  icon: string;
  color: string;
}[] = [
  {
    value: "easy",
    label: "Facile",
    desc: "L'IA joue au hasard",
    icon: "🌱",
    color: "easy",
  },
  {
    value: "medium",
    label: "Moyen",
    desc: "Quelques erreurs",
    icon: "⚡",
    color: "medium",
  },
  {
    value: "hard",
    label: "Difficile",
    desc: "Jeu optimal",
    icon: "💀",
    color: "hard",
  },
];

export default function GameSetup({ onStart }: Props) {
  return (
    <div className="setup-wrap">
      <div className="setup-card">
        {/* Logo / titre */}
        <div className="setup-hero">
          <div className="setup-board-preview" aria-hidden="true">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="40"
                x2="80"
                y2="40"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="0"
                x2="80"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="0"
                x2="0"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="0"
                x2="80"
                y2="0"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="80"
                x2="80"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="0"
                x2="80"
                y2="80"
                stroke="rgba(255,255,255,.15)"
                strokeWidth="1"
              />
              {/* Pièces décoratifs */}
              <circle cx="0" cy="0" r="7" fill="#34d399" fillOpacity=".9" />
              <circle cx="40" cy="0" r="7" fill="#34d399" fillOpacity=".9" />
              <circle cx="80" cy="80" r="7" fill="#f472b6" fillOpacity=".9" />
              <circle cx="40" cy="80" r="7" fill="#f472b6" fillOpacity=".9" />
              <circle cx="40" cy="40" r="9" fill="#34d399" />
            </svg>
          </div>
          <h1 className="setup-title fanorona-accent">Fanorona Telo</h1>
          <p className="setup-subtitle">Le morpion malgache</p>
        </div>

        {/* Mode HvH */}
        <div className="setup-section">
          <button
            className="setup-mode-btn setup-mode-hvh"
            onClick={() => onStart("hvh", "hard")}
          >
            <span className="setup-mode-icon">👥</span>
            <span className="setup-mode-text">
              <strong>2 Joueurs</strong>
              <small>Humain vs Humain — en local</small>
            </span>
            <svg
              className="setup-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Séparateur */}
        <div className="setup-divider">
          <span>ou jouer contre l'IA</span>
        </div>

        {/* Modes HvIA */}
        <div className="setup-diff-grid">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              className={`setup-diff-btn setup-diff-${d.color}`}
              onClick={() => onStart("hvia", d.value)}
            >
              <span className="setup-diff-icon">{d.icon}</span>
              <strong>{d.label}</strong>
              <small>{d.desc}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
