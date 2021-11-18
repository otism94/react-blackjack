import { useContext, useEffect } from "react";
import Button from "./Button";
import Card from "./Card";
import CardSlot from "./CardSlot";
import { displayValueOrBlackjack } from "../Context/Functions";
import type { TCard } from "../Context/Types";
import { GameStatus, Status } from "../Context/Types";
import { GameContext } from "../Context/GameContext";

const SplitHand = () => {
  const { gameStatus, player, splitHandName, actions } =
    useContext(GameContext);

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
      <div className="player-hud">
        <p className="hand-value">
          Split:{" "}
          <span className={player.splitHandValue <= 21 ? "" : "bust"}>
            {displayValueOrBlackjack(
              player.splitHandValue,
              player.splitHand,
              false,
              true
            )}
          </span>
        </p>
        <div className="chips">
          <div>
            <i className="fas fa-coins"></i> {player.splitBet}
          </div>
        </div>
        <div className="button-group">
          <Button
            title="Hit"
            disabled={
              player.splitHandStatus !== Status.Playing ||
              gameStatus !== GameStatus.PlayerTurn ||
              player.splitHandValue >= 21 ||
              player.splitHand.length === 6 ||
              (player.splitHandStatus === Status.Playing &&
                player.splitHand.length > player.playerHand.length)
            }
            className="button button-hud"
            onClick={async () => await actions.hit(splitHandName)}
          />
          <Button
            title="Double Down"
            disabled={
              player.splitHandStatus !== Status.Playing ||
              gameStatus !== GameStatus.PlayerTurn ||
              player.splitHandValue >= 21 ||
              player.splitHand.length === 6
            }
            className="button button-hud"
            onClick={async () => await actions.doubleDown(splitHandName)}
          />
          <Button
            title="Split"
            disabled={true}
            className="button button-hud"
            onClick={() => actions.split()}
          />
          <Button
            title="Stand"
            disabled={
              player.splitHandStatus !== Status.Playing ||
              gameStatus !== GameStatus.PlayerTurn
            }
            className="button button-hud"
            onClick={() => actions.stand(splitHandName)}
          />
        </div>
      </div>

      <div className="hand">
        <div className="cards">
          {player.splitHand.length
            ? player.splitHand.map((card: TCard) => (
                <Card key={card.code} src={card.image} alt={card.code} />
              ))
            : null}
        </div>
        <div className="card-slots">{cardSlots(6)}</div>
      </div>
    </>
  );
};

export default SplitHand;
