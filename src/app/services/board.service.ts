import { Player } from './../models/player';
import { Board } from './../models/board';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  playerId = 1;
  boards: Board[] = [];
  constructor() {}
  createBoard(size: number = 5) {
    let tiles = [];
    for (let i = 0; i < size; i++) {
      tiles[i] = [];
      for (let j = 0; j < size; j++) {
        tiles[i][j] = { used: false, value: 0, status: '' };
      }
    }
    for (let i = 0; i < size * 2; i++) {
      tiles = this.randomShips(tiles, size);
    }
    const board = new Board({
      player: new Player({id: this.playerId++}),
      tiles
    });
    this.boards.push(board);
    return this;
  }
  randomShips(tiles: object[], len: number): object[] {
    len = len - 1;
    const ranRow = this.getRandomInt(0, len);
    const ranCol = this.getRandomInt(0, len);
    if (tiles[ranRow][ranCol].value === 1) {
      return this.randomShips(tiles, len);
    } else {
      tiles[ranRow][ranCol].value = 1;
      return tiles;
    }
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  getBoards(): Board[] {
    return this.boards;
  }
}
