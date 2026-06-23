export function checkFanorona(board: number[]): number {
  for (const [a, b, c] of [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ])
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c])
      return board[a];
  return 0;
}
