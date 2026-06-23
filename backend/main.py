from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from fanoronaTelo import FanoronaTeloNode
from alpha_beta import alpha_beta
from typing import List
from pydantic import BaseModel, Field
import math

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

class GameResponse(BaseModel):
    best_board: List[int]
    next_turn: int
    message: str

# ═══════════════════════════════════════════════════════════════════════════
#  FANORONA TELO
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/fanorona-move", response_model=GameResponse)
def get_fanorona_move(request: GameRequest):
    node = FanoronaTeloNode(board=request.board, turn=request.turn)

    if node.is_terminal():
        raise HTTPException(status_code=400, detail="Partie finie.")

    alpha_beta(node, depth=9, alpha=-math.inf, beta=math.inf, maximizing_player=node.turn)

    return GameResponse(
        best_board=node.best.board,
        next_turn=node.best.turn,
        message="Meilleur coup calculé avec succès."
    )
