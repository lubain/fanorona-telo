import { FANORONA_ADJ } from "@/domain/constants";
import isPlacement from "./isPlacement";

export function fanoronaSuccessors(
  board: number[],
  player: number,
): number[][] {
  if (isPlacement(board)) {
    return board
      .map((c, i) =>
        c === 0 ? board.map((v, j) => (j === i ? player : v)) : null,
      )
      .filter(Boolean) as number[][];
  }
  const moves: number[][] = [];
  board.forEach((c, i) => {
    if (c !== player) return;
    FANORONA_ADJ[i].forEach((j) => {
      if (board[j] !== 0) return;
      const nb = [...board];
      nb[i] = 0;
      nb[j] = player;
      moves.push(nb);
    });
  });
  return moves;
}
