import { useState } from "react";
import "./App.css";
import Button from "./Components/Button";
import Game from "./Components/Game";
import Header from "./Components/Header";

function App() {
  const [gameStart, setGameStart] = useState(false);

  return (
    <>
      <Header />
      {!gameStart ? (
        <Button
          title="Play"
          disabled={false}
          onClick={() => setGameStart(true)}
        />
      ) : (
        <Game />
      )}
    </>
  );
}

export default App;
