import { checkFanorona, fanoronaSuccessors } from "@/applications/utils";
import isPlacement from "@/applications/utils/isPlacement";
import { O, X } from "@/domain/constants";
import type { Difficulty, GameMode, Player } from "@/domain/types";
import { apiPost } from "@/infrastructure/ApiPost";
import { useState, useCallback } from "react";

// ─── Détection de match nul côté client (phase déplacement, aucun coup dispo) ───
function clientIsDrawn(board: number[], turn: number): boolean {
  if (board.filter((c) => c !== 0).length < 6) return false; // phase placement
  return fanoronaSuccessors(board, turn).length === 0;
}

export const useFanoronaGame = (mode: GameMode, difficulty: Difficulty) => {
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [turn, setTurn] = useState<Player>(X);
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [isDraw, setIsDraw] = useState(false);

  const winner = checkFanorona(board);
  const placement = isPlacement(board);
  const validMoves = fanoronaSuccessors(board, turn);

  // Appel IA
  const askAI = useCallback(
    async (nb: number[], aiTurn: Player) => {
      setThinking(true);
      try {
        const d = await apiPost("/fanorona-move", {
          board: nb,
          turn: aiTurn,
          difficulty,
        });
        const aiBoard: number[] = d.best_board;
        const aiNext: Player = d.next_turn;
        setBoard(aiBoard);
        setTurn(aiNext);
        // Vérifier draw après coup IA
        if (checkFanorona(aiBoard) === 0 && clientIsDrawn(aiBoard, aiNext)) {
          setIsDraw(true);
        }
      } catch {
        // En cas d'échec réseau, on laisse l'état tel quel
      } finally {
        setThinking(false);
      }
    },
    [difficulty],
  );

  // Jouer un coup humain et enchaîner l'IA si besoin
  const playHumanMove = useCallback(
    async (nb: number[]) => {
      const next: Player = turn === X ? O : X;
      setBoard(nb);
      setTurn(next);
      setSelected(null);

      const w = checkFanorona(nb);
      if (w !== 0) return; // victoire immédiate

      // Vérifier draw après coup humain
      if (clientIsDrawn(nb, next)) {
        setIsDraw(true);
        return;
      }

      // Mode HvIA : l'IA joue si c'est son tour (O = -1)
      if (mode === "hvia" && next === O) {
        await askAI(nb, next);
      }
    },
    [turn, mode, askAI],
  );

  const handleClick = useCallback(
    (idx: number) => {
      // Blocages globaux
      if (winner !== 0 || isDraw || thinking) return;

      // En mode HvH, les deux joueurs jouent
      // En mode HvIA, seul X (humain) clique
      if (mode === "hvia" && turn !== X) return;

      if (placement) {
        if (board[idx] !== 0) return;
        const move = validMoves.find((m) => m[idx] === turn);
        if (move) playHumanMove(move);
      } else {
        if (selected === null) {
          if (board[idx] === turn) setSelected(idx);
        } else {
          if (board[idx] === turn) {
            setSelected(idx);
            return;
          }
          const move = validMoves.find(
            (m) => m[selected] === 0 && m[idx] === turn,
          );
          setSelected(null);
          if (move) playHumanMove(move);
        }
      }
    },
    [
      winner,
      isDraw,
      thinking,
      mode,
      turn,
      placement,
      board,
      validMoves,
      selected,
      playHumanMove,
    ],
  );

  const reset = useCallback(() => {
    setBoard(Array(9).fill(0));
    setTurn(X);
    setSelected(null);
    setIsDraw(false);
  }, []);

  // ─── Label de statut ───────────────────────────────────────────────────
  let statusLabel: string;
  if (winner !== 0) {
    const name =
      mode === "hvh"
        ? winner === X
          ? "Joueur 1 (✕)"
          : "Joueur 2 (◯)"
        : winner === X
          ? "Vous (✕)"
          : "L'IA (◯)";
    statusLabel = `${name} remporte la partie !`;
  } else if (isDraw) {
    statusLabel = "Match nul — aucun mouvement possible.";
  } else if (thinking) {
    statusLabel = "L'IA réfléchit…";
  } else {
    const phase = placement ? "Placement" : "Déplacement";
    if (mode === "hvh") {
      statusLabel = `Tour du Joueur ${turn === X ? "1 (✕)" : "2 (◯)"} — ${phase}`;
    } else {
      statusLabel =
        turn === X ? `Votre tour (✕) — ${phase}` : `L'IA joue (◯) — ${phase}`;
    }
  }

  return {
    board,
    selected,
    thinking,
    statusLabel,
    winner,
    isDraw,
    handleClick,
    reset,
  };
};
