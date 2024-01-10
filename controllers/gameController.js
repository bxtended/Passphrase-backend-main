const Game = require("../models/Game");
const Player = require("../models/Player");
const User = require("../models/User");
const sgMail = require('@sendgrid/mail');
const { createPlayers } = require("./playerGenerator");
const { createCanvas, registerFont } = require('canvas')
const bcrypt = require("bcryptjs");
require("dotenv").config();
const CryptoJS = require("crypto-js");
const Result = require("../models/Result");
const gameController = {
  create: async (req, res) => {
    try {
      const hasspassWord = process.env.SECRET_PHRASE;
      let players = [];
      const { id } = req.user;
      const { numberPlayer, price, passPhraseGame, randomWord, twitterURL, contactNumber, timeEnd } = req.body;
      let passPhraseHash = [];
      for (let i = 0; i < passPhraseGame.length; i++) {
        let encrypted = CryptoJS.MD5(passPhraseGame[i], hasspassWord).toString();
        passPhraseHash.push(encrypted);
      }
      const newGame = Game({ numberPlayer, price, passPhrase: passPhraseHash, randomWord, twitterURL, contactNumber, user: id, timeEnd });
      const result = await newGame.save();
      players = await createPlayers(numberPlayer)
      if (numberPlayer > 100) {
        let players_first = [...players];
        await createPlayer(result._id, players_first.slice(0, 100));
        players_second = players.slice(100, players.length);
        createPlayerSencond(result._id, players_second).then(() => Game.findByIdAndUpdate(result._id,
          { isCreating: true },
          function (err, docs) {
            if (err) {
              return res.status(500).json({ complete: false, result: err.message });
            } else {

            }

          }))
        return res.status(200).json({ complete: true, result: result, players: players });
      }
      else {
        createPlayer(result._id, players).then(() => Game.findByIdAndUpdate(result._id,
          { isCreating: true },
          function (err, docs) {
            if (err) {
              console.log(err)
            }
          }))
        return res.status(200).json({ complete: true, result: result, players: players });
      }
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  setTokenAddress: async (req, res) => {
    try {
      const { creatorAddress, tokenAddress } = req.body;
      const { id } = req.params;
      const game = await Game.findById(id);
      game.tokenAddress = tokenAddress;
      game.creatorAddress = creatorAddress;
      await game.save();
      return res.status(200).json({ complete: true, result: game });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  get: async (req, res) => {

    try {
      const { page, LIMIT, ...rest } = req.query;
      const search = { ...rest, tokenAddress: { $ne: null } };
      const skip = (page * LIMIT) - LIMIT;
      const game = await Game.find(search, { passPhrase: 0, randomWord: 0 }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(LIMIT));
      const totalGame = await Game.find(search, { passPhrase: 0, randomWord: 0 }).count();
      return res.status(200).json({ complete: true, result: game, total: totalGame });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  adminGet: async (req, res) => {

    try {
      const game = await Game.find({ user: req.user.id }, { passPhrase: 0, randomWord: 0 }).sort({ createdAt: -1 });
      return res.status(200).json({ complete: true, result: game });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      // const game = await Game.findById(id);
      const game = await Game.findById(id);
      const user = await User.findById(game.user, { password: 0 })
      return res.status(200).json({ complete: true, result: game, user });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  getMetaData: async (req, res) => {
    try {
      const { id, tokenID } = req.params;
      const player = await Player.find({ $and: [{ tokenId: tokenID }, { game: id }] })
      let result = {
        name: "Passphrase game",
        description: `NFT of passphrase game, ID ${player[0].game}`,
        image: `passphrase.com/image/${player[0].game}/${player[0].tokenId}.png`
      }
      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  getImage: async (req, res) => {
    try {
      const { id, tokenID } = req.params;
      const canvas = createCanvas(500, 500)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = "#0e0f11";
      ctx.fillRect(0, 0, 500, 500);
      ctx.fillStyle = "#ffd600";
      ctx.font = '50px "Impact"';
      ctx.fillText(1980, 200, 250);
      const player = await Player.find({ $and: [{ tokenId: tokenID }, { game: id }] })
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  getPassPhrase: async (req, res) => {
    try {
      const { id } = req.params;
      const game = await Game.findById(id);
      return res.status(200).json({
        complete: true, result: {
          _id: game._id,
          status: game.status,
          numberPlayer: game.numberPlayer,
          price: game.price,
          user: game.user,
          timeStart: game.timeStart,
          passPhrase: game.passPhrase,
          randomWord: game.randomWord,
        }
      })

    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const game = await Game.findByIdAndDelete(id);
      return res.status(200).json({ complete: true, result: game });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const game = await Game.findByIdAndUpdate(id, payload, { new: true });
      if (game.numberPlayer === payload.sold) {
        const date = new Date().getTime();
        game.timeStart = date;
        await game.save();
        await sendMail(id, req.body.path, res);
      }
      return res.status(200).json({ complete: true, result: game });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }

  },
  getByAccount: async (req, res) => {
    const { account } = req.params;
    try {
      const gameIds = await Player.distinct('game', { walletAddress: account });
      if (gameIds.length > 0) {
        const game = await Game.find({ _id: { $in: gameIds } }, { passPhrase: 0, randomWord: 0 })
        return res.status(200).json({ complete: true, result: game });
      } else {
        return res.status(200).json({ complete: true, result: [] });
      }
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  checkPassPharse: async (req, res) => {
    try {
      const hasspassWord = process.env.SECRET_PHRASE;
      const { id } = req.params;
      const game = await Game.findById(id);
      const { currentGuess, passGuess, player } = req.body;
      let result = await Result.findOne({ player, game: id });
      if (!result) {
        result = await Result.create({
          player,
          game: id,
          ranking: 0,
          value: 0,
          total: 0,
          timeComplete: Date.now(),
          withdraw: false
        })
      }
      let passPhraseHash = [];
      for (let i = 0; i < currentGuess.length; i++) {
        let hash = CryptoJS.MD5(currentGuess[i], hasspassWord).toString();
        passPhraseHash.push(hash);
      }
      if (JSON.stringify(game.passPhrase) === JSON.stringify(passPhraseHash)) {
        const socket = req.app.get('socket');
        socket.to(id).emit('end-game');
        await Result.findByIdAndUpdate(result._id, { total: 12, timeComplete: Date.now() }, { new: true });
        const ranking = await Result.aggregate([
          {
            $match: {
              game: id
            }
          },
          {
            $sort: {
              total: -1,
              timeComplete: 1
            }
          }
        ]).exec();
        const total = +game.numberPlayer * +game.price;
        for (let i = 0; i < ranking.length; i++) {
          let value = 0;
          let _ranking = i + 1;
          if (_ranking == 1) {
            value = total / 2;
          }
          if (_ranking == 2) {
            value = total / 10;
          }
          if (_ranking == 3) {
            value = total / 20;
          }
          if (_ranking >= 4 && _ranking <= 99) {
            value = (total * 5) / 100 / 96;
          }
          if (_ranking >= 100 && _ranking <= 499) {
            value = (total * 4) / 100 / 399;
          }
          if (_ranking >= 500 && _ranking <= 999) {
            value = (total * 3) / 100 / 499;
          }
          if (_ranking >= 1000 && _ranking <= 1999) {
            value = (total * 2) / 100 / 999;
          }
          if (_ranking >= 2000 && _ranking <= 3999) {
            value = (total * 1) / 100 / 1999;
          }
          await Result.findByIdAndUpdate(ranking[i]._id, { ranking: i + 1, value }, { new: true });
        }
        await Game.findById(id, { status: false });
        return res.status(200).json({ complete: true, result: true, guess: game.passPhrase });
      }
      else {
        let total = 0;
        const checkPassPhrase = currentGuess.map((p, index) => {
          let hash = CryptoJS.MD5(p, hasspassWord).toString();
          if (hash === game.passPhrase[index]) {
            total++;
            return 1
          } else if (game.passPhrase.includes(hash)) {
            return 0;
          } else {
            return 0;
          }
        })
        if (+total > +result.total) {
          await Result.findByIdAndUpdate(result._id, { total, timeComplete: Date.now() }, { new: true });
        }
        return res.status(200).json({ complete: true, result: false, guess: checkPassPhrase });
      }
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
}

const createPlayer = async (gameId, players) => {
  try {
    for (let i = 0; i < players.length; i++) {
      const newPlayer = Player({ word: i + 1, game: gameId, tokenId: i + 1 });
      await newPlayer.save();
    }
  } catch (error) {
    console.log('create player', error)
  }
}
const createPlayerSencond = async (gameId, players) => {
  try {
    let a = 100
    for (let i = 0; i < players.length; i++) {
      number = a + i + 1;
      const newPlayer = Player({ word: number, game: gameId, tokenId: number });
      await newPlayer.save();
    }
  } catch (error) {
    console.log('create player', error)
  }
}
async function sendMail(gameId, path, res) {
  try {
    sgMail.setApiKey(process.env.API_SENDGRID_MAIL);
    const player = await Player.find({ game: gameId });
    let address = [];
    for (let i = 0; i < player.length; i++) {
      if (player[i].email) {
        if (!address.some(item => item.email === player[i].email))
          address.push({ username: player[i].userName, email: player[i].email });
      }
    }
    for (let i = 0; i < address.length; i++) {
      const message = {
        to: address[i].email,
        from: process.env.USER_MAIL,
        subject: process.env.SUBJECT_MAIL,
        html: `<h1>Game Start!</h1>
        <p>Dear ${address[i].username}</p>
        <p>Game goes live in 24 hours.</p>
        <p>Visit link to more information ${path}
        <p>Best regards</p>`
      }
      await sgMail.send(message);
    }

  } catch (err) {
    console.log(err)
  }

}

module.exports = gameController;
// exports.updateBalance = async (req, res) => {
//   try {
//     var balance = { balance: req.body.balance };

//     var filter = { _id: req.params.id };

//     var newOne = await User.findOneAndUpdate(filter, balance, {
//       new: true,
//     });
//     res.json({
//       message: "Balance updated successfully",
//       user: newOne,
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: err,
//     });
//   }
// };

// exports.updateEmail = async (req, res) => {
//   try {
//     var email = { email: req.body.email };
//     var filter = { _id: req.params.id };
//     console.log(filter);
//     const user = await User.findOne(email);

//     if (user) throw Error("Email already in use");
//     if (!validator.validate(email.email)) {
//       throw Error("Email is invalid");
//     }
//     var newOne = await User.findOneAndUpdate(filter, email, {
//       new: true,
//     });
//     res.status(200).json({
//       message: "Email updated successfully",
//       user: newOne,
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };

exports.registerNewUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress, twitterURL, contactNumber } = await req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(201).json({
        completed: false,
        message: "Email already in use"
      });
    }
    if (!validator.validate(email))
      throw Error("Invalid email format, try again.");
    const newUser = new User({
      name,
      email,
      password,
      walletAddress,
      twitterURL,
      contactNumber
    });

    const salt = bcrypt.genSaltSync(10);

    if (password) newUser.password = bcrypt.hashSync(password, salt);

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
      expiresIn: "2h",
    });

    await newUser.save();

    return res.status(201).json({
      completed: true,
      user: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({
      completed: false,
      error: err.message,
    });
  }
};
