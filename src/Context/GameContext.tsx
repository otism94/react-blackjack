import { createContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Game, GameStatus, Status, TCard } from "../API/types";

export const GameContext: any = createContext<Game>({
  gameStatus: GameStatus.NotPlaying,
  deck: "",
  player: {
    playerStatus: Status.Waiting,
    chips: 100,
    playerHand: [],
    playerHandValue: 0,
    splitHand: [],
    splitHandValue: 0,
  },
  dealer: {
    dealerStatus: Status.Waiting,
    dealerHand: [],
    dealerHandValue: 0,
  },
});

export const Provider = (props: any) => {
  //#region States

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>(
    GameStatus.NotPlaying
  );
  const [deck, setDeck] = useState<string>("");

  // Player state
  const [playerStatus, setPlayerStatus] = useState<Status>(Status.Waiting);
  const [chips, setChips] = useState<number>(100);
  const [playerHand, setPlayerHand] = useState<TCard[]>([]);
  const [playerHandValue, setPlayerHandValue] = useState<number>(0);
  const [splitHand, setSplitHand] = useState<TCard[]>([]);
  const [splitHandValue, setSplitHandValue] = useState<number>(0);

  // Dealer state
  const [dealerStatus, setDealerStatus] = useState<Status>(Status.Waiting);
  const [dealerHand, setDealerHand] = useState<TCard[]>([]);
  const [dealerHandValue, setDealerHandValue] = useState<number>(0);

  //#endregion

  //#region Actions

  const testAction = (): number => chips;

  const startGame = async () => {
    try {
      const deckRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${
          deck !== "" ? deck : "new"
        }/draw/?count=3`
      );

      if (!deckRes.data.success) throw "Error creating deck";

      const deckId = deckRes.data.deck_id;
      setDeck(deckId);

      const dealerCard: string = deckRes.data.cards[0].code;
      const playerCards: string = deckRes.data.cards
        .slice(-2)
        .map((card: { code: string }) => card.code)
        .join(",");

      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deckId}/pile/player_hand/add/?cards=${playerCards}`
        )
        .then((res) => {
          if (!res.data.success) throw "Error adding cards to player hand.";
        });

      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deckId}/pile/dealer_hand/add/?cards=${dealerCard}`
        )
        .then((res) => {
          if (!res.data.success) throw "Error adding cards to dealer hand.";
        });

      const playerHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deckId}/pile/player_hand/list/`
      );

      if (!playerHandRes.data.success) throw "Failed to fetch player hand.";

      setPlayerHand(playerHandRes.data.piles.player_hand.cards);

      const dealerHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deckId}/pile/dealer_hand/list/`
      );

      if (!dealerHandRes.data.success) throw "Failed to fetch player hand.";

      setDealerHand(dealerHandRes.data.piles.dealer_hand.cards);

      setPlayerStatus(Status.Playing);
    } catch (ex) {
      console.log(ex);
    }
  };

  const updateHandValue = () => {
    [
      {
        hand: playerHand,
        setHandValue: setPlayerHandValue,
      },
      {
        hand: splitHand,
        setHandValue: setSplitHandValue,
      },
      {
        hand: dealerHand,
        setHandValue: setDealerHandValue,
      },
    ].forEach((h) => {
      let value: number = 0;
      const acesInHand: TCard[] = [];

      // Parse the value from the API object value.
      h.hand.forEach((card) => {
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

      h.setHandValue(() => value);
    });
  };

  //#endregion

  //#region Effects

  // Update hand values when hands change.
  useEffect(() => {
    updateHandValue();
  }, [playerHand, splitHand, dealerHand]);

  useEffect(() => {}, [playerHandValue, splitHandValue, dealerHandValue]);

  //#endregion

  //#region Render
  return (
    <GameContext.Provider
      value={{
        gameStatus,
        deck,
        player: {
          playerStatus,
          chips,
          playerHand,
          playerHandValue,
          splitHand,
          splitHandValue,
        },
        dealer: {
          dealerStatus,
          dealerHand,
          dealerHandValue,
        },
        actions: {
          test: testAction,
          start: startGame,
          update: updateHandValue,
        },
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
  //#endregion
};
