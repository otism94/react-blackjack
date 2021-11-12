import axios, { AxiosResponse } from "axios";
import type { TCard } from "./Types";

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
 * @returns String containing the value or "Blackjack".
 */
export const displayValueOrBlackjack = (
  handValue: number,
  hand: TCard[]
): string => {
  if (hand.length === 2 && handValue === 21) return "Blackjack";
  else return `${handValue}`;
};

/**
 * Determines the outcome of the game based on the player and dealer hands.
 * @param playerHand The player's hand.
 * @param playerHandValue The player's hand value.
 * @param dealerHand The dealer's hand.
 * @param dealerHandValue The dealer's hand value.
 * @returns A string containing the result.
 */
export const determineResult = (
  playerHand: TCard[],
  playerHandValue: number,
  dealerHand: TCard[],
  dealerHandValue: number
): string => {
  if (playerHand.length === 2 && playerHandValue === 21) return "Blackjack";
  else if (dealerHand.length === 2 && dealerHandValue === 21) return "Lose";
  else if (playerHand.length === 6 && playerHandValue <= 21) return "Charlie";
  else if (playerHandValue > 21) return "Lose";
  else if (playerHandValue > dealerHandValue) return "Win";
  else if (playerHandValue === dealerHandValue) return "Draw";
  else if (dealerHandValue > 21) return "Win";
  else return "Lose";
};
