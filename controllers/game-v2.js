const GameV2 = require("../models/Game-v2");
const WordV2 = require("../models/Word-v2");
const {
  isGameExistFromContract,
} = require("../utils/contracts/functions/passPhrase");
const { isValidUser } = require("../utils/sign");
const { isWhitelisted } = require("../utils/subgraph");
const hash = require("hash.js");

exports.initializeGame = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");
    if (!["gameId", "passPhrase", "words"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is valid user
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    // is user whitelisted
    const isUserWhitelisted = await isWhitelisted(address.toLowerCase());
    if (!isUserWhitelisted)
      throw Error("Validation Failed: user isn't an operator");

    const { gameId, passPhrase, words } = req.body;

    if (passPhrase.split(",").length !== 12 || words.split(",").length !== 50) {
      throw Error("Validation Failed: inacurate passPhrase or words length");
    }

    // is game exist
    const isExistFame = await isGameExistFromContract(gameId);
    if (!isExistFame) throw Error("Validation Failed: game doesn't exist");

    const passPhraseArr = passPhrase.split(",");

    const passPhraseHashed = passPhraseArr
      .map((word) => hash.sha256().update(word).digest("hex"))
      .join(",");

    // find one or create
    let game = await GameV2.findOne({ gameId });

    if (game) throw Error("Validation Failed: game is already initialized");

    if (!game) {
      game = GameV2({ gameId });
    }
    game.creatorAddress = address;
    game.passPhrase = passPhraseHashed;
    await game.save();

    let wordv2 = new WordV2({
      id: gameId,
      words,
    });

    await wordv2.save();

    return res.status(200).send({ complete: true, status: "OK" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ complete: false, status: "error", message: "bad request" });
  }
};

exports.lockedGames = async (req, res) => {
  try {
    const lockedGames = {};

    // find
    let games = await GameV2.find({});
    if (!games) {
      games = [];
    }

    games.forEach((game) => {
      lockedGames[game?.gameId] = game?.isLocked;
    });

    return res
      .status(200)
      .send({ complete: true, status: "OK", games: lockedGames });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ complete: false, status: "error", message: "bad request" });
  }
};
