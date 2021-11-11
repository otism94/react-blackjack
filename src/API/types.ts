//#region Context Interfaces
export interface Game {
  gameStatus: GameStatus;
  deck: string;
  player: Player;
  dealer: Dealer;
}

export interface Player {
  playerStatus: Status;
  chips: number;
  playerHand: TCard[];
  playerHandValue: number;
  splitHand: TCard[];
  splitHandValue: number;
}

export interface Dealer {
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
  PlayerTurn,
  DealerTurn,
  Resetting,
}
//#endregion
