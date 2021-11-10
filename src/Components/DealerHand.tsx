import { displayValueOrBlackjack } from "../API/functions";
import Card from "./Card";

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
  dealerHand,
  dealerHandValue,
}: {
  dealerHand: Card[];
  dealerHandValue: number;
}) => (
  <>
    <p className="hand-value">
      Dealer:{" "}
      <span className={dealerHandValue <= 21 ? "" : "bust"}>
        {displayValueOrBlackjack(dealerHandValue, dealerHand)}
      </span>
    </p>
    <div className="hand">
      {dealerHand.length
        ? dealerHand.map((card) => (
            <Card key={card.code} src={card.image} alt={card.code} />
          ))
        : null}
    </div>
  </>
);

export default DealerHand;
