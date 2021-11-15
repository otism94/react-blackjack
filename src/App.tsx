//#region Imports

import { useContext } from "react";

import { GameContext } from "./Context/GameContext";
import { GameStatus } from "./Context/Types";

import Header from "./Components/Header";
import Button from "./Components/Button";
import PlayerHand from "./Components/PlayerHand";
import DealerHand from "./Components/DealerHand";
import Result from "./Components/Result";

//#endregion

const App = () => {
  const { gameStatus, result, actions } = useContext(GameContext);

  return (
    <>
      <Header />
      <DealerHand />
      <Result result={result} />
      <div className="button-group">
        {gameStatus === GameStatus.NotPlaying ||
        gameStatus === GameStatus.Finished ? (
          <Button
            title={gameStatus === GameStatus.NotPlaying ? "Play" : "Play Again"}
            disabled={false}
            className="button"
            onClick={async () => await actions.start()}
          />
        ) : null}
      </div>
      <PlayerHand />
    </>
  );
};

export default App;
