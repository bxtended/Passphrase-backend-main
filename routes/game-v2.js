const express = require("express");
const { initializeGame, lockedGames } = require("../controllers/game-v2");
const { stats } = require("../controllers/user-v2");
const routerGameV2 = express.Router();

routerGameV2.route("/").post(initializeGame);
routerGameV2.route("/").get(lockedGames);
routerGameV2.route("/stats/:gameId").get(stats);

module.exports = routerGameV2;
