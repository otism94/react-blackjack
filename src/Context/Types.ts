//#region Context Interfaces

export interface IGame {
  gameStatus: GameStatus;
  deck: string;
  player: IPlayer;
  dealer: IDealer;
}

export interface IPlayer {
  chips: number;
  bet: number;
  playerHandStatus: Status;
  playerHand: TCard[];
  playerHandValue: number;
  splitBet: number;
  splitHandStatus: Status;
  splitHand: TCard[];
  splitHandValue: number;
  insurance: number;
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
  Waiting = "Waiting",
  Playing = "Playing",
  Blackjack = "Blackjack",
  Charlie = "Charlie",
  DoubledDown = "Doubled Down",
  Stood = "Stood",
  Bust = "Bust",
}

export enum GameStatus {
  NotPlaying = "Not Playing",
  Setup = "Setup",
  PlayerTurn = "Player Turn",
  DealerTurn = "Dealer Turn",
  Resolving = "Resolving",
  Finished = "Finished",
}

export enum TResult {
  Undecided = "",
  Win = "Win",
  Blackjack = "Blackjack",
  Charlie = "Charlie",
  Push = "Push",
  Bust = "Bust",
  Lose = "Lose",
  InsuredLoss = "Insurance",
  InsuredPush = "Insured Push",
}

//#endregion
