from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from fanoronaTelo import FanoronaTeloNode, has_winner
from alpha_beta import alpha_beta
from typing import List, Optional
from pydantic import BaseModel, Field
import math
import random

app = FastAPI(
    title="Fanorona Telo Games API",
    description="Moteur IA Alpha-Beta pour Fanorona Telo",
    version="1.0.0"
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
#  SCHÉMAS COMMUNS
# ═══════════════════════════════════════════════════════════════════════════

class GameRequest(BaseModel):
    board: List[int]
    turn: int
    difficulty: Optional[str] = "hard"  # "easy" | "medium" | "hard"

class GameResponse(BaseModel):
    best_board: List[int]
    next_turn: int
    message: str

class GameStatusResponse(BaseModel):
    winner: int        # 1, -1, or 0
    is_draw: bool
    message: str

# ═══════════════════════════════════════════════════════════════════════════
#  UTILITAIRE : vérifier match nul (plus aucun mouvement possible)
# ═══════════════════════════════════════════════════════════════════════════

def is_draw(board: List[int], turn: int) -> bool:
    """Retourne True si le joueur `turn` n'a aucun coup disponible."""
    if has_winner(board) != 0:
        return False
    node = FanoronaTeloNode(board=board, turn=turn)
    if node.is_placement_phase():
        return False  # En phase de placement il y a toujours un vide
    return len(node.get_successors()) == 0

# ═══════════════════════════════════════════════════════════════════════════
#  FANORONA TELO : coup IA avec niveau de difficulté
# ═══════════════════════════════════════════════════════════════════════════

DEPTH_BY_DIFFICULTY = {
    "easy": 1,
    "medium": 3,
    "hard": 9,
}

@app.post("/fanorona-move", response_model=GameResponse)
def get_fanorona_move(request: GameRequest):
    node = FanoronaTeloNode(board=request.board, turn=request.turn)

    if node.is_terminal():
        raise HTTPException(status_code=400, detail="Partie finie.")

    successors = node.get_successors()
    if not successors:
        raise HTTPException(status_code=400, detail="Aucun coup disponible (match nul).")

    difficulty = (request.difficulty or "hard").lower()

    if difficulty == "easy":
        # Facile : coup aléatoire
        chosen = random.choice(successors)
        return GameResponse(
            best_board=chosen.board,
            next_turn=chosen.turn,
            message="Coup facile calculé."
        )
    elif difficulty == "medium":
        # Moyen : Alpha-Beta profondeur 3, avec 20% de chance d'un coup aléatoire
        if random.random() < 0.20:
            chosen = random.choice(successors)
        else:
            depth = DEPTH_BY_DIFFICULTY["medium"]
            alpha_beta(node, depth=depth, alpha=-math.inf, beta=math.inf, maximizing_player=node.turn)
            chosen = node.best or random.choice(successors)
        return GameResponse(
            best_board=chosen.board,
            next_turn=chosen.turn,
            message="Coup moyen calculé."
        )
    else:
        # Difficile : Alpha-Beta profondeur 9 (optimal)
        depth = DEPTH_BY_DIFFICULTY["hard"]
        alpha_beta(node, depth=depth, alpha=-math.inf, beta=math.inf, maximizing_player=node.turn)
        best = node.best or random.choice(successors)
        return GameResponse(
            best_board=best.board,
            next_turn=best.turn,
            message="Meilleur coup calculé avec succès."
        )


# ═══════════════════════════════════════════════════════════════════════════
#  VÉRIFICATION ÉTAT DU JEU (winner + draw)
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
