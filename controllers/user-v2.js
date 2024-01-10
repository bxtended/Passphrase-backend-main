const { ethers } = require("ethers");
const hash = require("hash.js");
const GameV2 = require("../models/Game-v2");
const UserV2 = require("../models/User-v2");
const { getTop30PercRewards } = require("../utils/priceDistribution");
const { isValidUser, getSignature } = require("../utils/sign");
const {
  doesUserBaught,
  isGameExist,
  fetchNoOfUsers,
  fetchGamePrice,
  fetchChainId,
  fetchContract,
  fetchUsersNft,
  fetchIsGameStartedForUsers,
  fetchIsUserClaimed,
  userBaughtTimestamp,
  isWhitelisted,
} = require("../utils/subgraph");
const { sendMail } = require("../utils/email");
const {
  isGameGoinToStart,
} = require("../utils/contracts/functions/passPhrase");
const UserMetaData = require("../models/UserMetaData");

exports.userInfo = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");

    if (!["gameId", "account"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is user valid
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    // is user whitelisted
    const isUserWhitelisted = await isWhitelisted(address.toLowerCase());
    if (!isUserWhitelisted)
      throw Error("Validation Failed: user isn't an operator");

    const { gameId, account } = req.body;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // does user baught the game
    const isBaught = await doesUserBaught(gameId, account.toLowerCase());
    if (!isBaught)
      throw Error("Validation Failed: user doesn't baught the game");

    const id = `${account.toLowerCase()}-${gameId}`;
    const user = await UserV2.findOne({ id });

    if (!user) {
      return res.status(200).send({
        status: "OK",
        user: null,
      });
    }

    return res.status(200).send({
      status: "OK",
      user: {
        username: user?.username,
        email: user?.email,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.shouldBroadcast = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");
    if (!["gameId"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is user valid
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    const { gameId } = req.body;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // does user baught the game
    const isBaught = await doesUserBaught(gameId, address.toLowerCase());
    if (!isBaught)
      throw Error("Validation Failed: user doesn't baught the game");

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // is game over
    if (game.isLocked) {
      throw Error("Validation Failed: Can't broadcast on the overed game");
    }

    // is game over
    if (game?.hasInformedEveryone) {
      throw Error("Validation Failed: Already emailed");
    }

    const isSlotFull = await isGameGoinToStart(gameId);
    const origin = req.get("origin");
    const host = req.get("host");

    const path = `${req.protocol}://${
      origin ? origin.slice(origin.lastIndexOf("/") + 1) : host
    }/app/instructions/${gameId}`;

    if (isSlotFull) {
      const users = await UserV2.find({ gameId });

      for (let user of users) {
        if (
          user?.username &&
          user?.email &&
          user?.username !== "" &&
          user?.email !== ""
        ) {
          await sendMail(
            { username: user?.username, email: user?.email },
            path,
            isSlotFull
          );
        }
      }

      game.hasInformedEveryone = true;
      await game.save();
    }
    return res.status(200).send({
      status: "OK",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.updateOrCreateUser = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");
    if (!["gameId", "username", "email"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is user valid
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    const { gameId, username, email } = req.body;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // does user baught the game
    const isBaught = await doesUserBaught(gameId, address.toLowerCase());
    if (!isBaught)
      throw Error("Validation Failed: user doesn't baught the game");

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // fetch user
    const id = `${address}-${gameId}`;
    let user = await UserV2.findOne({ id });

    // is game over
    if (game.isLocked) {
      throw Error("Validation Failed: Can't update user on the overed game");
    }

    // if user already created then its mean he is emailed already
    if (user) {
      throw Error(
        "Validation Failed: He is already informed or he didn't add email for notification & play the game"
      );
      // user.username = username;
      // user.email = email;
    }

    let usernameIsExist = await UserMetaData.findOne({
      username,
    });

    let emailIsExist = await UserMetaData.findOne({
      email,
    });

    if (usernameIsExist && usernameIsExist?.walletAddress !== address) {
      return res
        .status(200)
        .send({ status: "error", message: "username is already taken" });
    }

    if (emailIsExist && emailIsExist?.walletAddress !== address) {
      return res
        .status(200)
        .send({ status: "error", message: "email is already taken" });
    }

    // update user else create
    if (!user) {
      const userMeta = new UserMetaData({
        walletAddress: address,
        username,
        email,
        isDefault: false,
      });
      await userMeta.save();

      const timestamp = await userBaughtTimestamp(
        gameId,
        address.toLowerCase()
      );

      user = new UserV2({ id });
      user.walletAddress = address;
      user.gameId = gameId;
      user.username = username;
      user.email = email;
      user.joinedDate = timestamp;
    }

    await user.save();

    // const noOfUsers = await fetchNoOfUsers(gameId);
    // const totalPlayers = await fetchTotalPlayers(gameId);

    // const isSlotFull = noOfUsers === totalPlayers;
    const isSlotFull = await isGameGoinToStart(gameId);
    const origin = req.get("origin");
    const host = req.get("host");

    const path = `${req.protocol}://${
      origin ? origin.slice(origin.lastIndexOf("/") + 1) : host
    }/app/instructions/${gameId}`;

    await sendMail({ username, email }, path, isSlotFull);

    return res.status(200).send({
      status: "OK",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.stats = async (req, res) => {
  try {
    // validation

    if (!req?.params || !req.params?.gameId)
      throw Error("Validation Failed: properties are not defined");

    const { gameId } = req.params;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // is game over
    if (!game.isLocked) {
      throw Error("Validation Failed: game isn't overed yet");
    }

    const usersNft = await fetchUsersNft(gameId);
    const gamePrice = await fetchGamePrice(gameId);

    const gamePrize = Number((gamePrice * usersNft?.length * 0.8).toFixed(10));

    const gameStartedAtInSeconds =
      Number(usersNft[usersNft?.length - 1]?.timestamp) + 60 * 60 * 24;

    const gameStats = [];

    // fetch users
    let users = await UserV2.find({ gameId });

    for (let user of users) {
      gameStats.push({
        correctSeedsInOrder: user?.noOfCorrectSeedsInOrder,
        correctSeeds: user?.noOfCorrectSeeds,
        completedTime:
          user?.lastBestGuessTimestamp > 0
            ? user?.lastBestGuessTimestamp - gameStartedAtInSeconds * 1000
            : 0,
        account: user?.walletAddress,
        rank: user?.rank,
      });
    }

    return res.status(200).send({
      status: "OK",
      stats: {
        users: gameStats,
        gamePrize,
        noOfUsers: gameStats?.length,
        startedAt: gameStartedAtInSeconds * 1000,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.claimReward = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");

    if (!req?.params || !req.params?.gameId)
      throw Error("Validation Failed: properties are not defined");

    // is user valid
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    const { gameId } = req.params;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // does user baught the game
    const isBaught = await doesUserBaught(gameId, address.toLowerCase());
    if (!isBaught)
      throw Error("Validation Failed: user doesn't baught the game");

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // fetch user
    const id = `${address}-${gameId}`;
    let user = await UserV2.findOne({ id });

    // is game over
    if (!game.isLocked) {
      throw Error("Validation Failed: game isn't overed yet");
    }

    const hasUserClaimed = await fetchIsUserClaimed(
      gameId,
      address.toLowerCase()
    );
    if (hasUserClaimed) {
      return res.status(200).send({
        status: "OK",
        user: {
          message: "user has already claimed the reward",
          signature: "",
        },
      });
    }
    // throw Error("Validation Failed: user has already claimed the rewards");

    // if (!user) {
    //   throw Error("Validation Failed: user didn't participate the game");
    // }

    return res.status(200).send({
      status: "OK",
      user: {
        signature: user.claim,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.gameWinners = async (req, res) => {
  try {
    // validation
    if (!req?.params || !req.params?.gameId)
      throw Error("Validation Failed: properties are not defined");

    const { gameId } = req.params;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // is game over
    if (!game.isLocked) {
      throw Error("Validation Failed: game isn't ended yet");
    }

    // fetch user
    let users = await UserV2.find({ gameId });

    if (!users) {
      throw Error("Validation Failed: game doesn't have a users");
    }

    const usersNft = await fetchUsersNft(gameId);

    const userToNft = {};

    usersNft.forEach((user) => {
      userToNft[user?.address.toLowerCase()] = user?.nft;
    });

    const wUsers = [];

    for (const user of users) {
      wUsers.push({
        ranking: user.rank,
        prize: user.reward,
        account: user.walletAddress,
        tokenId: userToNft[user.walletAddress.toLowerCase()],
      });
    }

    return res.status(200).send({
      status: "OK",
      users: wUsers,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

exports.gameForUsers = async (req, res) => {
  const coolDownTimeInSec = parseInt(process.env.COOL_DOWN_TIME);
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");
    if (!["gameId", "words"].every((key) => req.body[key]))
      throw Error("Validation Failed: properties are not defined");

    // is user valid
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    const { words, gameId } = req.body;

    // is game exist
    const isExistGame = await isGameExist(gameId);
    if (!isExistGame) throw Error("Validation Failed: game doesn't exist");

    // does user baught the game
    const isBaught = await doesUserBaught(gameId, address.toLowerCase());
    if (!isBaught)
      throw Error("Validation Failed: user doesn't baught the game");

    // is game started for users
    const [isGameStartedForUsers, remainingSec] =
      await fetchIsGameStartedForUsers(gameId);
    if (!isGameStartedForUsers) {
      throw Error(
        `Validation Failed: game isn't started yet => ${remainingSec}`
      );
    }

    // fetch game words
    let game = await GameV2.findOne({ gameId });
    if (!game) throw Error("Validation Failed: game isn't initialized yet");

    // fetch user
    const id = `${address}-${gameId}`;
    let user = await UserV2.findOne({ id });

    // is game over
    if (game.isLocked) {
      return res.status(200).send({
        status: "OK",
        user: {
          bestGuess: user ? user.bestGuess : 0,
          highlights: [],
          remainingCoolDown: 0,
          info: "END",
        },
      });
    }

    // is user on waiting
    if (user) {
      const diff = ~~((Date.now() - user.lastTriedTimestamp) / 1000);
      if (diff <= coolDownTimeInSec) {
        return res.status(200).send({
          status: "OK",
          user: {
            bestGuess: user.bestGuess,
            highlights: [],
            remainingCoolDown: coolDownTimeInSec - diff,
          },
        });
      }
    }

    // inits
    let highlights = [];
    let newBestGuess = 0;

    const wordsArr = words.split(",");
    const wordsHashed = wordsArr.map((word) =>
      hash.sha256().update(word).digest("hex")
    );

    const arrPassPhrase = game.passPhrase.split(",");
    const arrUserGuess = wordsHashed;

    let noOfCorrectSeedsInOrder = 0;
    let noOfCorrectSeeds = 0;

    if (arrPassPhrase.length !== arrUserGuess.length)
      throw Error("Validation Failed: length of guessed words mismatched");

    // calc best guess & highlights
    arrPassPhrase.forEach((word, idx) => {
      if (arrPassPhrase.includes(arrUserGuess[idx])) {
        noOfCorrectSeeds += 1;
        if (
          word.toLowerCase() === arrUserGuess[idx].toLowerCase() &&
          noOfCorrectSeedsInOrder == idx
        ) {
          noOfCorrectSeedsInOrder += 1;
        }
      }

      if (arrPassPhrase.includes(arrUserGuess[idx])) {
        if (word.toLowerCase() === arrUserGuess[idx].toLowerCase()) {
          newBestGuess += 1;
          highlights.push(2);
        } else {
          highlights.push(1);
        }
      } else {
        highlights.push(0);
      }
    });
    newBestGuess /= arrPassPhrase.length;

    // update user else create
    if (!user) {
      const timestamp = await userBaughtTimestamp(
        gameId,
        address.toLowerCase()
      );
      user = new UserV2({ id });
      user.walletAddress = address;
      user.gameId = gameId;
      user.joinedDate = timestamp;
    }

    if (user.bestGuess < newBestGuess) {
      user.lastBestGuessTimestamp = Date.now();
      user.bestGuess = newBestGuess;

      if (newBestGuess === 1) {
        game.isLocked = true;
        game.timeEnd = Date.now();
        await game.save();
      }
    }

    if (user.noOfCorrectSeedsInOrder < noOfCorrectSeedsInOrder) {
      user.lastNoOfCorrectSeedsOrInOrderTimestamp = Date.now();
      user.noOfCorrectSeedsInOrder = noOfCorrectSeedsInOrder;
    }

    if (user.noOfCorrectSeeds < noOfCorrectSeeds) {
      user.lastNoOfCorrectSeedsOrInOrderTimestamp = Date.now();
      user.noOfCorrectSeeds = noOfCorrectSeeds;
    }

    user.lastTriedTimestamp = Date.now();
    user.noOfTries += 1;

    await user.save();

    if (game.isLocked) {
      prepareRewards(gameId);
    }

    return res.status(200).send({
      status: "OK",
      user: {
        bestGuess: user.bestGuess,
        highlights,
        remainingCoolDown: coolDownTimeInSec,
        // user,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", message: "bad request" });
  }
};

async function prepareRewards(gameId) {
  try {
    // create users if not exist ${address}-${gameId}

    const usersNft = await fetchUsersNft(gameId);

    // const gameStartedAtInSeconds =
    //   Number(usersNft[usersNft?.length - 1]?.timestamp) + 60 * 60 * 24;

    for (let i = 0; i < usersNft?.length; i++) {
      const id = `${usersNft[i]?.address}-${gameId}`;
      let user = await UserV2.findOne({ id });
      if (!user) {
        user = new UserV2({
          id,
          gameId,
          walletAddress: usersNft[i]?.address,
          joinedDate: Number(usersNft[i]?.timestamp) * 1000,
          // lastBestGuessTimestamp: gameStartedAtInSeconds * 1000,
          // lastNoOfCorrectSeedsOrInOrderTimestamp: gameStartedAtInSeconds * 1000,
          // lastTriedTimestamp: gameStartedAtInSeconds * 1000,
        });
        await user.save();
      }
    }

    // ------

    await UserV2.find({ gameId })
      .sort({ noOfCorrectSeedsInOrder: -1 })
      .exec(async (err, docs) => {
        let isSorted = false;
        while (!isSorted) {
          isSorted = true;

          for (let i = 0; i < docs.length; i++) {
            const currentUser = docs[i];

            if (
              i + 1 !== docs.length &&
              currentUser.noOfCorrectSeedsInOrder ===
                docs[i + 1].noOfCorrectSeedsInOrder
            ) {
              const nextUser = docs[i + 1];

              const depth0 = compareCurrent(
                currentUser.noOfCorrectSeeds,
                nextUser.noOfCorrectSeeds
              );
              if (depth0) {
                [docs[i], docs[i + 1], change] = compareAction(
                  docs[i],
                  docs[i + 1],
                  depth0
                );
                isSorted = !change;
                continue;
              }

              const depth1 = compareCurrent(
                new Date(
                  nextUser.lastNoOfCorrectSeedsOrInOrderTimestamp
                ).getTime(),
                new Date(
                  currentUser.lastNoOfCorrectSeedsOrInOrderTimestamp
                ).getTime()
              );

              if (depth1) {
                [docs[i], docs[i + 1], change] = compareAction(
                  docs[i],
                  docs[i + 1],
                  depth1
                );
                isSorted = !change;
                continue;
              }

              const depth2 = compareCurrent(
                new Date(nextUser.joinedDate).getTime(),
                new Date(currentUser.joinedDate).getTime()
              );

              if (depth2) {
                [docs[i], docs[i + 1], change] = compareAction(
                  docs[i],
                  docs[i + 1],
                  depth2
                );
                isSorted = !change;
                continue;
              }
            }
          }
        }

        const noOfUsers = await fetchNoOfUsers(gameId);
        const gamePrice = await fetchGamePrice(gameId);

        const chainId = await fetchChainId();
        const contractAddress = await fetchContract();

        const prizes = getTop30PercRewards(noOfUsers, gamePrice);

        await Promise.all(
          prizes.userRewards.map((reward, idx) => {
            docs[idx].rank = idx + 1;
            docs[idx].reward = reward.prize;
            docs[idx].claim = getSignature(
              docs[idx].walletAddress,
              gameId,
              idx + 1,
              ethers.utils.parseUnits(reward.prize.toString(), "ether"),
              chainId,
              contractAddress
            );

            if (idx < docs.length) return docs[idx].save();
            else return {};
          })
        );
      });
  } catch (e) {
    console.log(e);
  }
}

exports.prepareRewards = prepareRewards;

function compareCurrent(a, b) {
  if (a === b) return 0;
  else if (a < b) return -1;
  else if (a > b) return 1;
}

function compareAction(current, next, compare) {
  switch (compare) {
    case 0:
      return [current, next, false];
    case 1:
      return [current, next, false];
    case -1:
      return [next, current, true];
  }
}
