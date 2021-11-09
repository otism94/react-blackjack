import Button from "./Button";
import { displayValueOrBust, drawCards } from "../API/functions";

//#region Types

export type Card = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

//#endregion

const PlayerHand = ({
  deck_id,
  playerHand,
  setPlayerHand,
  playerHandValue,
}: {
  deck_id: string;
  playerHand: Card[];
  setPlayerHand: React.Dispatch<React.SetStateAction<Card[]>>;
  playerHandValue: number;
}) => (
  <>
    <p>{displayValueOrBust(playerHandValue, playerHand)}</p>
    <Button
      title="Draw Card"
      onClick={() => drawCards(deck_id, 1, "player_hand", setPlayerHand)}
    />
    <br />
    {playerHand.length
      ? playerHand.map((card) => (
          <img key={card.code} src={card.image} alt={card.code} />
        ))
      : null}
  </>
);

export default PlayerHand;
