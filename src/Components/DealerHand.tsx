import Card from "./Card";
import type { TCard } from "../Context/Types";
import { displayValueOrBlackjack } from "../Context/Functions";
import { useContext } from "react";
import { GameContext } from "../Context/GameContext";

const DealerHand = () => {
  const { dealer } = useContext(GameContext);
  return (
    <>
      <p className="hand-value">
        Dealer:{" "}
        <span className={dealer.dealerHandValue <= 21 ? "" : "bust"}>
          {displayValueOrBlackjack(dealer.dealerHandValue, dealer.dealerHand)}
        </span>
      </p>
      <div className="hand">
        {dealer.dealerHand.length
          ? dealer.dealerHand.map((card: TCard) => (
              <Card key={card.code} src={card.image} alt={card.code} />
            ))
          : null}
      </div>
    </>
  );
};

export default DealerHand;
