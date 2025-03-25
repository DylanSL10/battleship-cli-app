const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SHIP_TYPES = {
  SMALL: { size: 2, symbol: "🟠" },
  LARGE: { size: 3, symbol: "🔵" },
};

const EMPTY = { type: "empty", hit: false, symbol: "-" };
const MISS = { type: "miss", hit: true, symbol: "❌" };

function createBoard(size) {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(null).map(() => ({ ...EMPTY })));
}

function placeShips(board, numSmall, numLarge) {
  const size = board.length;

  function canPlaceShip(x, y, length, vertical) {
    for (let i = 0; i < length; i++) {
      let nx = vertical ? x + i : x;
      let ny = vertical ? y : y + i;
      if (nx >= size || ny >= size || board[nx][ny].type !== "empty") return false;
    }
    return true;
  }

  function placeShip(type, length) {
    let placed = false;
    while (!placed) {
      let x = Math.floor(Math.random() * size);
      let y = Math.floor(Math.random() * size);
      let vertical = Math.random() < 0.5;

      if (canPlaceShip(x, y, length, vertical)) {
        for (let i = 0; i < length; i++) {
          let nx = vertical ? x + i : x;
          let ny = vertical ? y : y + i;
          board[nx][ny] = { type, hit: false, symbol: SHIP_TYPES[type.toUpperCase()].symbol };
        }
        placed = true;
      }
    }
  }

  for (let i = 0; i < numSmall; i++) placeShip("small", SHIP_TYPES.SMALL.size);
  for (let i = 0; i < numLarge; i++) placeShip("large", SHIP_TYPES.LARGE.size);
}

function printBoard(board, debug = false) {
  let displayBoard = board.map((row) =>
    row.map((cell) => {
      if (cell.hit) return cell.symbol;
      return debug && cell.type !== "empty" ? cell.symbol : "-";
    })
  );

  let formattedBoard = { " ": Array.from({ length: board.length }, (_, i) => i + 1) };
  displayBoard.forEach((row, i) => {
    formattedBoard[String.fromCharCode(65 + i)] = row;
  });

  console.log("\nCurrent Board:");
  console.table(formattedBoard);
}

function allShipsSunk(board) {
  return board.every((row) => row.every((cell) => cell.type === "empty" || cell.hit));
}

function getUserGuess(board) {
  rl.question("Enter your guess (e.g., A1, B2): ", (input) => {
    input = input.toUpperCase();
    const row = input.charCodeAt(0) - 65;
    const col = parseInt(input.substring(1)) - 1;

    if (isNaN(col) || row < 0 || row >= board.length || col < 0 || col >= board.length) {
      console.log("Invalid input. Please enter a valid coordinate (e.g., A1).");
      return getUserGuess(board);
    }

    let cell = board[row][col];

    if (cell.hit) {
      console.log("You've already guessed this spot!");
    } else {
      cell.hit = true;
      if (cell.type === "empty") {
        console.log("Miss! ❌");
        board[row][col] = { ...MISS };
      } else {
        console.log("Hit! 🎯");
      }
    }

    console.clear();
    printBoard(board, false);

    if (allShipsSunk(board)) {
      console.log("Congratulations! You sank all the ships! 🎉");
      rl.close();
    } else {
      getUserGuess(board);
    }
  });
}

function startGame() {
  console.clear();
  console.log("Welcome to Battleship 🚢");

  rl.question("Choose board size (4, 5, 6): ", (size) => {
    size = parseInt(size);
    if (![4, 5, 6].includes(size)) {
      console.log("Invalid size. Choose 4, 5, or 6.");
      return startGame();
    }

    let board = createBoard(size);
    if (size === 4) placeShips(board, 1, 1);
    if (size === 5) placeShips(board, 2, 1);
    if (size === 6) placeShips(board, 2, 2);

    console.clear();
    printBoard(board, false);
    getUserGuess(board);
  });
}

startGame();

