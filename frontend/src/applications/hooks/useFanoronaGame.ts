import { checkFanorona, fanoronaSuccessors } from "@/applications/utils";
import isPlacement from "@/applications/utils/isPlacement";
import { O, X } from "@/domain/constants";
import { apiPost } from "@/infrastructure/ApiPost";
import { useState } from "react";

export const useFanoronaGame = () => {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [turn, setTurn] = useState(X);
  const [selected, setSelected] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);

  const winner = checkFanorona(board);
  const placement = isPlacement(board);
  const validMoves = fanoronaSuccessors(board, turn);

  const playMove = async (nb: number[]) => {
    const next = turn === X ? O : X;
    setBoard(nb);
    setTurn(next);
    if (checkFanorona(nb) !== 0) return;
    setThinking(true);
    try {
      const d = await apiPost("/fanorona-move", { board: nb, turn: next });
      setBoard(d.best_board);
      setTurn(d.next_turn);
    } catch {
    } finally {
      setThinking(false);
    }
  };

  const handleClick = (idx: number) => {
    if (winner !== 0 || turn !== X || thinking) return;
    if (placement) {
      if (board[idx] !== 0) return;
      const move = validMoves.find((m) => m[idx] === X);
      if (move) playMove(move);
    } else {
      if (selected === null) {
        if (board[idx] === X) setSelected(idx);
      } else {
        if (board[idx] === X) {
          setSelected(idx);
          return;
        }
        const move = validMoves.find((m) => m[selected] === 0 && m[idx] === X);
        setSelected(null);
        if (move) playMove(move);
      }
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(0));
    setTurn(X);
    setSelected(null);
  };

  const statusLabel =
    winner !== 0
      ? `${winner === X ? "🔵 X" : "🔴 O"} remporte la partie !`
      : thinking
        ? "L'IA réfléchit…"
        : `Tour de ${turn === X ? "X (vous)" : "O (IA)"} — ${placement ? "Placement" : "Déplacement"}`;
  return {
    board,
    selected,
    thinking,
    statusLabel,
    handleClick,
    reset,
  };
};
