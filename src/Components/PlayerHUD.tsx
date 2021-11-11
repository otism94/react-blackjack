import { useEffect, useState } from "react";
import Button from "./Button";
import { drawCards, restartGame, updateHandValue } from "../API/functions";
import useStateWithCallback from "use-state-with-callback";
import type { TCard } from "../API/types";

const PlayerHUD = ({
  deck_id,
  setDeckId,
  chips,
  playerHand,
  setPlayerHand,
  playerHandValue,
  setPlayerHandValue,
  playerSplitHand,
  setPlayerSplitHand,
  playerSplitHandValue,
  setPlayerSplitHandValue,
  dealerHand,
  setDealerHand,
  dealerHandValue,
  setDealerHandValue,
  result,
  setResult,
}: {
  deck_id: string;
  setDeckId: React.Dispatch<React.SetStateAction<string>>;
  chips: number;
  playerHand: TCard[];
  setPlayerHand: React.Dispatch<React.SetStateAction<TCard[]>>;
  playerHandValue: number;
  setPlayerHandValue: React.Dispatch<React.SetStateAction<number>>;
  playerSplitHand: TCard[];
  setPlayerSplitHand: React.Dispatch<React.SetStateAction<TCard[]>>;
  playerSplitHandValue: number;
  setPlayerSplitHandValue: React.Dispatch<React.SetStateAction<number>>;
  dealerHand: TCard[];
  setDealerHand: React.Dispatch<React.SetStateAction<TCard[]>>;
  dealerHandValue: number;
  setDealerHandValue: React.Dispatch<React.SetStateAction<number>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [intervalId, setIntervalId] = useState<any>();
  const [stood, setStood] = useStateWithCallback<boolean>(false, () => {
    if (stood && !dealerDrawing && !dealerStoodOrBust) {
      setDealerDrawing(true);
      setIntervalId(
        setInterval(
          async () => await drawCards(deck_id, 1, "dealer_hand", setDealerHand),
          1000
        )
      );
    }
  });
  const [dealerDrawing, setDealerDrawing] = useStateWithCallback<boolean>(
    false,
    () => {
      if (
        dealerDrawing &&
        !dealerStoodOrBust &&
        !gameOver &&
        dealerHandValue >= 17
      ) {
        setDealerStoodOrBust(true);
      }
    }
  );
  const [dealerStoodOrBust, setDealerStoodOrBust] =
    useStateWithCallback<boolean>(false, () => {
      if (dealerStoodOrBust && stood && dealerDrawing) {
        setDealerDrawing(false);
        setGameOver(true);
      }
    });
  const [showRestart, setShowRestart] = useState<boolean>(false);
  const [gameOver, setGameOver] = useStateWithCallback<boolean>(false, () => {
    if (gameOver) {
      clearInterval(intervalId);
      determineResult();
      setShowRestart(true);
    }
  });

  // useEffect for player blackjack/charlie/bust.
  useEffect(() => {
    if (
      !gameOver &&
      ((playerHand.length === 2 && playerHandValue === 21) ||
        playerHandValue > 21 ||
        (playerHandValue <= 21 && playerHand.length === 6))
    )
      setGameOver(true);
  }, [playerHand, playerHandValue, gameOver, setGameOver]);

  // Functions
  const handleStand = async () => {
    if (!stood) {
      setStood(true);
      setDealerDrawing(false);
      await drawCards(deck_id, 1, "dealer_hand", setDealerHand);
    }
  };

  const determineResult = () => {
    if (playerHand.length === 2 && playerHandValue === 21)
      setResult("Blackjack");
    else if (dealerHand.length === 2 && dealerHandValue === 21)
      setResult("Lose");
    else if (playerHand.length === 6 && playerHandValue <= 21)
      setResult("Charlie");
    else if (playerHandValue > 21) setResult("Lose");
    else if (playerHandValue > dealerHandValue) setResult("Win");
    else if (playerHandValue === dealerHandValue) setResult("Draw");
    else if (dealerHandValue > 21) setResult("Win");
    else setResult("Lose");
  };

  const handleRestartGame = async () => {
    await restartGame(setDeckId, setDealerHand, setPlayerHand, deck_id).then(
      () => {
        setDealerStoodOrBust(false);
        setIntervalId(undefined);
        setGameOver(false);
        setStood(false);
        setResult("");
        setShowRestart(false);
      }
    );
  };

  return (
    <div id="player-hud">
      <p>Chips: {chips}</p>
      {showRestart ? (
        <Button
          title="New Game"
          disabled={false}
          onClick={() => handleRestartGame()}
        />
      ) : null}
      <div>
        <Button
          title="Hit"
          disabled={
            gameOver || stood || playerHand.length >= 6 || playerHandValue >= 21
          }
          onClick={() => drawCards(deck_id, 1, "player_hand", setPlayerHand)}
        />
        <Button
          title="Stand"
          disabled={
            gameOver || stood || playerHand.length >= 6 || playerHandValue > 21
          }
          onClick={() => handleStand()}
        />
        <Button
          title="Double Down"
          disabled={
            gameOver || stood || playerHand.length >= 6 || playerHandValue >= 21
          }
          onClick={() => console.log("You doubled down")}
        />
        <Button
          title="Split"
          disabled={true}
          onClick={() => console.log("You stood")}
        />
      </div>
    </div>
  );
};

export default PlayerHUD;
