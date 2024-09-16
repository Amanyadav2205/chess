const express = require("express");
const path = require("path");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const { title } = require("process");
const { log } = require("console");

const app = express();

const server = http.createServer(app);
const io = socket(server);

//The Chess() function hepls to bring all the rules/regulations and eveything from chess in the chess variable
const chess = new Chess();

let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// this is a route
app.get("/", (req, res) => {
  res.render("index", { title: "Custom Chess Game" });
});

io.on("connection", function (uniquesocket) {
  console.log("connected");

  if (!players.white) {
    players.white = uniquesocket.id;
    // Response from server to self
    uniquesocket.emit("playerRole", "w"); 
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }

  // Disconnection from the server
  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });


  // Checking move
  uniquesocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      const result = chess.move(move);

      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("something went wrong", move);
        uniquesocket.emit("Invalid move", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("Invalid move : ", move);
    }
  });
});

server.listen(3000, function () {
  console.log("port 3000");
});
