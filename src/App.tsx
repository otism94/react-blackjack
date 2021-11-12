import { useContext } from "react";
import { GameContext } from "./Context/GameContext";
import Header from "./Components/Header";
import Button from "./Components/Button";
import PlayerHand from "./Components/PlayerHand";
import DealerHand from "./Components/DealerHand";
import Result from "./Components/Result";
import { GameStatus } from "./API/types";

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
        onClick={async () => await actions.hit(playerHandName)}
      />
      <Button
        title="Stand"
        disabled={gameStatus !== GameStatus.PlayerTurn}
        onClick={() => actions.stand()}
      />
      {gameStatus === GameStatus.Setup || gameStatus === GameStatus.Finished ? (
        <Button
          title="Play"
          disabled={false}
          onClick={async () => await actions.start()}
        />
      ) : null}
      <PlayerHand />
    </>
  );
};

export default App;
