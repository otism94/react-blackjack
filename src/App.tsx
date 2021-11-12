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
  const { gameStatus, result, playerHandName, actions } =
    useContext(GameContext);

  return (
    <>
      <Header />
      <DealerHand />
      <Result result={result} />
      <Button
        title="Hit"
        disabled={gameStatus !== GameStatus.PlayerTurn}
        className=""
        onClick={async () => await actions.hit(playerHandName)}
      />
      <Button
        title="Stand"
        disabled={gameStatus !== GameStatus.PlayerTurn}
        className=""
        onClick={() => actions.stand()}
      />
      {gameStatus === GameStatus.NotPlaying ||
      gameStatus === GameStatus.Setup ||
      gameStatus === GameStatus.Finished ? (
        <Button
          title="Play"
          disabled={false}
          className=""
          onClick={async () => await actions.start()}
        />
      ) : null}
      <PlayerHand />
    </>
  );
};

export default App;
