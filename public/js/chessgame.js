// this is frontend
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Creating Chess Board
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  //By using forEach we can now access one row at  time , we get one row to design
  board.forEach((row, rowindex) => {
    // a single square , inside a single row
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        // For the pattern , as there is present in chess
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      // Bringing each piece in each square
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText =  getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMoves(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b'){
    boardElement.classList.add("flipped");
  }
  else{
    boardElement.classList.remove("flipped");
  }
};

const handleMoves = (source , target) => {
  const move= {
    from: `${String.fromCharCode(97+source.col)}${8-source.row}`, 
    to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion: 'q'
  };

  socket.emit("move" , move);



};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "\u2659", // Black Pawn ♟
    r: "\u265C", // Black Rook ♜
    n: "\u265E", // Black Knight ♞
    b: "\u265D", // Black Bishop ♝
    q: "\u265B", // Black Queen ♛
    k: "\u265A", // Black King ♚
    P: "♙  w", // White Pawn ♙
    R: "\u2656", // White Rook ♖
    N: "\u2658", // White Knight ♘
    B: "\u2657", // White Bishop ♗
    Q: "\u2655", // White Queen ♕
    K: "\u2654", // White King ♔l
  };

  return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
  playerRole = role;
  renderBoard();
})

socket.on("spectatorRole" , function (){
  playerRole = null;
  renderBoard();
})

socket.on("boardState" , function (fen){
  chess.load(fen);
  renderBoard();
})

socket.on("move",function(move){
  chess.move(move);
  renderBoard();
})


document.addEventListener("DOMContentLoaded", function () {
  // Set player names
  const player1Name = prompt("Enter Player 1 (White) Name:", "Player 1");
  const player2Name = prompt("Enter Player 2 (Black) Name:", "Player 2");

  // Display player names in the UI
  document.getElementById("player1NameDisplay").textContent = player1Name;
  document.getElementById("player2NameDisplay").textContent = player2Name;

  // Chess logic and board initialization
  const boardElement = document.querySelector(".chessboard");
  // Initialize your chess game here using chess.js
});


renderBoard();
