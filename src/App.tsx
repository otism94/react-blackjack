import { useContext } from "react";
import { GameContext } from "./Context/GameContext";
import Header from "./Components/Header";
import Button from "./Components/Button";
import { TCard } from "./API/types";

const App = () => {
  const { deck, player, dealer, actions } = useContext(GameContext);

  return (
    <>
      <Header />
      <Button
        title="Play"
        disabled={false}
        onClick={async () => await actions.start()}
      />
      <ul>
        <li>Deck: {deck}</li>
        <li>Player: {player.playerHandValue}</li>
        <li>Dealer: {dealer.dealerHandValue}</li>
      </ul>
    </>
  );
};

export default App;
