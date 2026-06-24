import { useState } from "react";
import FanoronaGame from "./page/FanoronaGame";
import GameSetup from "./page/GameSetup";
import type { Difficulty, GameMode } from "@/domain/types";

type AppState =
  | { screen: "setup" }
  | { screen: "game"; mode: GameMode; difficulty: Difficulty, difficultyX: Difficulty | undefined, difficultyO: Difficulty | undefined };

const App = () => {
  const [state, setState] = useState<AppState>({ screen: "setup" });

  if (state.screen === "game") {
    return (
      <FanoronaGame
        mode={state.mode}
        difficulty={state.difficulty}
        onBack={() => setState({ screen: "setup" })}
        difficultyX={state.difficultyX}
        difficultyO={state.difficultyO}
      />
    );
  }

  return (
    <GameSetup
      onStart={(mode, difficulty, difficultyX, difficultyO) =>
        setState({ screen: "game", mode, difficulty, difficultyX, difficultyO })
      }
    />
  );
};

export default App;
