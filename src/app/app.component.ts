import { BoardService } from './services/board.service';
import { Component, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Board } from './models/board';
declare const Pusher: any;
const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  pusherChannel: any;
  canPlay = true;
  player = 0;
  players = 0;
  gameId: string;
  gameUrl: string =
    location.protocol +
    '//' +
    location.hostname +
    (location.port ? ':' + location.port : '');
  constructor(private _toastr: ToastrService, private _board: BoardService) {
    this.startNewGame();
    this.initPusher();
    this.listenForChanges();
  }
  startNewGame() {
    this.createBoards();
  }
  initPusher(): AppComponent {
    // findOrCreate unique channel ID
    let id = this.getQueryParam('id');
    if (!id) {
      id = this.getUniqueId();
      location.search = location.search ? '&id=' + id : 'id=' + id;
    }
    this.gameId = id;

    // init pusher
    const pusher = new Pusher('c9e5faec99bd08b3cff2', {
      authEndpoint: '/pusher/auth',
      cluster: 'ap2',
    });

    // bind to relevant Pusher presence channel
    this.pusherChannel = pusher.subscribe(id);
    this.pusherChannel.bind('pusher:member_added', (member) => this.players++);
    this.pusherChannel.bind('pusher:subscription_succeeded', (members) => {
      this.players = members.count;
      this.setPlayer(this.players);
      this._toastr.success('Success', 'Connected!');
    });
    this.pusherChannel.bind('pusher:member_removed', (member) => this.players--);
    return this;
  }
  listenForChanges(): AppComponent {
    this.pusherChannel.bind('client-fire', (obj) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });
    return this;
  }

  // initialise player and set turn
  setPlayer(players: number = 0): AppComponent {
    this.player = players - 1;
    if (players == 1) {
      this.canPlay = true;
    } else if (players == 2) {
      this.canPlay = false;
    }
    return this;
  }

  fireTorpedo(e: any): AppComponent {
    const id = e.target.id;
    const boardId = id.substring(1, 2);
    const row = id.substring(2, 3);
    const col = id.substring(3, 4);
    const tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }
    if (tile.value == 1) {
      this._toastr.success('You got this.', 'HURRAAA! YOU SANK A SHIP!');
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this._toastr.info('Keep trying.', 'OOPS! YOU MISSED THIS TIME');
      this.boards[boardId].tiles[row][col].status = 'fail';
    }
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = 'X';
    this.pusherChannel.trigger('client-fire', {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId,
      board: this.boards[boardId],
    });
    return this;
  }

  checkValidHit(boardId: number, tile: any): boolean {
    if (boardId == this.player) {
      this._toastr.error(
        'Don\'t commit suicide.',
        'You can\'t hit your own board.'
      );
      return false;
    }
    if (this.winner) {
      this._toastr.error('Game is over');
      return false;
    }
    if (!this.canPlay) {
      this._toastr.error('A bit too eager.', 'It\'s not your turn to play.');
      return false;
    }
    if (tile.value === 'X') {
      this._toastr.error(
        'Don\'t waste your torpedos.',
        'You already shot here.'
      );
      return false;
    }
    return true;
  }
  createBoards(): AppComponent {
    for (let i = 0; i < NUM_PLAYERS; i++) {
      this._board.createBoard(BOARD_SIZE);
    }
    return this;
  }
  getQueryParam(name) {
    const match = RegExp('[?&]' + name + '=([^&]*)').exec(
      window.location.search
    );
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  getUniqueId() {
    return 'presence-' + Math.random().toString(36).substr(2, 8);
  }
  get validPlayer(): boolean {
    return this.players >= NUM_PLAYERS && this.player < NUM_PLAYERS;
  }
  get winner(): Board {
    return this.boards.find((board) => board.player.score >= BOARD_SIZE);
  }

  get boards(): Board[] {
    return this._board.getBoards();
  }
}
