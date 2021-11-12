import { createContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { IGame, GameStatus, Status, TCard } from "../API/types";

export const GameContext: any = createContext<IGame>({
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
  const playerHandValue: number = updateHandValue(playerHand);
  const [splitHand, setSplitHand] = useState<TCard[]>([]);
  const splitHandValue: number = updateHandValue(splitHand);

  // Dealer state
  const [dealerStatus, setDealerStatus] = useState<Status>(Status.Waiting);
  const [dealerHand, setDealerHand] = useState<TCard[]>([]);
  const dealerHandValue: number = updateHandValue(dealerHand);

  // Hand API names
  const playerHandName: string = "player_hand";
  const splitHandName: string = "split_hand";
  const dealerHandName: string = "dealer_hand";

  // Result
  const result: string =
    gameStatus === GameStatus.Finished
      ? determineResult(
          playerHand,
          playerHandValue,
          dealerHand,
          dealerHandValue
        )
      : "";

  //#endregion

  //#region Effects

  // Determine player status when hand changes.
  useEffect(() => {
    if (playerStatus !== Status.Playing) return;
    if (playerHand.length === 2 && playerHandValue === 21)
      setPlayerStatus(Status.Blackjack);
    else if (playerHandValue > 21) setPlayerStatus(Status.Bust);
    else if (playerHandValue <= 21 && playerHand.length === 6)
      setPlayerStatus(Status.Charlie);
  }, [playerStatus, playerHand, playerHandValue]);

  // Determine dealer status when hand changes.
  useEffect(() => {
    if (dealerStatus !== Status.Playing) return;
    if (dealerHand.length === 2 && dealerHandValue === 21) {
      setDealerStatus(Status.Blackjack);
      return;
    } else if (dealerHandValue >= 17 && dealerHandValue <= 21) {
      setDealerStatus(Status.Stood);
      return;
    } else if (dealerHandValue > 21) {
      setDealerStatus(Status.Bust);
      return;
    } else if (dealerHandValue > 21) {
      setDealerStatus(Status.Bust);
      return;
    }

    const interval = setInterval(async () => await hit("dealer_hand"), 700);
    return () => clearInterval(interval);
  }, [dealerStatus, dealerHand, dealerHandValue]);

  // Determine game status based on player and dealer statuses.
  useEffect(() => {
    if (
      gameStatus === GameStatus.NotPlaying ||
      gameStatus === GameStatus.Finished ||
      gameStatus === GameStatus.Setup
    )
      return;
    if (
      playerStatus === Status.Blackjack ||
      playerStatus === Status.Bust ||
      playerStatus === Status.Charlie ||
      dealerStatus === Status.Blackjack ||
      dealerStatus === Status.Stood ||
      dealerStatus === Status.Bust
    )
      setGameStatus(GameStatus.Finished);
    else if (playerStatus === Status.Playing)
      setGameStatus(GameStatus.PlayerTurn);
    else if (dealerStatus === Status.Playing)
      setGameStatus(GameStatus.DealerTurn);
  }, [gameStatus, playerStatus, dealerStatus]);

  //#endregion

  //#region Actions

  const start = async () => {
    // Set game and player statuses.
    setGameStatus(GameStatus.Setup);
    setPlayerStatus(Status.Waiting);
    setDealerStatus(Status.Waiting);

    try {
      // If a deck ID exists, return cards to it and shuffle them
      if (deck !== "") {
        await axios
          .get(`http://deckofcardsapi.com/api/deck/${deck}/return/`)
          .then((res) => {
            if (!res.data.success)
              throw new Error("Error returning cards to deck.");
          });

        await axios
          .get(`http://deckofcardsapi.com/api/deck/${deck}/shuffle/`)
          .then((res) => {
            if (!res.data.success) throw new Error("Error shuffling deck.");
          });
      }

      // Fetch 3 cards from a new deck or the existing one.
      const deckRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${
          deck !== "" ? deck : "new"
        }/draw/?count=3`
      );

      if (!deckRes.data.success) throw new Error("Error creating deck");

      // If it's a new deck, set the deck state.
      const deckId = deckRes.data.deck_id;
      if (deck !== deckId) setDeck(deckId);

      // Join the cards' code values into a string.
      const dealerCard: string = deckRes.data.cards[0].code;
      const playerCards: string = deckRes.data.cards
        .slice(-2)
        .map((card: { code: string }) => card.code)
        .join(",");

      // Add two cards to the player's hand.
      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deckId}/pile/player_hand/add/?cards=${playerCards}`
        )
        .then((res) => {
          if (!res.data.success)
            throw new Error("Error adding cards to player hand.");
        });

      // Add one card to the dealer's hand.
      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deckId}/pile/dealer_hand/add/?cards=${dealerCard}`
        )
        .then((res) => {
          if (!res.data.success)
            throw new Error("Error adding cards to dealer hand.");
        });

      // Get the player's hand from the API and update its state.
      const playerHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deckId}/pile/player_hand/list/`
      );

      if (!playerHandRes.data.success)
        throw new Error("Failed to fetch player hand.");

      setPlayerHand(playerHandRes.data.piles.player_hand.cards);

      // Get the dealer's hand from the API and update its state.
      const dealerHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deckId}/pile/dealer_hand/list/`
      );

      if (!dealerHandRes.data.success)
        throw new Error("Failed to fetch player hand.");

      setDealerHand(dealerHandRes.data.piles.dealer_hand.cards);

      // Set the game and player statuses.
      setGameStatus(GameStatus.PlayerTurn);
      setPlayerStatus(Status.Playing);
    } catch (ex) {
      console.log(ex);
    }
  };

  const hit = async (hand: string) => {
    try {
      hand = hand.toLowerCase();
      if (
        hand !== "player_hand" &&
        hand !== "split_hand" &&
        hand !== "dealer_hand"
      ) {
        throw new Error(
          'Invalid hand string passed to function. Valid arguments: "player_hand", "split_hand", or "dealer_hand".'
        );
      }

      // Draw a card from the deck.
      const fetchCardsRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`
      );

      // Throw exception if success returns false.
      if (!fetchCardsRes.data.success) throw new Error("Error drawing cards.");

      // Join the cards' code value into a string.
      const cardString: string = fetchCardsRes.data.cards[0].code;

      // Add the drawn card(s) to the hand.
      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deck}/pile/${hand}/add/?cards=${cardString}`
        )
        .then((res) => {
          if (!res.data.success) throw new Error("Error adding cards to hand.");
        });

      // Fetch the newly-updated hand and update the hand state.
      const newHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deck}/pile/${hand}/list/`
      );

      if (!newHandRes.data.success) throw new Error("Failed to fetch hand.");

      if (hand === "player_hand")
        setPlayerHand(newHandRes.data.piles[hand].cards);
      else if (hand === "split_hand")
        setSplitHand(newHandRes.data.piles[hand].cards);
      else if (hand === "dealer_hand")
        setDealerHand(newHandRes.data.piles[hand].cards);
      else throw new Error("I don't know how you got to this point.");
    } catch (ex) {
      console.log(ex);
    }
  };

  const stand = () => {
    setPlayerStatus(Status.Stood);
    setDealerStatus(Status.Playing);
    setGameStatus(GameStatus.DealerTurn);
  };

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
        playerHandName,
        splitHandName,
        dealerHandName,
        result,
        actions: {
          start,
          hit,
          stand,
        },
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
  //#endregion
};

//#region Computed State Functions

const updateHandValue = (hand: TCard[]): number => {
  let value: number = 0;
  const acesInHand: TCard[] = [];

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

  return value;
};

const determineResult = (
  playerHand: TCard[],
  playerHandValue: number,
  dealerHand: TCard[],
  dealerHandValue: number
) => {
  if (playerHand.length === 2 && playerHandValue === 21) return "Blackjack";
  else if (dealerHand.length === 2 && dealerHandValue === 21) return "Lose";
  else if (playerHand.length === 6 && playerHandValue <= 21) return "Charlie";
  else if (playerHandValue > 21) return "Lose";
  else if (playerHandValue > dealerHandValue) return "Win";
  else if (playerHandValue === dealerHandValue) return "Draw";
  else if (dealerHandValue > 21) return "Win";
  else return "Lose";
};

//#endregion
