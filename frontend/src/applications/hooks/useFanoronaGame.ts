import { checkFanorona, fanoronaSuccessors } from "@/applications/utils";
import isPlacement from "@/applications/utils/isPlacement";
import { O, X } from "@/domain/constants";
import type { Difficulty, GameMode, Player } from "@/domain/types";
import { apiPost } from "@/infrastructure/ApiPost";
import { useState, useCallback, useRef } from "react";

// ─── Snapshot d'état pour undo/redo ───────────────────────────────────────
interface Snapshot {
  board: number[];
  turn: Player;
  isDraw: boolean;
}

function clientIsDrawn(board: number[], turn: number): boolean {
  if (board.filter((c) => c !== 0).length < 6) return false;
  return fanoronaSuccessors(board, turn).length === 0;
}

function snapshot(board: number[], turn: Player, isDraw: boolean): Snapshot {
  return { board: [...board], turn, isDraw };
}

export const useFanoronaGame = (mode: GameMode, difficulty: Difficulty) => {
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [turn, setTurn] = useState<Player>(X);
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  // lastPlaced: index de la pièce posée/déplacée pour animer
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);

  // Historiques pour undo/redo
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);

  const canUndo = past.current.length > 0 && !thinking;
  const canRedo = future.current.length > 0 && !thinking;

  const winner = checkFanorona(board);
  const placement = isPlacement(board);
  const validMoves = fanoronaSuccessors(board, turn);

  // ─── Appliquer un snapshot ──────────────────────────────────────────────
  const applySnapshot = useCallback(
    (s: Snapshot, placed: number | null = null) => {
      setBoard(s.board);
      setTurn(s.turn);
      setIsDraw(s.isDraw);
      setSelected(null);
      setLastPlaced(placed);
    },
    [],
  );

  // ─── Appel IA ──────────────────────────────────────────────────────────
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

        // Trouver quelle case a changé pour l'animer
        const changedIdx = aiBoard.findIndex((v, i) => v !== nb[i] && v !== 0);

        // Push snapshot avant le coup IA dans past
        past.current.push(snapshot(nb, aiTurn, false));
        future.current = [];

        setBoard(aiBoard);
        setTurn(aiNext);
        setLastPlaced(changedIdx >= 0 ? changedIdx : null);
        if (checkFanorona(aiBoard) === 0 && clientIsDrawn(aiBoard, aiNext)) {
          setIsDraw(true);
        }
      } catch {
        // réseau indisponible — on ne bloque pas
      } finally {
        setThinking(false);
      }
    },
    [difficulty],
  );

  // ─── Jouer un coup humain ───────────────────────────────────────────────
  const playHumanMove = useCallback(
    async (nb: number[], placedIdx: number) => {
      const next: Player = turn === X ? O : X;

      // Sauvegarder l'état courant dans past
      past.current.push(snapshot(board, turn, isDraw));
      future.current = [];

      setBoard(nb);
      setTurn(next);
      setSelected(null);
      setLastPlaced(placedIdx);

      const w = checkFanorona(nb);
      if (w !== 0) return;

      if (clientIsDrawn(nb, next)) {
        setIsDraw(true);
        return;
      }

      if (mode === "hvia" && next === O) {
        await askAI(nb, next);
      }
    },
    [turn, board, isDraw, mode, askAI],
  );

  // ─── Undo ───────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (past.current.length === 0 || thinking) return;

    // En mode HvIA, on remonte 2 coups (coup IA + coup humain)
    // sauf si on est en tout début de partie (un seul état dispo)
    const stepsBack = mode === "hvia" && past.current.length >= 2 ? 2 : 1;

    for (let i = 0; i < stepsBack; i++) {
      const prev = past.current.pop();
      if (!prev) break;
      future.current.push(snapshot(board, turn, isDraw));
      applySnapshot(prev);
    }
  }, [thinking, mode, board, turn, isDraw, applySnapshot]);

  // ─── Redo ───────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    if (future.current.length === 0 || thinking) return;

    const stepsForward = mode === "hvia" && future.current.length >= 2 ? 2 : 1;

    for (let i = 0; i < stepsForward; i++) {
      const next = future.current.pop();
      if (!next) break;
      past.current.push(snapshot(board, turn, isDraw));
      applySnapshot(next);
    }
  }, [thinking, mode, board, turn, isDraw, applySnapshot]);

  // ─── Clic sur une case ─────────────────────────────────────────────────
  const handleClick = useCallback(
    (idx: number) => {
      if (winner !== 0 || isDraw || thinking) return;
      if (mode === "hvia" && turn !== X) return;

      if (placement) {
        if (board[idx] !== 0) return;
        const move = validMoves.find((m) => m[idx] === turn);
        if (move) playHumanMove(move, idx);
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
          if (move) playHumanMove(move, idx);
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

  // ─── Reset ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    past.current = [];
    future.current = [];
    setBoard(Array(9).fill(0));
    setTurn(X);
    setSelected(null);
    setIsDraw(false);
    setLastPlaced(null);
  }, []);

  // ─── Label statut ──────────────────────────────────────────────────────
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
    lastPlaced,
    canUndo,
    canRedo,
    handleClick,
    reset,
    undo,
    redo,
  };
};
