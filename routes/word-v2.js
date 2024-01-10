const express = require("express");
const {
  updateOrCreateGameWords,
  wordsForEveryone,
  randomWords,
} = require("../controllers/word-v2");
const routerWordV2 = express.Router();

routerWordV2.route("/").post(updateOrCreateGameWords);
routerWordV2.route("/random/").get(randomWords);
routerWordV2.route("/:gameId").get(wordsForEveryone);

module.exports = routerWordV2;
