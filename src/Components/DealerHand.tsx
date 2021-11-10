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

const DealerHand = ({
  deck_id,
  dealerHand,
  setDealerHand,
  dealerHandValue,
}: {
  deck_id: string;
  dealerHand: Card[];
  setDealerHand: React.Dispatch<React.SetStateAction<Card[]>>;
  dealerHandValue: number;
}) => (
  <>
    <p>{displayValueOrBust(dealerHandValue, dealerHand)}</p>
    <Button
      title="Draw Card"
      onClick={() => drawCards(deck_id, 1, "dealer_hand", setDealerHand)}
    />
    <br />
    {dealerHand.length
      ? dealerHand.map((card) => (
          <img key={card.code} src={card.image} alt={card.code} />
        ))
      : null}
  </>
);

export default DealerHand;
