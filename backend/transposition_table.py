"""
transposition_table.py — Table de transposition avec Zobrist hashing

La table de transposition évite de recalculer des états déjà explorés.
Chaque entrée stocke :
  - score  : valeur évaluée
  - depth  : profondeur à laquelle l'état a été évalué
  - flag   : EXACT | LOWERBOUND | UPPERBOUND (pour la fenêtre alpha-bêta)
  - best_move : meilleur coup stocké pour le move ordering

Zobrist hashing :
  - 9 cases × 3 valeurs (X, vide, O) = 27 nombres aléatoires 64 bits
  - Hash = XOR de tous les nombres correspondant aux pièces placées
  - Propriété : hash(état) peut être mis à jour incrémentalement en XOR
"""

import random
from typing import Optional, Tuple, Dict

# ─── Flags ───────────────────────────────────────────────────────────────────
EXACT       = 0   # score exact (pas de coupure)
LOWERBOUND  = 1   # score ≥ valeur (coupure bêta)
UPPERBOUND  = 2   # score ≤ valeur (coupure alpha)

# ─── Zobrist table ───────────────────────────────────────────────────────────
# Seed fixe pour reproductibilité
random.seed(0xFA1706A)  # 0xFANORONA → encodé numériquement

# zobrist_table[case][joueur_index]
# joueur_index : 0 = X (1), 1 = O (-1)  (2 = vide, pas de hash)
ZOBRIST_TABLE: list[list[int]] = [
    [random.getrandbits(64), random.getrandbits(64)]
    for _ in range(9)
]
# Hash du joueur courant (alterné à chaque coup)
ZOBRIST_TURN: list[int] = [random.getrandbits(64), random.getrandbits(64)]


def compute_hash(board: list[int], turn: int) -> int:
    """Calcule le hash Zobrist d'un état complet."""
    h = 0
    for i, cell in enumerate(board):
        if cell == 1:
            h ^= ZOBRIST_TABLE[i][0]
        elif cell == -1:
            h ^= ZOBRIST_TABLE[i][1]
    # XOR avec le hash du joueur courant
    h ^= ZOBRIST_TURN[0 if turn == 1 else 1]
    return h


def update_hash(h: int, sq: int, old_cell: int, new_cell: int, old_turn: int, new_turn: int) -> int:
    """
    Mise à jour incrémentale du hash après un coup.
    XOR enlève l'ancienne valeur et ajoute la nouvelle.
    """
    if old_cell != 0:
        h ^= ZOBRIST_TABLE[sq][0 if old_cell == 1 else 1]
    if new_cell != 0:
        h ^= ZOBRIST_TABLE[sq][0 if new_cell == 1 else 1]
    # Alterner le hash du joueur
    h ^= ZOBRIST_TURN[0 if old_turn == 1 else 1]
    h ^= ZOBRIST_TURN[0 if new_turn == 1 else 1]
    return h


# ─── Entrée de la table ──────────────────────────────────────────────────────
class TTEntry:
    __slots__ = ('score', 'depth', 'flag', 'best_bx', 'best_bo')

    def __init__(self, score: float, depth: int, flag: int,
                 best_bx: Optional[int] = None, best_bo: Optional[int] = None):
        self.score   = score
        self.depth   = depth
        self.flag    = flag
        self.best_bx = best_bx   # bitboards du meilleur successeur
        self.best_bo = best_bo


# ─── Table de transposition ──────────────────────────────────────────────────
class TranspositionTable:
    """
    Table de transposition bornée en taille (max_size entrées).
    Stratégie de remplacement : toujours remplacer (simple et efficace
    pour un jeu de faible complexité comme Fanorona Telo).
    """

    def __init__(self, max_size: int = 200_000):
        self._table: Dict[int, TTEntry] = {}
        self._max_size = max_size
        self.hits = 0
        self.misses = 0
        self.stores = 0

    def get(self, h: int) -> Optional[TTEntry]:
        entry = self._table.get(h)
        if entry is not None:
            self.hits += 1
        else:
            self.misses += 1
        return entry

    def store(self, h: int, score: float, depth: int, flag: int,
              best_bx: Optional[int] = None, best_bo: Optional[int] = None) -> None:
        if len(self._table) >= self._max_size:
            # Remplacement simple : vider 10% de la table
            keys_to_delete = list(self._table.keys())[:self._max_size // 10]
            for k in keys_to_delete:
                del self._table[k]
        self._table[h] = TTEntry(score, depth, flag, best_bx, best_bo)
        self.stores += 1

    def clear(self) -> None:
        self._table.clear()
        self.hits = self.misses = self.stores = 0

    @property
    def size(self) -> int:
        return len(self._table)

    def stats(self) -> dict:
        total = self.hits + self.misses
        hit_rate = self.hits / total * 100 if total else 0
        return {
            "size": self.size,
            "hits": self.hits,
            "misses": self.misses,
            "stores": self.stores,
            "hit_rate_pct": round(hit_rate, 1),
        }
