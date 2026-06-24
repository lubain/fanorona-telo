"""
opening_book.py — Bibliothèque de coups d'ouverture pour Fanorona Telo

L'opening book stocke les meilleurs coups pour les premiers tours
(phase de placement uniquement, jusqu'à 4 pièces posées = 2 par joueur).

Construction :
  Le book est généré une seule fois par minimax exhaustif sur l'arbre
  de placement, puis stocké comme dictionnaire statique
  { board_hash → best_move_index }.

Stratégie encodée :
  - Prendre le centre si disponible
  - Ensuite viser les coins (plus de lignes gagnantes)
  - Bloquer l'adversaire dès qu'il menace

Format clé : hash Zobrist de l'état (int 64 bits)
Format valeur : index de case (0-8) à jouer
"""

import math
from typing import Optional
from transposition_table import compute_hash
from bitboard import (
    board_to_bits, bits_to_board, has_winner_bits,
    evaluate_bits, get_moves_for_player, board_hash, popcount
)

# ─── Priorités statiques des cases ──────────────────────────────────────────
# Centre > coins > bords (nombre de lignes gagnantes passant par chaque case)
POSITION_VALUE = [3, 2, 3, 2, 4, 2, 3, 2, 3]

# ─── Génération du book par minimax complet ──────────────────────────────────

def _minimax_book(bx: int, bo: int, turn: int, depth: int) -> float:
    """Minimax simplifié pour générer le book (sans alpha-bêta pour l'exhaustivité)."""
    winner = has_winner_bits(bx, bo)
    if winner != 0:
        return float(winner * turn * 100)

    moves = get_moves_for_player(bx, bo, turn)
    if not moves:
        return 0.0

    occupied = bx | bo
    pieces = popcount(occupied)
    if pieces >= 6 or depth == 0:
        return evaluate_bits(bx, bo, turn)

    next_turn = -turn
    best_val = -math.inf

    for (nbx, nbo, _, _) in moves:
        val = -_minimax_book(nbx, nbo, next_turn, depth - 1)
        if val > best_val:
            best_val = val

    return best_val


def _build_opening_book(max_depth: int = 4) -> dict[int, int]:
    """
    Construit le book pour tous les états de placement jusqu'à max_depth coups.
    Retourne { zobrist_hash → case_à_jouer }.
    """
    book: dict[int, int] = {}

    def explore(bx: int, bo: int, turn: int, depth: int) -> None:
        if depth > max_depth:
            return

        winner = has_winner_bits(bx, bo)
        if winner != 0:
            return

        board = bits_to_board(bx, bo)
        occupied = bx | bo
        pieces = popcount(occupied)
        if pieces >= 6:
            return  # fin de la phase placement

        moves = get_moves_for_player(bx, bo, turn)
        if not moves:
            return

        # Évaluer chaque coup
        best_val = -math.inf
        best_to_sq = -1

        for (nbx, nbo, _, to_sq) in moves:
            # Score minimax + bonus de position
            val = -_minimax_book(nbx, nbo, -turn, max_depth - depth)
            val += POSITION_VALUE[to_sq] * 0.5
            if val > best_val:
                best_val = val
                best_to_sq = to_sq

        # Stocker dans le book
        h = compute_hash(board, turn)
        book[h] = best_to_sq

        # Explorer récursivement
        next_turn = -turn
        for (nbx, nbo, _, _) in moves:
            explore(nbx, nbo, next_turn, depth + 1)

    explore(0, 0, 1, 1)
    return book


# ─── Book statique (calculé au démarrage du serveur) ────────────────────────
print("[OpeningBook] Construction du book d'ouverture…", flush=True)
OPENING_BOOK: dict[int, int] = _build_opening_book(max_depth=4)
print(f"[OpeningBook] {len(OPENING_BOOK)} positions indexées.", flush=True)


def lookup(board: list[int], turn: int) -> Optional[int]:
    """
    Cherche un coup dans l'opening book.
    Retourne l'index de case à jouer, ou None si pas trouvé.
    """
    h = compute_hash(board, turn)
    return OPENING_BOOK.get(h)
