import math
from gameNode import GameNode

def alpha_beta(
    node: GameNode,
    depth: int,
    alpha: float,
    beta: float,
    maximizing_player: int
) -> float:
    if depth == 0 or node.is_terminal():
        return node.evaluate(maximizing_player)

    children = node.get_successors()
    node.best = None

    if node.turn == maximizing_player:
        value = -math.inf
        for child in children:
            eval_value = alpha_beta(child, depth - 1, alpha, beta, maximizing_player)
            if eval_value > value:
                value = eval_value
                node.best = child
            alpha = max(alpha, value)
            if beta <= alpha:
                break
        return value
    else:
        value = math.inf
        for child in children:
            eval_value = alpha_beta(child, depth - 1, alpha, beta, maximizing_player)
            if eval_value < value:
                value = eval_value
                node.best = child
            beta = min(beta, value)
            if beta <= alpha:
                break
        return value
