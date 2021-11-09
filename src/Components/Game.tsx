import axios from "axios";
import { useEffect, useState } from "react";
import useStateWithCallback from "use-state-with-callback";
import { startNewGame } from "../API/functions";
import useDeck from "../API/useDeck";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import PlayerHUD from "./PlayerHUD";
import PlayerSplitHand from "./PlayerSplitHand";

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

const Game = () => {
  //#region States

  // Game state, chips, and deck.
  const { deck, deckLoading }: any = useDeck();
  const [settingUp, setSettingUp] = useState<any>(null);
  const [playerChips, setPlayerChips] = useState<number>(100);

  // Dealer hand.
  const [dealerHand, setDealerHand] = useStateWithCallback<Card[]>([], () => {
    if (dealerHand.length > prevDealerHand.length) {
      setPrevPlayerHand(dealerHand);
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

  //#endregion

  /**
   * Updates a hand value based on the cards currently in it.
   * @param hand The hand (array of cards) whose cards to value.
   * @param setHandValue The hand's value state setter.
   */
  const updateHandValue = (hand: Card[], setHandValue: any): void => {
    let value: number = 0;
    const acesInHand: Card[] = [];

    // Parse the value from the API object value.
    hand.forEach((card) => {
      // Faces are worth 10.
      if (card.value.match(/(KING)|(QUEEN)|(JACK)/)) value += 10;
      // Aces require more work; save them to an array for later.
      else if (card.value === "ACE") acesInHand.push(card);
      // Otherwise, parse the string value as an int and add to value.
      else value += parseInt(card.value);
    });

    // Handle aces. Determines the maximum value possible without going bust.
    if (acesInHand.length === 1) {
      // One ace: value of 11 or 1.
      value += value + 11 <= 21 ? 11 : 1;
    } else if (acesInHand.length === 2) {
      // Two aces: value of 12 or 2.
      if (value + 12 <= 21) value += 12;
      else value += 2;
    } else if (acesInHand.length === 3) {
      // Three aces: value of 13 or 3.
      if (value + 13 <= 21) value += 13;
      else value += 3;
    } else if (acesInHand.length === 4) {
      // Four aces: value of 14 or 4.
      if (value + 14 <= 21) value += 14;
      else value += 4;
    }

    setHandValue(value);
  };

  if (deckLoading) return <p>Loading...</p>;

  if (playerHand.length === 0 && settingUp === null) {
    setSettingUp(true);
    startNewGame(deck.deck_id, setDealerHand, setPlayerHand);
    setSettingUp(false);
  }

  return (
    <>
      <DealerHand />
      {playerSplitHand.length ? <PlayerSplitHand /> : null}
      <PlayerHUD chips={playerChips} />
      <PlayerHand
        deck_id={deck.deck_id}
        playerHand={playerHand}
        setPlayerHand={setPlayerHand}
        playerHandValue={playerHandValue}
      />
    </>
  );
};

export default Game;
