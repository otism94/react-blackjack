import { useContext, useEffect } from "react";
import Card from "./Card";
import CardSlot from "./CardSlot";
import { displayValueOrBlackjack } from "../Context/Functions";
import type { TCard } from "../Context/Types";
import { GameContext } from "../Context/GameContext";

const PlayerHand = () => {
  const { player } = useContext(GameContext);

  // Add a crown on the sixth player card slot.
  useEffect(() => {
    const crown = document.createElement("i");
    crown.classList.add("fas", "fa-crown");

    Array.from(document.querySelectorAll(".card-slot-fill"))
      .slice(-1)[0]
      .appendChild(crown);
  }, []);

  /**
   * Creates the passed-in value number of empty card slots.
   * @param cards The number of slots to make.
   * @returns An array of CardSlots.
   */
  const cardSlots = (cards: number): any => {
    let slots = [];
    for (let i = 0; i < cards; i++) {
      slots.push(<CardSlot key={i} />);
    }
    return slots;
  };

  return (
    <>
      <p className="hand-value">
        Player:{" "}
        <span className={player.playerHandValue <= 21 ? "" : "bust"}>
          {displayValueOrBlackjack(player.playerHandValue, player.playerHand)}
        </span>
      </p>
      <div className="hand">
        <div className="cards">
          {player.playerHand.length
            ? player.playerHand.map((card: TCard) => (
                <Card key={card.code} src={card.image} alt={card.code} />
              ))
            : null}
        </div>
        <div className="card-slots">{cardSlots(6)}</div>
      </div>
    </>
  );
};

export default PlayerHand;
