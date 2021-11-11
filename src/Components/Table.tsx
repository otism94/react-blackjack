import { useEffect, useState } from "react";
import useStateWithCallback from "use-state-with-callback";
import { startGame, updateHandValue } from "../API/functions";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import PlayerHUD from "./PlayerHUD";
import PlayerSplitHand from "./PlayerSplitHand";
import Result from "./Result";
import type { TCard } from "../API/types";
import equal from "fast-deep-equal";

const Table = () => {
  //#region States

  // Deck and chips.
  const [deckId, setDeckId] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [playerChips, setPlayerChips] = useState<number>(100);

  // Dealer hand.
  const [dealerHand, setDealerHand] = useStateWithCallback<TCard[]>([], () => {
    if (!equal(dealerHand, prevDealerHand)) {
      setPrevDealerHand(dealerHand);
      updateHandValue(dealerHand, setDealerHandValue);
    }
  });
  const [prevDealerHand, setPrevDealerHand] = useState<TCard[]>([]);
  const [dealerHandValue, setDealerHandValue] = useState<number>(0);

  // Player hand.
  const [playerHand, setPlayerHand] = useStateWithCallback<TCard[]>([], () => {
    if (!equal(playerHand, prevPlayerHand)) {
      setPrevPlayerHand(playerHand);
      updateHandValue(playerHand, setPlayerHandValue);
    }
  });
  const [prevPlayerHand, setPrevPlayerHand] = useState<TCard[]>([]);
  const [playerHandValue, setPlayerHandValue] = useState<number>(0);

  // Player split hand.
  const [playerSplitHand, setPlayerSplitHand] = useStateWithCallback<TCard[]>(
    [],
    () => {
      if (!equal(playerSplitHand, prevPlayerSplitHand)) {
        setPrevPlayerSplitHand(playerSplitHand);
        updateHandValue(playerSplitHand, setPlayerSplitHandValue);
      }
    }
  );
  const [prevPlayerSplitHand, setPrevPlayerSplitHand] = useState<TCard[]>([]);
  const [playerSplitHandValue, setPlayerSplitHandValue] = useState<number>(0);

  useEffect(() => {
    (async () => {
      await startGame(setDeckId, setDealerHand, setPlayerHand);
    })();
  }, [setDeckId, setDealerHand, setPlayerHand]);

  //#endregion

  return (
    <>
      <DealerHand dealerHand={dealerHand} dealerHandValue={dealerHandValue} />
      <Result result={result} />
      {playerSplitHand.length ? <PlayerSplitHand /> : null}
      <PlayerHUD
        deck_id={deckId}
        setDeckId={setDeckId}
        chips={playerChips}
        playerHand={playerHand}
        setPlayerHand={setPlayerHand}
        playerHandValue={playerHandValue}
        setPlayerHandValue={setPlayerHandValue}
        playerSplitHand={playerSplitHand}
        setPlayerSplitHand={setPlayerSplitHand}
        playerSplitHandValue={playerSplitHandValue}
        setPlayerSplitHandValue={setPlayerSplitHandValue}
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
