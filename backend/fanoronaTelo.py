from typing import List, Optional, Literal
from constant import X_PLAYER, O_PLAYER, PIECES_PER_PLAYER, LINES, ADJACENCES
from gameNode import GameNode

Cell = Literal[1, -1, 0]

def has_winner(board: List[Cell]) -> Cell:
    for a, b, c in LINES:
        if board[a] != 0 and board[a] == board[b] == board[c]:
            return board[a]
    return 0

class FanoronaTeloNode(GameNode['FanoronaTeloNode', int]):
    def __init__(self, board: Optional[List[int]] = None, turn: int = X_PLAYER):
        super().__init__(turn)
        self.board = list(board) if board else [0] * 9

    def play(self, position: int) -> None:
        self.board[position] = self.turn
        self.turn = O_PLAYER if self.turn == X_PLAYER else X_PLAYER

    def clone(self) -> 'FanoronaTeloNode':
        return FanoronaTeloNode(self.board.copy(), self.turn)

    def is_placement_phase(self) -> bool:
        total_pieces = sum(1 for cell in self.board if cell != 0)
        return total_pieces < PIECES_PER_PLAYER * 2

    def get_successors(self) -> List['FanoronaTeloNode']:
        successors = []
        if self.is_placement_phase():
            for i in range(9):
                if self.board[i] == 0:
                    child = self.clone()
                    child.play(i)
                    successors.append(child)
        else:
            for i in range(9):
                if self.board[i] == self.turn:
                    for voisin in ADJACENCES[i]:
                        if self.board[voisin] == 0:
                            child = self.clone()
                            child.board[i] = 0
                            child.play(voisin)
                            successors.append(child)
        return successors

    def evaluate(self, player: int) -> float:
        # 1. Victoire/Défaite (Priorité absolue)
        winner = has_winner(self.board)
        if winner != 0:
            return float(winner * player * 100)

        score = 0.0
        
        # 2. Bonus pour le centre (La case 4 est stratégique)
        if self.board[4] == player:
            score += 10
        elif self.board[4] == -player:
            score -= 10

        # 3. Bonus pour les menaces (2 pions alignés + 1 vide)
        for a, b, c in LINES:
            line = [self.board[a], self.board[b], self.board[c]]
            if line.count(player) == 2 and line.count(0) == 1:
                score += 20
            if line.count(-player) == 2 and line.count(0) == 1:
                score -= 50 # On punit sévèrement si on ne bloque pas l'adversaire

        return score
    def is_terminal(self) -> bool:
        return has_winner(self.board) != 0