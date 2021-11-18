import { useContext, useEffect } from "react";
import Button from "./Button";
import Card from "./Card";
import CardSlot from "./CardSlot";
import { displayValueOrBlackjack } from "../Context/Functions";
import type { TCard } from "../Context/Types";
import { GameStatus, Status } from "../Context/Types";
import { GameContext } from "../Context/GameContext";

const PlayerHand = () => {
  const { gameStatus, player, playerHandName, actions } =
    useContext(GameContext);

  // // Add a crown on the sixth player card slot.
  // useEffect(() => {
  //   const crown = document.createElement("i");
  //   crown.classList.add("fas", "fa-crown");

  //   Array.from(document.querySelectorAll(".card-slot-fill"))
  //     .slice(-1)[0]
  //     .appendChild(crown);
  // }, []);

  // /**
  //  * Creates the passed-in value number of empty card slots.
  //  * @param cards The number of slots to make.
  //  * @returns An array of CardSlots.
  //  */
  // const cardSlots = (cards: number): any => {
  //   let slots = [];
  //   for (let i = 0; i < cards; i++) {
  //     slots.push(<CardSlot key={i} />);
  //   }
  //   return slots;
  // };

  return (
    <>
      <div id="player-hand">
        <div className="flex-row">
          <p className="hand-value">
            <i className="fas fa-star"></i>{" "}
            <span className={player.playerHandValue <= 21 ? "" : "bust"}>
              {displayValueOrBlackjack(
                player.playerHandValue,
                player.playerHand,
                player.splitHand.length === 0,
                true
              )}
            </span>
          </p>
          <div className="result">
            <p>Win</p>
          </div>
        </div>
        <div className="flex-row">
          <div className="button-group-vertical">
            <Button
              title="Hit"
              disabled={
                player.playerHandStatus !== Status.Playing ||
                gameStatus !== GameStatus.PlayerTurn ||
                player.playerHandValue >= 21 ||
                player.playerHand.length === 6 ||
                (player.splitHandStatus === Status.Playing &&
                  player.splitHand.length < player.playerHand.length)
              }
              className="button button-hud"
              onClick={async () => await actions.hit(playerHandName)}
            />
            <Button
              title="Double Down"
              disabled={
                player.playerHandStatus !== Status.Playing ||
                gameStatus !== GameStatus.PlayerTurn ||
                player.playerHandValue >= 21 ||
                player.playerHand.length === 6
              }
              className="button button-hud"
              onClick={async () => await actions.doubleDown(playerHandName)}
            />
            <Button
              title="Split"
              disabled={
                player.playerHandStatus !== Status.Playing ||
                player.playerHand.length !== 2 ||
                player.splitHand.length > 0 ||
                (player.playerHand.length === 2 &&
                  player.playerHand[0]?.value !== player.playerHand[1]?.value)
              }
              className="button button-hud"
              onClick={() => actions.split()}
            />
            <Button
              title="Stand"
              disabled={
                player.playerHandStatus !== Status.Playing ||
                gameStatus !== GameStatus.PlayerTurn
              }
              className="button button-hud"
              onClick={() => actions.stand(playerHandName)}
            />
          </div>
          <div className="p-hand">
            <div className="p-card-0"></div>
            <div className="p-card-1"></div>
            <div className="p-card-2"></div>
            <div className="p-card-3"></div>
            <div className="p-card-4"></div>
            <div className="p-card-5 dd-5"></div>
          </div>
        </div>
        <div className="bet">
          <i className="fas fa-coins"></i> {player.bet}
          {/* <div>
            <i className="fas fa-piggy-bank"></i> {player.chips}
          </div> */}
        </div>
        {/* <div className="cards">
          {player.playerHand.length
            ? player.playerHand.map((card: TCard) => (
                <Card key={card.code} src={card.image} alt={card.code} />
              ))
            : null}
        </div>
        <div className="card-slots">{cardSlots(6)}</div> */}
      </div>
    </>
  );
};

export default PlayerHand;
