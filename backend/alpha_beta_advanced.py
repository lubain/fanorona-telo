"""
alpha_beta_advanced.py — Moteur Alpha-Bêta avec techniques avancées

Techniques intégrées :
  1. Bitboards      — représentation compacte, hash O(1), opérations bit à bit
  2. Table de transposition — évite les recalculs (Zobrist hashing)
  3. Iterative Deepening  — cherche depth=1,2,…,max_depth ; retourne le meilleur
                           coup trouvé dans le temps imparti ; assure le move
                           ordering grâce aux résultats de l'itération précédente
  4. Move ordering  — le meilleur coup de la TT est testé en premier, ce qui
                      maximise les coupures alpha-bêta
"""

import math
import time
from typing import Optional, Tuple

from bitboard import (
    board_to_bits, bits_to_board, has_winner_bits,
    evaluate_bits, get_moves_for_player, board_hash, popcount, FULL_BOARD
)
from transposition_table import (
    TranspositionTable, compute_hash,
    EXACT, LOWERBOUND, UPPERBOUND
)
from opening_book import lookup as book_lookup

# ─── Table de transposition globale (partagée entre les requêtes) ────────────
TT = TranspositionTable(max_size=500_000)


# ════════════════════════════════════════════════════════════════════════════
#  ALPHA-BÊTA SUR BITBOARDS AVEC TABLE DE TRANSPOSITION
# ════════════════════════════════════════════════════════════════════════════

def _alpha_beta_tt(
    bx: int, bo: int, turn: int,
    depth: int, alpha: float, beta: float,
    maximizing_player: int,
    tt: TranspositionTable,
    zobrist_hash: int,
) -> float:
    """
    Alpha-Bêta récursif avec :
      - bitboards (bx, bo)
      - table de transposition (tt)
      - hash Zobrist incrémental
    """
    original_alpha = alpha

    # ── Consultation de la table de transposition ─────────────────────────
    entry = tt.get(zobrist_hash)
    if entry is not None and entry.depth >= depth:
        if entry.flag == EXACT:
            return entry.score
        elif entry.flag == LOWERBOUND:
            alpha = max(alpha, entry.score)
        elif entry.flag == UPPERBOUND:
            beta = min(beta, entry.score)
        if alpha >= beta:
            return entry.score

    # ── Cas terminal ──────────────────────────────────────────────────────
    winner = has_winner_bits(bx, bo)
    if winner != 0:
        score = float(winner * maximizing_player * 100)
        tt.store(zobrist_hash, score, depth, EXACT)
        return score

    if depth == 0:
        score = evaluate_bits(bx, bo, maximizing_player)
        tt.store(zobrist_hash, score, depth, EXACT)
        return score

    moves = get_moves_for_player(bx, bo, turn)
    if not moves:
        # Aucun coup disponible = match nul
        tt.store(zobrist_hash, 0.0, depth, EXACT)
        return 0.0

    # ── Move ordering : placer le coup de la TT en premier ───────────────
    if entry is not None and entry.best_bx is not None:
        tt_key = (entry.best_bx, entry.best_bo)
        # Déplacer ce coup en tête de liste
        moves_ordered = []
        rest = []
        for m in moves:
            if m[0] == tt_key[0] and m[1] == tt_key[1]:
                moves_ordered.insert(0, m)
            else:
                rest.append(m)
        moves = moves_ordered + rest

    next_turn = -turn
    best_bx_found: Optional[int] = None
    best_bo_found: Optional[int] = None

    if turn == maximizing_player:
        value = -math.inf
        for (nbx, nbo, from_sq, to_sq) in moves:
            # Hash incrémental : retirer la pièce source, poser la pièce dest
            occupied_before = bx | bo
            pieces_placed = popcount(occupied_before)

            if pieces_placed < 6:
                # Placement : juste ajouter la pièce
                new_cell = turn
                new_h = zobrist_hash
                new_h ^= _zobrist_sq(to_sq, 0 if turn == 1 else 1)   # ajouter pièce
                new_h ^= _zobrist_turn(turn)
                new_h ^= _zobrist_turn(next_turn)
            else:
                # Déplacement : retirer de from_sq, poser à to_sq
                new_h = zobrist_hash
                new_h ^= _zobrist_sq(from_sq, 0 if turn == 1 else 1)  # retirer
                new_h ^= _zobrist_sq(to_sq,   0 if turn == 1 else 1)  # poser
                new_h ^= _zobrist_turn(turn)
                new_h ^= _zobrist_turn(next_turn)

            child_val = _alpha_beta_tt(nbx, nbo, next_turn, depth - 1,
                                       alpha, beta, maximizing_player, tt, new_h)
            if child_val > value:
                value = child_val
                best_bx_found = nbx
                best_bo_found = nbo
            alpha = max(alpha, value)
            if alpha >= beta:
                break  # coupure bêta

    else:
        value = math.inf
        for (nbx, nbo, from_sq, to_sq) in moves:
            occupied_before = bx | bo
            pieces_placed = popcount(occupied_before)

            if pieces_placed < 6:
                new_h = zobrist_hash
                new_h ^= _zobrist_sq(to_sq, 0 if turn == 1 else 1)
                new_h ^= _zobrist_turn(turn)
                new_h ^= _zobrist_turn(next_turn)
            else:
                new_h = zobrist_hash
                new_h ^= _zobrist_sq(from_sq, 0 if turn == 1 else 1)
                new_h ^= _zobrist_sq(to_sq,   0 if turn == 1 else 1)
                new_h ^= _zobrist_turn(turn)
                new_h ^= _zobrist_turn(next_turn)

            child_val = _alpha_beta_tt(nbx, nbo, next_turn, depth - 1,
                                       alpha, beta, maximizing_player, tt, new_h)
            if child_val < value:
                value = child_val
                best_bx_found = nbx
                best_bo_found = nbo
            beta = min(beta, value)
            if beta <= alpha:
                break  # coupure alpha

    # ── Stocker dans la table de transposition ────────────────────────────
    flag = EXACT
    if value <= original_alpha:
        flag = UPPERBOUND
    elif value >= beta:
        flag = LOWERBOUND
    tt.store(zobrist_hash, value, depth, flag, best_bx_found, best_bo_found)

    return value


