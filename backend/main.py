from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from fanoronaTelo import FanoronaTeloNode, has_winner
from alpha_beta_advanced import iterative_deepening, TT
from bitboard import board_to_bits, get_moves_for_player, bits_to_board, has_winner_bits
from typing import List, Optional
from pydantic import BaseModel
import random

app = FastAPI(
    title="Fanorona Telo — Moteur IA Avancé",
    description="Alpha-Bêta + Table de transposition + Iterative Deepening + Opening Book + Bitboards",
    version="2.0.0"
)

allowed_origins = [
    origin.strip()
    for origin in settings.frontend_urls.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════
#  SCHÉMAS
# ═══════════════════════════════════════════════════════════════════════════

class GameRequest(BaseModel):
    board: List[int]
    turn: int
    difficulty: Optional[str] = "hard"

class GameResponse(BaseModel):
    best_board: List[int]
    next_turn: int
    message: str
    stats: Optional[dict] = None

class GameStatusResponse(BaseModel):
    winner: int
    is_draw: bool
    message: str

class TTStatsResponse(BaseModel):
    size: int
    hits: int
    misses: int
    stores: int
    hit_rate_pct: float


# ═══════════════════════════════════════════════════════════════════════════
#  UTILITAIRES
# ═══════════════════════════════════════════════════════════════════════════

DEPTH_BY_DIFFICULTY = {
    "easy":   1,
    "medium": 3,
    "hard":   9,
}

def is_draw(board: List[int], turn: int) -> bool:
    if has_winner(board) != 0:
        return False
    node = FanoronaTeloNode(board=board, turn=turn)
    if node.is_placement_phase():
        return False
    return len(node.get_successors()) == 0


# ═══════════════════════════════════════════════════════════════════════════
#  ENDPOINT PRINCIPAL — coup IA
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/fanorona-move", response_model=GameResponse)
def get_fanorona_move(request: GameRequest):
    bx, bo = board_to_bits(request.board)
    winner = has_winner_bits(bx, bo)
    if winner != 0:
        raise HTTPException(status_code=400, detail="Partie déjà terminée.")

    moves = get_moves_for_player(bx, bo, request.turn)
    if not moves:
        raise HTTPException(status_code=400, detail="Aucun coup disponible.")

    difficulty = (request.difficulty or "hard").lower()

    # ── Facile : coup aléatoire ──────────────────────────────────────────
    if difficulty == "easy":
        nbx, nbo, _, _ = random.choice(moves)
        best_board = bits_to_board(nbx, nbo)
        return GameResponse(
            best_board=best_board,
            next_turn=-request.turn,
            message="Coup aléatoire (facile).",
        )

    # ── Moyen : ID profondeur 3 + 20% aléatoire ─────────────────────────
    if difficulty == "medium":
        if random.random() < 0.20:
            nbx, nbo, _, _ = random.choice(moves)
            best_board = bits_to_board(nbx, nbo)
            return GameResponse(
                best_board=best_board,
                next_turn=-request.turn,
                message="Coup aléatoire (moyen, 20%).",
            )
        max_depth = DEPTH_BY_DIFFICULTY["medium"]
    else:
        max_depth = DEPTH_BY_DIFFICULTY["hard"]

    # ── Difficile / Moyen : Iterative Deepening + TT + Opening Book ─────
    best_board, next_turn, stats = iterative_deepening(
        board=request.board,
        turn=request.turn,
        max_depth=max_depth,
        time_limit_ms=4000.0,
    )

    source = stats.get("source", "")
    depths = stats.get("depths_completed", [])
    reached = depths[-1]["depth"] if depths else max_depth
    total_ms = stats.get("total_ms", 0)

    if source == "opening_book":
        msg = f"Coup d'ouverture (book) — case {stats.get('sq')}."
    else:
        msg = f"Iterative deepening — profondeur {reached} en {total_ms:.1f} ms."

    return GameResponse(
        best_board=best_board,
        next_turn=next_turn,
        message=msg,
        stats=stats,
    )


# ═══════════════════════════════════════════════════════════════════════════
#  STATUT DU JEU
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/fanorona-status", response_model=GameStatusResponse)
def get_game_status(request: GameRequest):
    winner = has_winner(request.board)
    if winner != 0:
        name = "X" if winner == 1 else "O"
        return GameStatusResponse(winner=winner, is_draw=False, message=f"{name} remporte la partie !")
    draw = is_draw(request.board, request.turn)
    if draw:
        return GameStatusResponse(winner=0, is_draw=True, message="Match nul — aucun mouvement possible.")
    return GameStatusResponse(winner=0, is_draw=False, message="Partie en cours.")


# ═══════════════════════════════════════════════════════════════════════════
#  STATS TRANSPOSITION TABLE
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/tt-stats", response_model=TTStatsResponse)
def get_tt_stats():
    """Retourne les statistiques de la table de transposition (debug/monitoring)."""
    return TT.stats()

@app.delete("/tt-clear")
def clear_tt():
    """Vide la table de transposition."""
    TT.clear()
    return {"message": "Table de transposition vidée."}
