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
  const { dealer, gameStatus, player, result, actions } =
    useContext(GameContext);

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
        {gameStatus === GameStatus.PlayerTurn &&
        dealer.dealerHand.length === 1 &&
        dealer.dealerHandValue === 11 ? (
          <Button
            title="Insurance"
            disabled={player.playerHand.length > 2 || player.insurance}
            className="button"
            onClick={() => actions.buyInsurance()}
          />
        ) : null}
      </div>
      <PlayerHand />
    </>
  );
};

export default App;