# ── Accès rapide aux tables Zobrist (évite l'import circulaire) ───────────────
from transposition_table import ZOBRIST_TABLE, ZOBRIST_TURN

def _zobrist_sq(sq: int, player_idx: int) -> int:
    return ZOBRIST_TABLE[sq][player_idx]

def _zobrist_turn(turn: int) -> int:
    return ZOBRIST_TURN[0 if turn == 1 else 1]


# ════════════════════════════════════════════════════════════════════════════
#  ITERATIVE DEEPENING
# ════════════════════════════════════════════════════════════════════════════

def iterative_deepening(
    board: list[int],
    turn: int,
    max_depth: int = 9,
    time_limit_ms: float = 5000.0,
) -> Tuple[list[int], int, dict]:
    """
    Cherche le meilleur coup par approfondissement itératif.

    À chaque itération d (de 1 à max_depth) :
      - Lance alpha_beta_tt à profondeur d
      - Mémorise le meilleur coup trouvé
      - Si la profondeur suivante dépasserait time_limit_ms, s'arrête

    Retourne (best_board, next_turn, stats_dict).
    """
    # ── 1. Opening book ───────────────────────────────────────────────────
    book_sq = book_lookup(board, turn)
    if book_sq is not None:
        nb = board.copy()
        nb[book_sq] = turn
        next_turn = -turn
        return nb, next_turn, {"source": "opening_book", "sq": book_sq}

    bx, bo = board_to_bits(board)
    moves = get_moves_for_player(bx, bo, turn)
    if not moves:
        return board, -turn, {"source": "no_moves"}

    start = time.perf_counter()

    best_bx: int = moves[0][0]
    best_bo: int = moves[0][1]
    best_score: float = -math.inf
    stats = {"depths_completed": [], "tt_stats": {}, "source": "iterative_deepening"}

    root_hash = compute_hash(board, turn)

    for depth in range(1, max_depth + 1):
        depth_start = time.perf_counter()

        # Alpha-bêta à cette profondeur
        score = _alpha_beta_tt(
            bx, bo, turn,
            depth, -math.inf, math.inf,
            turn, TT, root_hash
        )

        # Récupérer le meilleur coup depuis la TT
        entry = TT.get(root_hash)
        if entry is not None and entry.best_bx is not None:
            best_bx = entry.best_bx
            best_bo = entry.best_bo
            best_score = score

        elapsed_ms = (time.perf_counter() - start) * 1000
        depth_ms   = (time.perf_counter() - depth_start) * 1000
        stats["depths_completed"].append({
            "depth": depth,
            "score": round(score, 2),
            "time_ms": round(depth_ms, 3),
        })

        # Arrêt si victoire trouvée ou temps dépassé
        if abs(score) >= 100 or elapsed_ms >= time_limit_ms:
            break

    stats["total_ms"] = round((time.perf_counter() - start) * 1000, 3)
    stats["tt_stats"] = TT.stats()

    best_board = bits_to_board(best_bx, best_bo)
    next_turn  = -turn
    return best_board, next_turn, stats
