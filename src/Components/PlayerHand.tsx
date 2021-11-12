import { useContext, useEffect } from "react";
import Card from "./Card";
import CardSlot from "./CardSlot";
import { displayValueOrBlackjack } from "../API/functions";
import type { TCard } from "../API/types";
import { GameContext } from "../Context/GameContext";

const PlayerHand = () => {
  const { player } = useContext(GameContext);

  const cardSlots = (cards: number): any => {
    let slots = [];
    for (let i = 0; i < cards; i++) {
      slots.push(<CardSlot key={i} />);
    }
    return slots;
  };

  useEffect(() => {
    Array.from(document.querySelectorAll(".card-slot-fill")).slice(
      -1
    )[0].innerHTML = '<i class="fas fa-crown"></i>';
  }, []);

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
