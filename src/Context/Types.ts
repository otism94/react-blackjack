//#region Context Interfaces

export interface IGame {
  gameStatus: GameStatus;
  deck: string;
  player: IPlayer;
  dealer: IDealer;
}

export interface IPlayer {
  playerStatus: Status;
  chips: number;
  playerHand: TCard[];
  playerHandValue: number;
  splitHand: TCard[];
  splitHandValue: number;
}

export interface IDealer {
  dealerStatus: Status;
  dealerHand: TCard[];
  dealerHandValue: number;
}

//#endregion

//#region Types

export type TCard = {
  code: string;
  image: string;
  images: object;
  suit: string;
  value: string;
};

export enum Status {
  Waiting,
  Playing,
  Blackjack,
  Charlie,
  Stood,
  Bust,
}

export enum GameStatus {
  NotPlaying,
  Setup,
  PlayerTurn,
  DealerTurn,
  Finished,
}

//#endregion
