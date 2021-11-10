import axios from "axios";
import React from "react";

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

/**
 * Creates a new deck, deals two cards to the player, one to the dealer, and resets the player's split hand.
 * @param setDeckId Deck ID state setter.
 * @param setDealerHand Dealer hand state setter.
 * @param setPlayerHand Player hand state setter.
 * @param setPlayerSplitHand Player split hand state setter.
 */
export const startGame = async (
  setDeckId: React.Dispatch<React.SetStateAction<string>>,
  setDealerHand: React.Dispatch<React.SetStateAction<Card[]>>,
  setPlayerHand: React.Dispatch<React.SetStateAction<Card[]>>,
  setPlayerSplitHand: React.Dispatch<React.SetStateAction<Card[]>>
) => {
  try {
    setPlayerSplitHand([]);

    const newDeckRes = await axios.get(
      "http://deckofcardsapi.com/api/deck/new/draw/?count=3"
    );

    if (!newDeckRes.data.success) throw "Error creating deck.";

    const newDeckId: string = newDeckRes.data.deck_id;
    setDeckId(newDeckId);

    const dealerCard: string = newDeckRes.data.cards[0].code;
    const playerCards: string = newDeckRes.data.cards
      .slice(-2)
      .map((card: { code: string }) => card.code)
      .join(",");

    await axios
      .get(
        `http://deckofcardsapi.com/api/deck/${newDeckId}/pile/player_hand/add/?cards=${playerCards}`
      )
      .then((res) => {
        if (!res.data.success) throw "Error adding cards to player hand.";
      });

    await axios
      .get(
        `http://deckofcardsapi.com/api/deck/${newDeckId}/pile/dealer_hand/add/?cards=${dealerCard}`
      )
      .then((res) => {
        if (!res.data.success) throw "Error adding cards to dealer hand.";
      });

    const playerHandRes = await axios.get(
      `http://deckofcardsapi.com/api/deck/${newDeckId}/pile/player_hand/list/`
    );

    if (!playerHandRes.data.success) throw "Failed to fetch player hand.";

    setPlayerHand(playerHandRes.data.piles.player_hand.cards);

    const dealerHandRes = await axios.get(
      `http://deckofcardsapi.com/api/deck/${newDeckId}/pile/dealer_hand/list/`
    );

    if (!dealerHandRes.data.success) throw "Failed to fetch player hand.";

    setDealerHand(dealerHandRes.data.piles.dealer_hand.cards);
  } catch (ex) {
    console.log(ex);
  }
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
  setHandState: React.Dispatch<React.SetStateAction<Card[]>>
) => {
  try {
    // Draw (count) cards from the deck.
    const fetchCardsRes = await axios.get(
      `http://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`
    );

    // Throw exception if success returns false.
    if (!fetchCardsRes.data.success) throw "Error drawing cards.";

    // Join the cards' code value into a string.
    const cardsString: string = fetchCardsRes.data.cards
      .map((card: { code: string }) => card.code)
      .join(",");

    // Add the drawn card(s) to the hand.
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

/**
 * Updates a hand value based on the cards currently in it.
 * @param hand The hand (array of cards) whose cards to value.
 * @param setHandValue The hand's value state setter.
 */
export const updateHandValue = (
  hand: Card[],
  setHandValue: React.Dispatch<React.SetStateAction<number>>
): void => {
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
