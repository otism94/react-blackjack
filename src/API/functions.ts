import axios from "axios";

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

/**
 * Draws cards from the deck, adds them to a hand, and updates that hand's state with the new cards.
 * @param deck_id The ID of the deck to draw from.
 * @param count The number of cards to draw. Default: 1
 * @param pile_name The hand (pile) to add the drawn cards to.
 * @param setHandState The useState setter of the hand to be updated.
 */
export const drawCards = async (
  deck_id: string,
  count: number = 1,
  pile_name: string,
  setHandState: any
) => {
  try {
    // Draw two cards from the deck.
    const fetchCardsRes = await axios.get(
      `http://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`
    );

    // Throw exception if success returns false.
    if (!fetchCardsRes.data.success) throw "Error drawing cards.";

    // Join the cards' code value into a string.
    const cardsString: string = fetchCardsRes.data.cards
      .map((card: { code: string }) => card.code)
      .join(",");

    // Add the two drawn cards to the hand.
    await axios
      .get(
        `http://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/add/?cards=${cardsString}`
      )
      .then((res) => {
        if (!res.data.success) throw "Error adding cards to hand.";
      });

    // Fetch the newly-updated hand and update the hand state.
    await axios
      .get(
        `http://deckofcardsapi.com/api/deck/${deck_id}/pile/${pile_name}/list/`
      )
      .then((res) => {
        if (!res.data.success) throw "Failed to fetch hand.";
        else setHandState(res.data.piles[pile_name].cards);
      });
  } catch (ex) {
    console.log(ex);
  }
};

/**
 * Gets a string representation of the passed-in hand's value.
 * @param handValue The value state to turn into a string.
 * @param hand The hand state. Used to determine a blackjack.
 * @returns String containing the value, including whether it's bust or a blackjack.
 */
export const displayValueOrBust = (handValue: number, hand: Card[]): string => {
  if (handValue > 21) return `Bust (${handValue})`;
  else if (hand.length === 2 && handValue === 21) return "Blackjack!";
  else return `Value: ${handValue}`;
};

export const startNewGame = async (
  deck_id: string,
  setDealerHand: any,
  setPlayerHand: any
) => {
  await axios.get(`http://deckofcardsapi.com/api/deck/${deck_id}/return`);
  await drawCards(deck_id, 1, "dealer_hand", setDealerHand);
  await drawCards(deck_id, 2, "player_hand", setPlayerHand);
};
