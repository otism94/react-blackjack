import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios, { AxiosResponse } from "axios";
import { IGame, GameStatus, Status, TCard, TResult } from "./Types";
import { determineResultAndPayout, drawCard } from "./Functions";

export const GameContext: any = createContext<IGame>({
  gameStatus: GameStatus.NotPlaying,
  deck: "",
  player: {
    chips: 200,
    bet: 0,
    playerHandStatus: Status.Waiting,
    playerHand: [],
    playerHandValue: 0,
    splitBet: 0,
    splitHandStatus: Status.Waiting,
    splitHand: [],
    splitHandValue: 0,
    insurance: 0,
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
  const [playerHandStatus, setPlayerHandStatus] = useState<Status>(
    Status.Waiting
  );
  const [chips, setChips] = useState<number>(200);
  const [bet, setBet] = useState<number>(0);
  const [playerHand, setPlayerHand] = useState<TCard[]>([]);
  const playerHandValue: number = useMemo(
    () => updateHandValue(playerHand),
    [playerHand]
  );
  const [splitBet, setSplitBet] = useState<number>(0);
  const [splitHandStatus, setSplitHandStatus] = useState<Status>(
    Status.Waiting
  );
  const [splitHand, setSplitHand] = useState<TCard[]>([]);
  const splitHandValue: number = useMemo(
    () => updateHandValue(splitHand),
    [splitHand]
  );
  const [insurance, setInsurance] = useState<number>(0);

  // Dealer state
  const [dealerStatus, setDealerStatus] = useState<Status>(Status.Waiting);
  const [dealerHand, setDealerHand] = useState<TCard[]>([]);
  const dealerHandValue: number = useMemo(
    () => updateHandValue(dealerHand),
    [dealerHand]
  );

  // Result
  const [result, setResult] = useState<TResult>(TResult.Undecided);
  const [splitResult, setSplitResult] = useState<TResult>(TResult.Undecided);

  // Hand API names
  const playerHandName: string = "player_hand";
  const splitHandName: string = "split_hand";
  const dealerHandName: string = "dealer_hand";

  //#endregion

  //#region Callbacks

  // Draws a card and adds it to the dealer's hand.
  const dealerHit = useCallback(async () => {
    await drawCard(deck, dealerHandName, setDealerHand);
  }, [deck]);

  // Checks whether the dealer can draw a blackjack based on their first card.
  const dealerCanPushBlackjack = useCallback(() => {
    if (
      dealerHand.length === 1 &&
      (dealerHandValue === 10 || dealerHandValue === 11)
    )
      return true;
    else return false;
  }, [dealerHand, dealerHandValue]);

  // Gets the result of a game and pays out.
  const handleGameOver = useCallback(() => {
    return determineResultAndPayout(
      playerHand,
      playerHandValue,
      splitHand,
      splitHandValue,
      dealerHand,
      dealerHandValue,
      bet,
      setBet,
      splitBet,
      setSplitBet,
      setChips,
      setGameStatus,
      insurance
    );
  }, [
    bet,
    splitBet,
    dealerHand,
    dealerHandValue,
    playerHand,
    playerHandValue,
    splitHand,
    splitHandValue,
    insurance,
  ]);

  //#endregion

  //#region Effects

  // Determine player status when hand changes.
  useEffect(() => {
    if (splitHand.length === 0) {
      if (
        playerHandStatus !== Status.Playing &&
        playerHandStatus !== Status.DoubledDown
      )
        return;
      if (playerHandStatus === Status.DoubledDown && playerHandValue <= 21) {
        setPlayerHandStatus(Status.Stood);
        setDealerStatus(Status.Playing);
      } else if (
        playerHandStatus === Status.DoubledDown &&
        playerHandValue > 21
      ) {
        setPlayerHandStatus(Status.Bust);
        setDealerStatus(Status.Stood);
        setGameStatus(GameStatus.Resolving);
      } else if (playerHandValue > 21) {
        setPlayerHandStatus(Status.Bust);
        setDealerStatus(Status.Stood);
      }
    } else if (splitHand.length >= 2) {
      if (
        (playerHandStatus !== Status.Playing &&
          playerHandStatus !== Status.DoubledDown) ||
        splitHand.length < 2
      )
        return;
      if (playerHand[0].value === "ACE") {
        setPlayerHandStatus(Status.Stood);
      } else if (
        playerHandStatus === Status.DoubledDown &&
        playerHandValue <= 21
      ) {
        setPlayerHandStatus(Status.Stood);
      } else if (
        playerHandStatus === Status.DoubledDown &&
        playerHandValue > 21
      ) {
        setPlayerHandStatus(Status.Bust);
      } else if (
        playerHandValue === 21 &&
        playerHand.length < 6 &&
        playerHandStatus !== Status.DoubledDown
      ) {
        setPlayerHandStatus(Status.Stood);
      } else if (playerHandValue > 21) {
        setPlayerHandStatus(Status.Bust);
      }
    }
  }, [
    playerHandStatus,
    playerHand,
    playerHandValue,
    splitHand,
    dealerCanPushBlackjack,
  ]);

  // Equivalent of above useEffect for the split hand.
  useEffect(() => {
    if (
      (splitHandStatus !== Status.Playing &&
        splitHandStatus !== Status.DoubledDown) ||
      splitHand.length < 2
    )
      return;
    if (splitHand[0].value === "ACE") {
      setSplitHandStatus(Status.Stood);
    } else if (splitHandStatus === Status.DoubledDown && splitHandValue <= 21) {
      setSplitHandStatus(Status.Stood);
    } else if (splitHandStatus === Status.DoubledDown && splitHandValue > 21) {
      setSplitHandStatus(Status.Bust);
    } else if (
      splitHandValue === 21 &&
      splitHand.length < 6 &&
      splitHandStatus !== Status.DoubledDown
    ) {
      setSplitHandStatus(Status.Stood);
    } else if (splitHandValue > 21) {
      setSplitHandStatus(Status.Bust);
    }
  }, [splitHandStatus, splitHand, splitHandValue]);

  // Handle different combinations of finished hand states when the player has split.
  useEffect(() => {
    if (splitHandStatus === Status.Waiting) return;
    if (playerHandStatus === Status.Bust && splitHandStatus === Status.Bust) {
      setDealerStatus(Status.Stood);
      setGameStatus(GameStatus.Resolving);
    } else if (
      playerHandStatus !== Status.Playing &&
      splitHandStatus !== Status.Playing &&
      dealerStatus === Status.Waiting
    )
      setDealerStatus(Status.Playing);
  }, [playerHandStatus, splitHandStatus, dealerStatus]);

  // Determine dealer status when hand changes.
  useEffect(() => {
    if (dealerStatus !== Status.Playing) return;
    if (
      playerHandStatus === Status.Blackjack &&
      dealerHand.length === 2 &&
      dealerHandValue < 21
    ) {
      setDealerStatus(Status.Stood);
      if (insurance) setPlayerHandStatus(Status.Stood);
    } else if (dealerHand.length === 2 && dealerHandValue === 21) {
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
    const timeout = setTimeout(async () => await dealerHit(), 500);
    return () => clearTimeout(timeout);
  }, [
    dealerStatus,
    dealerHand,
    dealerHandValue,
    dealerHit,
    playerHandStatus,
    insurance,
  ]);

  // Determine game status based on player, split, and dealer statuses.
  useEffect(() => {
    if (splitHandStatus === Status.Waiting) {
      if (
        gameStatus === GameStatus.NotPlaying ||
        gameStatus === GameStatus.Resolving ||
        gameStatus === GameStatus.Finished ||
        gameStatus === GameStatus.Setup
      )
        return;
      if (
        playerHandStatus === Status.Bust ||
        playerHandStatus === Status.Charlie ||
        dealerStatus === Status.Blackjack ||
        dealerStatus === Status.Stood ||
        dealerStatus === Status.Bust
      ) {
        setGameStatus(GameStatus.Resolving);
      } else if (playerHandStatus === Status.Playing)
        setGameStatus(GameStatus.PlayerTurn);
      else if (playerHandStatus === Status.Stood)
        setGameStatus(GameStatus.DealerTurn);
      else if (dealerStatus === Status.Playing)
        setGameStatus(GameStatus.DealerTurn);
    } else {
      if (
        gameStatus === GameStatus.NotPlaying ||
        gameStatus === GameStatus.Resolving ||
        gameStatus === GameStatus.Finished ||
        gameStatus === GameStatus.Setup
      )
        return;
      if (
        ((playerHandStatus === Status.Bust ||
          playerHandStatus === Status.Charlie) &&
          (splitHandStatus === Status.Bust ||
            splitHandStatus === Status.Charlie)) ||
        dealerStatus === Status.Blackjack ||
        dealerStatus === Status.Stood ||
        dealerStatus === Status.Bust
      ) {
        setGameStatus(GameStatus.Resolving);
      } else if (
        playerHandStatus === Status.Playing ||
        splitHandStatus === Status.Playing
      )
        setGameStatus(GameStatus.PlayerTurn);
      else if (
        (playerHandStatus === Status.Stood ||
          playerHandStatus === Status.Bust ||
          playerHandStatus === Status.Charlie ||
          playerHandStatus === Status.DoubledDown) &&
        (splitHandStatus === Status.Stood ||
          splitHandStatus === Status.Bust ||
          splitHandStatus === Status.Charlie ||
          splitHandStatus === Status.DoubledDown)
      )
        setGameStatus(GameStatus.DealerTurn);
      else if (dealerStatus === Status.Playing)
        setGameStatus(GameStatus.DealerTurn);
    }
  }, [gameStatus, playerHandStatus, splitHandStatus, dealerStatus]);

  // Determine and set the result if the gameStatus is set to resolving.
  useEffect(() => {
    if (gameStatus === GameStatus.Resolving) {
      const results = handleGameOver();
      setResult(results[0]);
      setSplitResult(results[1]);
    }
  }, [gameStatus, handleGameOver]);

  //#endregion

  //#region Actions

  /**
   * Creates a new deck, or returns cards to the existing one and shuffles it, then deals the starting cards to the player and dealer. Also updates the player, dealer, and game statuses.
   */
  const start = async () => {
    // Set game and player statuses.
    setGameStatus(GameStatus.Setup);
    if (insurance > 0) setInsurance(0);
    setPlayerHandStatus(Status.Waiting);
    setSplitHandStatus(Status.Waiting);
    setDealerStatus(Status.Waiting);
    if (splitHand.length > 0) setSplitHand([]);
    setResult(TResult.Undecided);
    setSplitResult(TResult.Undecided);
    setChips((prev) => prev - 10);
    setBet(10);

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

      setGameStatus(GameStatus.PlayerTurn);
      setPlayerHandStatus(Status.Playing);
    } catch (ex) {
      console.log(ex);
    }
  };

  /**
   * Draws one card from the deck and adds it to the specified hand.
   * @param hand The API string representation of the hand (pile). Accepted values are: `"player_hand"` or `"split_hand"`.
   */
  const hit = async (hand: string) => {
    if (hand === playerHandName) await drawCard(deck, hand, setPlayerHand);
    else if (hand === splitHandName) await drawCard(deck, hand, setSplitHand);
    else return;
  };

  /**
   * Updates the player, dealer, and game statuses when the player stands.
   */
  const stand = (handName: string) => {
    if (handName === playerHandName) setPlayerHandStatus(Status.Stood);
    else if (handName === splitHandName) setSplitHandStatus(Status.Stood);
    else return;
    if (
      (handName === splitHandName && playerHandStatus !== Status.Playing) ||
      (handName === playerHandName && splitHandStatus !== Status.Playing)
    ) {
      setGameStatus(GameStatus.DealerTurn);
      setDealerStatus(Status.Playing);
    } else return;
  };

  /**
   * Doubles the player's bet and draws one card before forcing stand (or bust).
   */
  const doubleDown = async (handName: string) => {
    if (handName === playerHandName) {
      setChips((prev) => (prev -= bet));
      setBet((prev) => (prev *= 2));
      await hit(playerHandName).then(() => {
        setPlayerHandStatus(Status.DoubledDown);
      });
    } else if (handName === splitHandName) {
      setChips((prev) => (prev -= splitBet));
      setSplitBet((prev) => (prev *= 2));
      await hit(splitHandName).then(() => {
        setSplitHandStatus(Status.DoubledDown);
      });
    } else return;
  };

  /**
   * The player can buy insurance (50% of their bet) when the dealer has an ace.
   * It pays out 2:1 if the dealer gets a blackjack.
   */
  const buyInsurance = async () => {
    const insuranceChips: number = bet / 2;
    setChips((prev) => (prev -= insuranceChips));
    setInsurance(insuranceChips);
    if (splitHand.length >= 2) stand(splitHandName);
    stand(playerHandName);
  };

  /**
   * The player can split their hand if they start with two indentical-value cards.
   * Both hands then hit immediately. If they get 21, it's not a blackjack.
   * There is no resplitting.
   */
  const split = async () => {
    setSplitBet(10);
    setChips((prev: number) => (prev -= 10));

    try {
      const cardToMove: string = playerHand[1].code;

      // Remove the second card from the player's hand.
      await axios
        .get(
          `https://deckofcardsapi.com/api/deck/${deck}/pile/${playerHandName}/draw/?cards=${cardToMove}`
        )
        .then((res) => {
          if (!res.data.success)
            throw new Error("Failed drawing card from pile.");
        });

      // Draw two new cards from the deck.
      const newCardsRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deck}/draw/?count=2`
      );

      if (!newCardsRes.data.success) throw new Error("Error drawing cards.");

      const playerHandCard: string = newCardsRes.data.cards[0].code;
      const splitHandCards: string = `${cardToMove},${newCardsRes.data.cards[1].code}`;

      // Add one of the new cards to the player hand.
      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deck}/pile/${playerHandName}/add/?cards=${playerHandCard}`
        )
        .then((res) => {
          if (!res.data.success)
            throw new Error("Error adding card to player hand.");
        });

      // Add the card that was removed from the player's hand plus the other new card to the split hand.
      await axios
        .get(
          `http://deckofcardsapi.com/api/deck/${deck}/pile/${splitHandName}/add/?cards=${splitHandCards}`
        )
        .then((res) => {
          if (!res.data.success)
            throw new Error("Error adding cards to split hand.");
        });

      // Get the player's hand from the API and update its state.
      const playerHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deck}/pile/${playerHandName}/list/`
      );

      if (!playerHandRes.data.success)
        throw new Error("Failed to fetch player hand.");

      setPlayerHand(playerHandRes.data.piles.player_hand.cards);

      // Get the split hand from the API and update its state.
      const splitHandRes: AxiosResponse = await axios.get(
        `http://deckofcardsapi.com/api/deck/${deck}/pile/${splitHandName}/list/`
      );

      if (!splitHandRes.data.success)
        throw new Error("Failed to fetch player hand.");

      setSplitHand(splitHandRes.data.piles.split_hand.cards);
      setSplitHandStatus(Status.Playing);
    } catch (ex) {
      console.log(ex);
    }
  };

  //#endregion

  //#region Render
  return (
    <GameContext.Provider
      value={{
        gameStatus,
        deck,
        player: {
          chips,
          bet,
          playerHandStatus,
          playerHand,
          playerHandValue,
          splitBet,
          splitHandStatus,
          splitHand,
          splitHandValue,
          insurance,
        },
        dealer: {
          dealerStatus,
          dealerHand,
          dealerHandValue,
        },
        result,
        splitResult,
        playerHandName,
        splitHandName,
        dealerHandName,
        actions: {
          start,
          hit,
          stand,
          doubleDown,
          buyInsurance,
          split,
        },
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
  //#endregion
};

//#region Computed State Functions

/**
 * Updates a hand value based on the cards currently in it.
 * @param hand The hand (array of cards) whose cards to value.
 * @returns The value of the hand.
 */
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

//#endregion
