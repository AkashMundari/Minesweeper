import { html, render } from "lit-html";

class Minesweeper {
  BOARD_SIZE = 7;
  NUMBER_OF_MINES = 10;
  TILE_STATUSES = {
    HIDDEN: "hidden",
    MARKED: "marked",
    NUMBER: "number",
    MINE: "mine",
  };

  constructor() {
    this.initializeMinesweeper();
  }

  initializeMinesweeper() {
    this.mines = this.getMinesPositions();
    this.board = this.initializeBoard();
    this.updateMinesLeft();
    this.#render();
  }

  initializeBoard() {
    const board = [];
    for (let y = 0; y < this.BOARD_SIZE; y++) {
      const column = [];
      for (let x = 0; x < this.BOARD_SIZE; x++) {
        const tile = {
          x,
          y,
          mine: this.mines.some(this.checkMatch.bind(null, { x, y })),
          status: this.TILE_STATUSES.HIDDEN,
        };
        column.push(tile);
      }
      board.push(column);
    }
    return board;
  }

  getMinesPositions() {
    const positions = [];
    while (positions.length < this.NUMBER_OF_MINES) {
      const mineTile = {
        x: this.getRandomNumber(this.BOARD_SIZE),
        y: this.getRandomNumber(this.BOARD_SIZE),
      };
      if (!positions.some(this.checkMatch.bind(null, mineTile))) {
        positions.push(mineTile);
      }
    }
    return positions;
  }

  getRandomNumber(size) {
    return Math.floor(Math.random() * size);
  }

  checkMatch(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  markTile(tile) {
    if (
      tile.status === this.TILE_STATUSES.HIDDEN ||
      tile.status === this.TILE_STATUSES.MARKED
    ) {
      tile.status =
        tile.status === this.TILE_STATUSES.HIDDEN
          ? this.TILE_STATUSES.MARKED
          : this.TILE_STATUSES.HIDDEN;
      this.updateMinesLeft();
      this.#render();
    }
  }

  revealTile(tile) {
    if (tile.status === this.TILE_STATUSES.HIDDEN) {
      if (tile.mine) {
        tile.status = this.TILE_STATUSES.MINE;
        this.checkGameStatus();
        this.#render();
        return;
      }

      tile.status = this.TILE_STATUSES.NUMBER;

      const adjacentTiles = this.getNearByTiles(tile);
      const nearByMineTiles = adjacentTiles.filter((tile) => tile.mine);

      if (nearByMineTiles.length === 0) {
        adjacentTiles.forEach((m) => this.revealTile(m));
      } else {
        tile.mineCount = nearByMineTiles.length;
      }

      this.#render();
      this.checkGameStatus();
    }
  }

  getNearByTiles({ x, y }) {
    const nearByTile = [];

    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        const tile = this.board[yOffset + y]?.[xOffset + x];
        if (tile) nearByTile.push(tile);
      }
    }
    return nearByTile;
  }

  updateMinesLeft() {
    const markedTilesCount = this.board
      .flat()
      .filter((tile) => tile.status === this.TILE_STATUSES.MARKED).length;
    this.subtitle = `Mines left: ${this.NUMBER_OF_MINES - markedTilesCount}`;
  }

  checkGameStatus() {
    const win = this.board.flat().every((tile) => {
      return (
        tile.status === this.TILE_STATUSES.NUMBER ||
        (tile.mine &&
          (tile.status === this.TILE_STATUSES.MARKED ||
            tile.status === this.TILE_STATUSES.HIDDEN))
      );
    });

    const lose = this.board
      .flat()
      .some((tile) => tile.status === this.TILE_STATUSES.MINE);

    if (win) {
      this.subtitle = "You Win!";
      this.#disableBoard();
    } else if (lose) {
      this.subtitle = "You Lose!";
      this.board.flat().forEach((tile) => {
        if (tile.mine) this.revealTile(tile);
      });
      this.#disableBoard();
    }
    this.#render();
  }

  #disableBoard() {
    this.board.flat().forEach((tile) => {
      tile.disabled = true;
    });
  }

  #handleClick = (tile) => {
    if (!tile.disabled) this.revealTile(tile);
  };

  #handleRightClick = (e, tile) => {
    e.preventDefault();
    if (!tile.disabled) this.markTile(tile);
  };

  #render() {
    const boardTemplate = html`
      <header>
        <h1 class="title">Minesweeper</h1>
        <p class="subtitle">${this.subtitle}</p>
      </header>
      <div class="board" style="--size: ${this.BOARD_SIZE}">
        ${this.board.map((row) =>
          row.map(
            (tile) => html`
              <div
                class="tile ${tile.status}"
                @click=${() => this.#handleClick(tile)}
                @contextmenu=${(e) => this.#handleRightClick(e, tile)}
              >
                ${tile.status === this.TILE_STATUSES.NUMBER
                  ? tile.mineCount || ""
                  : ""}
              </div>
            `
          )
        )}
      </div>
    `;

    render(boardTemplate, document.getElementById("root"));
  }
}
export default Minesweeper;
const minesweeper = new Minesweeper();
