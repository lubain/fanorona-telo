import { useState } from "react";
import FanoronaGame from "./page/FanoronaGame";
import GameSetup from "./page/GameSetup";
import type { Difficulty, GameMode } from "@/domain/types";

type AppState =
  | { screen: "setup" }
  | { screen: "game"; mode: GameMode; difficulty: Difficulty };

const App = () => {
  const [state, setState] = useState<AppState>({ screen: "setup" });

  if (state.screen === "game") {
    return (
      <FanoronaGame
        mode={state.mode}
        difficulty={state.difficulty}
        onBack={() => setState({ screen: "setup" })}
      />
    );
  }

  return (
    <GameSetup
      onStart={(mode, difficulty) =>
        setState({ screen: "game", mode, difficulty })
      }
    />
  );
};

export default App;
