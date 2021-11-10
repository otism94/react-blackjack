import { useState } from "react";
import "./App.css";
import Button from "./Components/Button";
import Game from "./Components/Game";

function App() {
  const [gameStart, setGameStart] = useState(false);

  return (
    <>
      <h1>&hearts;&spades;Blackjack &clubs;&diams;</h1>
      {!gameStart ? (
        <Button title="Play" onClick={() => setGameStart(true)} />
      ) : (
        <Game />
      )}
    </>
  );
}

export default App;
