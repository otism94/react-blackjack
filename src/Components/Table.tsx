import { useEffect, useState } from "react";
import useStateWithCallback from "use-state-with-callback";
import { startGame, updateHandValue } from "../API/functions";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import PlayerHUD from "./PlayerHUD";
import PlayerSplitHand from "./PlayerSplitHand";
import Result from "./Result";

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

const Table = () => {
  //#region States

  // Deck and chips.
  const [deckId, setDeckId] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [playerChips, setPlayerChips] = useState<number>(100);

  // Dealer hand.
  const [dealerHand, setDealerHand] = useStateWithCallback<Card[]>([], () => {
    if (dealerHand.length > prevDealerHand.length) {
      setPrevDealerHand(dealerHand);
      updateHandValue(dealerHand, setDealerHandValue);
    }
  });
  const [prevDealerHand, setPrevDealerHand] = useState<Card[]>([]);
  const [dealerHandValue, setDealerHandValue] = useState<number>(0);

  // Player hand.
  const [playerHand, setPlayerHand] = useStateWithCallback<Card[]>([], () => {
    if (playerHand.length > prevPlayerHand.length) {
      setPrevPlayerHand(playerHand);
      updateHandValue(playerHand, setPlayerHandValue);
    }
  });
  const [prevPlayerHand, setPrevPlayerHand] = useState<Card[]>([]);
  const [playerHandValue, setPlayerHandValue] = useState<number>(0);

  // Player split hand.
  const [playerSplitHand, setPlayerSplitHand] = useStateWithCallback<Card[]>(
    [],
    () => {
      if (playerSplitHand.length > prevPlayerHand.length) {
        setPrevPlayerSplitHand(playerSplitHand);
        updateHandValue(playerSplitHand, setPlayerSplitHandValue);
      }
    }
  );
  const [prevPlayerSplitHand, setPrevPlayerSplitHand] = useState<Card[]>([]);
  const [playerSplitHandValue, setPlayerSplitHandValue] = useState<number>(0);

  useEffect(() => {
    (async () => {
      await startGame(
        setDeckId,
        setDealerHand,
        setPlayerHand,
        setPlayerSplitHand
      );
    })();
  }, []);

  //#endregion

  return (
    <>
      <DealerHand dealerHand={dealerHand} dealerHandValue={dealerHandValue} />
      <Result result={result} />
      {playerSplitHand.length ? <PlayerSplitHand /> : null}
      <PlayerHUD
        deck_id={deckId}
        chips={playerChips}
        playerHand={playerHand}
        setPlayerHand={setPlayerHand}
        playerHandValue={playerHandValue}
        dealerHand={dealerHand}
        setDealerHand={setDealerHand}
        dealerHandValue={dealerHandValue}
        setDealerHandValue={setDealerHandValue}
        result={result}
        setResult={setResult}
      />
      <PlayerHand playerHand={playerHand} playerHandValue={playerHandValue} />
    </>
  );
};

export default Table;
