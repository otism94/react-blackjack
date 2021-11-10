import { useEffect, useState } from "react";
import Button from "./Button";
import { drawCards } from "../API/functions";
import useStateWithCallback from "use-state-with-callback";

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

const PlayerHUD = ({
  deck_id,
  chips,
  playerHand,
  setPlayerHand,
  playerHandValue,
  dealerHand,
  setDealerHand,
  dealerHandValue,
  setDealerHandValue,
  result,
  setResult,
}: {
  deck_id: string;
  chips: number;
  playerHand: Card[];
  setPlayerHand: React.Dispatch<React.SetStateAction<Card[]>>;
  playerHandValue: number;
  dealerHand: Card[];
  setDealerHand: React.Dispatch<React.SetStateAction<Card[]>>;
  dealerHandValue: number;
  setDealerHandValue: React.Dispatch<React.SetStateAction<number>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [stood, setStood] = useState<boolean>(false);
  const [gameOver, setGameOver] = useStateWithCallback<boolean>(false, () => {
    if (gameOver) determineResult();
  });

  useEffect(() => {
    (async () => {
      if (!gameOver && playerHand.length === 2 && playerHandValue === 21) {
        setTimeout(() => setGameOver(true), 500);
      } else if (!gameOver && playerHandValue > 21) {
        setTimeout(() => setGameOver(true), 500);
      } else if (!gameOver && stood && dealerHandValue < 17) {
        setTimeout(
          await drawCards(deck_id, 1, "dealer_hand", setDealerHand),
          1500
        );
      } else if (!gameOver && stood && dealerHandValue >= 17) {
        setTimeout(() => setGameOver(true), 500);
      }
    })();
  }, [playerHandValue, dealerHandValue]);

  // Functions
  const handleStand = async () => {
    if (!stood) {
      setStood(true);
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

  return (
    <>
      <p>Chips: {chips}</p>
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
    </>
  );
};

export default PlayerHUD;
