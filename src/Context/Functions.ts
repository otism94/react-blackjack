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
  charlie: boolean = false
): string => {
  if (hand.length === 2 && handValue === 21) return "Blackjack";
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
  dealerHandValue: number
): TResult => {
  if (
    playerHand.length === 2 &&
    playerHandValue === 21 &&
    ((dealerHand.length === 2 && dealerHandValue !== 21) ||
      (dealerHand.length !== 2 && dealerHandValue !== 21))
  )
    return TResult.Blackjack;
  else if (
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
  insurancePayout: number
) => {
  if (result === TResult.Blackjack) {
    setChips((prev: number) => prev + bet * 1.5);
    setBet(0);
  } else if (result === TResult.Win || result === TResult.Charlie) {
    setChips((prev: number) => prev + bet * 2);
    setBet(0);
  } else if (result === TResult.Push) {
    setChips((prev: number) => prev + insurancePayout + bet);
    setBet(0);
  } else {
    if (insurancePayout > 0) setChips((prev: number) => prev + insurancePayout);
    setBet(0);
  }
};

const determineInsurancePayout = (
  dealerHand: TCard[],
  dealerHandValue: number,
  result: TResult
): number => {
  if (result === TResult.Bust) return 0;
  else if (dealerHand.length === 2 && dealerHandValue === 21) return 10;
  else if (dealerHandValue > 21) return 5;
  else return 0;
};

export const determineResultAndPayout = (
  playerHand: TCard[],
  playerHandValue: number,
  dealerHand: TCard[],
  dealerHandValue: number,
  bet: number,
  setBet: any,
  setChips: any,
  setGameStatus: any,
  insurance: boolean
): TResult => {
  const result = determineResult(
    playerHand,
    playerHandValue,
    dealerHand,
    dealerHandValue
  );
  const insurancePayout: number = insurance
    ? determineInsurancePayout(dealerHand, dealerHandValue, result)
    : 0;
  determinePayout(result, bet, setBet, setChips, insurancePayout);
  setGameStatus(GameStatus.Finished);
  return result;
};
