import { Player } from './player';
export class Board {
  player: Player;
  tiles: object[];
  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
