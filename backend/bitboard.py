"""
bitboard.py — Représentation bitboard du plateau Fanorona Telo 3×3

Le plateau 3×3 est encodé dans deux entiers 9 bits :
  board_x : bits positionnés pour les pièces du joueur X (1)
  board_o : bits positionnés pour les pièces du joueur O (-1)

Bit layout (index → bit) :
  0 | 1 | 2
  ---------
  3 | 4 | 5
  ---------
  6 | 7 | 8

Exemple : case 4 (centre) → bit 4 → masque 0b000010000 = 16

Avantages :
  - Détection de victoire : AND(board_x, ligne_mask) == ligne_mask → O(1)
  - Hash d'état : entier unique (board_x << 9 | board_o) → O(1)
  - Copie d'état : deux entiers → pas d'allocation de liste
"""

from typing import Tuple

# ─── Masques des 8 lignes gagnantes ─────────────────────────────────────────
LINE_MASKS = [
    0b000000111,  # 0-1-2  horizontale haut
    0b000111000,  # 3-4-5  horizontale milieu
    0b111000000,  # 6-7-8  horizontale bas
    0b001001001,  # 0-3-6  verticale gauche
    0b010010010,  # 1-4-7  verticale milieu
    0b100100100,  # 2-5-8  verticale droite
    0b100010001,  # 0-4-8  diagonale principale
    0b001010100,  # 2-4-6  diagonale anti
]

# ─── Masques d'adjacence par case ───────────────────────────────────────────
# adjacences[i] = masque de bits de toutes les cases voisines de i
ADJACENCE_MASKS = [
    (1<<1)|(1<<3)|(1<<4),                                           # 0
    (1<<0)|(1<<2)|(1<<4),                                           # 1
    (1<<1)|(1<<4)|(1<<5),                                           # 2
    (1<<0)|(1<<4)|(1<<6),                                           # 3
    (1<<0)|(1<<1)|(1<<2)|(1<<3)|(1<<5)|(1<<6)|(1<<7)|(1<<8),      # 4
    (1<<2)|(1<<4)|(1<<8),                                           # 5
    (1<<3)|(1<<4)|(1<<7),                                           # 6
    (1<<4)|(1<<6)|(1<<8),                                           # 7
    (1<<4)|(1<<5)|(1<<7),                                           # 8
]

# ─── Masque complet du plateau ───────────────────────────────────────────────
FULL_BOARD = 0b111111111  # 511


def board_to_bits(board: list[int]) -> Tuple[int, int]:
    """Convertit une liste [1/-1/0]*9 en (board_x, board_o)."""
    bx = bo = 0
    for i, cell in enumerate(board):
        if cell == 1:
            bx |= (1 << i)
        elif cell == -1:
            bo |= (1 << i)
    return bx, bo


def bits_to_board(bx: int, bo: int) -> list[int]:
    """Convertit (board_x, board_o) en liste [1/-1/0]*9."""
    board = [0] * 9
    for i in range(9):
        if bx & (1 << i):
            board[i] = 1
        elif bo & (1 << i):
            board[i] = -1
    return board


def has_winner_bits(bx: int, bo: int) -> int:
    """Détecte un gagnant via opérations bit à bit. Retourne 1, -1, ou 0."""
    for mask in LINE_MASKS:
        if (bx & mask) == mask:
            return 1
        if (bo & mask) == mask:
            return -1
    return 0


def board_hash(bx: int, bo: int) -> int:
    """Hash unique d'un état : encode les deux bitboards en un seul entier."""
    return (bx << 9) | bo


def popcount(n: int) -> int:
    """Compte le nombre de bits à 1 (équivalent à bin(n).count('1'))."""
    return bin(n).count('1')


def get_empty_squares(bx: int, bo: int) -> list[int]:
    """Retourne la liste des indices des cases vides."""
    occupied = bx | bo
    return [i for i in range(9) if not (occupied & (1 << i))]


def get_moves_for_player(bx: int, bo: int, player: int) -> list[Tuple[int,int,int,int]]:
    """
    Retourne les coups disponibles sous forme (bx_new, bo_new, from_sq, to_sq).
    - phase placement si nb_pièces < 6
    - phase déplacement sinon
    """
    occupied = bx | bo
    pieces_placed = popcount(occupied)
    moves = []

    if pieces_placed < 6:
        # Phase placement : poser sur une case vide
        empty = FULL_BOARD & ~occupied
        idx = empty
        while idx:
            lsb = idx & (-idx)         # bit le plus bas
            sq = lsb.bit_length() - 1
            if player == 1:
                moves.append((bx | lsb, bo, -1, sq))
            else:
                moves.append((bx, bo | lsb, -1, sq))
            idx &= idx - 1            # supprimer le lsb
    else:
        # Phase déplacement : déplacer vers une case adjacente vide
        my_pieces = bx if player == 1 else bo
        tmp = my_pieces
        while tmp:
            lsb = tmp & (-tmp)
            sq = lsb.bit_length() - 1
            adj = ADJACENCE_MASKS[sq] & ~occupied
            adj_tmp = adj
            while adj_tmp:
                adj_lsb = adj_tmp & (-adj_tmp)
                to_sq = adj_lsb.bit_length() - 1
                if player == 1:
                    new_bx = (bx & ~lsb) | adj_lsb
                    moves.append((new_bx, bo, sq, to_sq))
                else:
                    new_bo = (bo & ~lsb) | adj_lsb
                    moves.append((bx, new_bo, sq, to_sq))
                adj_tmp &= adj_tmp - 1
            tmp &= tmp - 1
    return moves


def evaluate_bits(bx: int, bo: int, player: int) -> float:
    """
    Fonction d'évaluation sur bitboards.
    Identique à l'originale mais avec opérations bit à bit.
    """
    winner = has_winner_bits(bx, bo)
    if winner != 0:
        return float(winner * player * 100)

    score = 0.0
    CENTER = 1 << 4

    my_bb   = bx if player == 1 else bo
    opp_bb  = bo if player == 1 else bx
    occupied = bx | bo

    # Bonus centre
    if my_bb & CENTER:
        score += 10
    elif opp_bb & CENTER:
        score -= 10

    # Menaces et blocages
    for mask in LINE_MASKS:
        my_in_line  = popcount(my_bb  & mask)
        opp_in_line = popcount(opp_bb & mask)
        empty_in_line = popcount(~occupied & mask & FULL_BOARD)

        if my_in_line == 2 and empty_in_line == 1:
            score += 20
        if opp_in_line == 2 and empty_in_line == 1:
            score -= 50

    return score
