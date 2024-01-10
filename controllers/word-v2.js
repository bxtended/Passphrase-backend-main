const Word = require("../models/Word");
const WordV2 = require("../models/Word-v2");
const { isValidUser } = require("../utils/sign");
const { isWhitelisted, isGameExist } = require("../utils/subgraph");

// not used right now
exports.updateOrCreateGameWords = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");
    if (!["words"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is valid user
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    // is whitelisted user
    const isUserWhitelisted = await isWhitelisted(address.toLowerCase());
    if (!isUserWhitelisted)
      throw Error("Validation Failed: user isn't whitelisted");

    // create word else update
    const { words } = req.body;
    let word = await WordV2.findOne({ id: "0" });

    if (!word) {
      word = new WordV2({});
    }
    word.words = words;
    await word.save();

    return res.status(200).send({ status: "OK" });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.wordsForEveryone = async (req, res) => {
  try {
    // validation
    if (!req?.params || !req.params?.gameId)
      throw Error("Validation Failed: properties are not defined");

    const { gameId } = req.params;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // fetch word
    let word = await WordV2.findOne({ id: gameId });

    if (!word) {
      throw Error("Words don't exist");
    }

    return res
      .status(200)
      .send({ complete: true, status: "OK", words: word.words.split(",") });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ complete: false, status: "error", message: "bad request" });
  }
};

exports.randomWords = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");

    // is valid user
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    // is whitelisted user
    const isUserWhitelisted = await isWhitelisted(address.toLowerCase());
    if (!isUserWhitelisted)
      throw Error("Validation Failed: user isn't whitelisted");

    const {
      query: { limit },
    } = req;

    // fetch word
    const words = await Word.aggregate([
      { $sample: { size: parseInt(limit) } },
    ]);

    const arrWords = words.map((word) => word.a);

    return res
      .status(200)
      .send({ complete: true, status: "OK", words: arrWords });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ complete: false, status: "error", message: "bad request" });
  }
};
