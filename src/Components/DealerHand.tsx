import { displayValueOrBlackjack } from "../API/functions";
import Card from "./Card";
import type { TCard } from "../API/types";

const DealerHand = ({
  dealerHand,
  dealerHandValue,
}: {
  dealerHand: TCard[];
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
