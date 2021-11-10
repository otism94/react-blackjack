import Card from "./Card";
import CardSlot from "./CardSlot";
import { displayValueOrBlackjack } from "../API/functions";

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
  playerHand,
  playerHandValue,
}: {
  playerHand: Card[];
  playerHandValue: number;
}) => {
  const cardSlots = (cards: number): any => {
    let slots = [];
    for (let i = 0; i < 6 - cards; i++) {
      slots.push(<CardSlot key={i} />);
    }
    return slots;
  };

  const emptySlots: Element[] = Array.from(
    document.querySelectorAll(".card-slot-fill")
  );
  if (emptySlots.length)
    emptySlots.slice(-1)[0].innerHTML = '<i class="fas fa-crown"></i>';

  return (
    <>
      <p className="hand-value">
        Player:{" "}
        <span className={playerHandValue <= 21 ? "" : "bust"}>
          {displayValueOrBlackjack(playerHandValue, playerHand)}
        </span>
      </p>
      <div className="hand">
        {playerHand.length
          ? playerHand.map((card) => (
              <Card key={card.code} src={card.image} alt={card.code} />
            ))
          : null}
        {playerHand.length < 6 ? cardSlots(playerHand.length) : null}
      </div>
    </>
  );
};

export default PlayerHand;
