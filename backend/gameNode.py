from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

# --- Types Génériques ---
TNode = TypeVar('TNode', bound='GameNode')
TPlayer = TypeVar('TPlayer')

class GameNode(ABC, Generic[TNode, TPlayer]):
    def __init__(self, turn: TPlayer):
        self.turn: TPlayer = turn
        self.best: Optional[TNode] = None

    @abstractmethod
    def get_successors(self) -> List[TNode]:
        pass

    @abstractmethod
    def is_terminal(self) -> bool:
        pass

    @abstractmethod
    def evaluate(self, player: TPlayer) -> float:
        pass
