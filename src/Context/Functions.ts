import axios, { AxiosResponse } from "axios";
import { GameStatus, TResult, TCard } from "./Types";

/**
 * Draws one card from the deck and adds it to the specified hand.
 * @param deck Deck ID
 * @param hand The API string representation of the hand (pile). Accepted values are: `"player_hand"`, `"split_hand"`, or `"dealer_hand"`.
 * @param setHand The hand state setter function.
 */
export const drawCard = async (deck: string, hand: string, setHand: any) => {
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
    } else if (deck === "")
      throw new Error("Empty deck ID passed to function.");

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

    setHand(newHandRes.data.piles[hand].cards);
  } catch (ex) {
    console.log(ex);
  }
};

/**
 * Gets a string representation of the passed-in hand's value.
 * @param handValue The value state to turn into a string.
 * @param hand The hand state. Used to determine a blackjack.
 * @param charlie Optional bool whether 6-card charlie can be ruled. Dealers do not benefit from this. Default: false.
 * @returns String containing the value,"Blackjack", or "Charlie".
 */
export const displayValueOrBlackjack = (
  handValue: number,
  hand: TCard[],
  blackjack: boolean = true,
  charlie: boolean = false
): string => {
  if (blackjack && hand.length === 2 && handValue === 21) return "Blackjack";
  else if (charlie && hand.length === 6 && handValue <= 21) return "Charlie";
  else return `${handValue}`;
};

/**
 * Determines the outcome of the game based on the player and dealer hands.
 * @param playerHand The player's hand.
 * @param playerHandValue The player's hand value.
 * @param dealerHand The dealer's hand.
 * @param dealerHandValue The dealer's hand value.
 * @param setBet The bet state setter.
 * @param setChips The chips state setter.
 * @returns A string containing the result.
 */
const determineResult = (
  playerHand: TCard[],
  playerHandValue: number,
  dealerHand: TCard[],
  dealerHandValue: number,
  canBlackjack: boolean = true
): TResult => {
  if (
    canBlackjack &&
    playerHand.length === 2 &&
    playerHandValue === 21 &&
    ((dealerHand.length === 2 && dealerHandValue !== 21) ||
      (dealerHand.length !== 2 && dealerHandValue !== 21))
  )
    return TResult.Blackjack;
  else if (
    canBlackjack &&
    playerHand.length === 2 &&
    playerHandValue === 21 &&
    dealerHand.length === 2 &&
    dealerHandValue === 21
  )
    return TResult.Push;
  else if (dealerHand.length === 2 && dealerHandValue === 21)
    return TResult.Lose;
  else if (
    playerHand.length === 6 &&
    playerHandValue <= 21 &&
    dealerHand.length === 2 &&
    dealerHandValue === 21
  )
    return TResult.Lose;
  else if (
    playerHand.length === 6 &&
    playerHandValue <= 21 &&
    dealerHandValue === 21
  )
    return TResult.Push;
  else if (playerHand.length === 6 && playerHandValue <= 21)
    return TResult.Charlie;
  else if (playerHandValue > 21) return TResult.Bust;
  else if (playerHandValue > dealerHandValue) return TResult.Win;
  else if (playerHandValue === dealerHandValue) return TResult.Push;
  else if (dealerHandValue > 21) return TResult.Win;
  else return TResult.Lose;
};

const determinePayout = (
  result: TResult,
  bet: number,
  setBet: any,
  setChips: any,
  insurance: number = 0
) => {
  if (result === TResult.Blackjack)
    setChips((prev: number) => prev + bet * 1.5);
  else if (result === TResult.Win || result === TResult.Charlie)
    setChips((prev: number) => prev + bet * 2);
  else if (result === TResult.Push)
    setChips((prev: number) => prev + bet + insurance);
  else setChips((prev: number) => prev + insurance);

  setBet(0);
};

export const determineResultAndPayout = (
  playerHand: TCard[],
  playerHandValue: number,
  splitHand: TCard[],
  splitHandValue: number,
  dealerHand: TCard[],
  dealerHandValue: number,
  bet: number,
  setBet: any,
  splitBet: number,
  setSplitBet: any,
  setChips: any,
  setGameStatus: any,
  insurance: number
): TResult[] => {
  const insurancePayout: number =
    insurance > 0 &&
    dealerHand[0].value === "ACE" &&
    dealerHand.length === 2 &&
    dealerHandValue === 21
      ? insurance * 2
      : 0;

  let result: TResult = determineResult(
    playerHand,
    playerHandValue,
    dealerHand,
    dealerHandValue,
    splitHand.length === 0
  );

  if (insurancePayout > 0 && result === TResult.Lose)
    result = TResult.InsuredLoss;
  else if (insurancePayout > 0 && result === TResult.Push)
    result = TResult.InsuredPush;

  const splitResult: TResult = splitHand.length
    ? determineResult(
        splitHand,
        splitHandValue,
        dealerHand,
        dealerHandValue,
        false
      )
    : TResult.Undecided;

  determinePayout(result, bet, setBet, setChips, insurancePayout);
  if (splitResult !== TResult.Undecided)
    determinePayout(splitResult, splitBet, setSplitBet, setChips);
  setGameStatus(GameStatus.Finished);
  return [result, splitResult];
};
