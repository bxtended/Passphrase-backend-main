const Player = require('../models/Player');
const Game = require('../models/Game');
// const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { createPlayers, createPlayersTwice } = require('./playerGenerator');

const playerController = {

  updatePlayer: async (req, res) => {
    try {
      const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.status(200).json({ complete: true, result: player });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  getOne: async (req, res) => {
    const { tokenId, gameId } = req.params;
    console.log(tokenId, gameId);
    try {
      const player = await Player.find({ tokenId: tokenId, game: gameId });
      return res.status(200).json({ complete: true, result: player });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  get: async (req, res) => {
    let all = (req.query.all);
    try {
      const wordFilter = req.query?.word
        ? { word: { $regex: '.*' + req.query?.word + '.*', $options: 'i' } }
        : {};
      if (!all) {
        const player = await Player.aggregate([
          {
            $match: {
              $and: [{ game: req.query.game }, wordFilter],
            },
          },
          {
            $sort: { createdAt: 1 },
          },
          {
            $limit: 100
          }
        ]);
        const total = await Player.find({ game: req.query.game }).count()
        const PlayerByWallet = await Player.find({ walletAddress: req.query.walletAddress })
        return res.status(200).json({ complete: true, result: player, total: total, PlayerByWallet: PlayerByWallet });
      } else {
        console.log('all')
        const player = await Player.aggregate([
          {
            $match: {
              $and: [{ game: req.query.game }, wordFilter],
            },
          },
          {
            $sort: { createdAt: 1 },
          },
        ]);
        const total = await Player.find({ game: req.query.game }).count()
        const PlayerByWallet = await Player.find({ walletAddress: req.query.walletAddress })
        return res.status(200).json({ complete: true, result: player, total: total, PlayerByWallet: PlayerByWallet });
      }


    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      console.log('req', req.query);
      const wordFilter = req.query?.word
        ? { word: { $regex: '.*' + req.query?.word + '.*', $options: 'i' } }
        : {};
      const player = await Player.aggregate([
        {
          $match: {
            $and: [{ game: req.query.game }, wordFilter],
          },
        },
        {
          $sort: { createdAt: 1 },
        },

      ]);
      return res.status(200).json({ complete: true, result: player });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  update: async (req, res) => {

    try {
      const { word, game, username, email, walletAddress, isBought } = req.body;
      const player = await Player.findOne({ tokenId: word, game });
      if (player && walletAddress && walletAddress?.length > 0) {
        player.userName = username;
        player.email = email;
        player.walletAddress = walletAddress;
        if (isBought) {
          player.isBought = isBought;
        }
        await player.save();

        return res.status(200).json({ complete: true, result: player });
      } else {
        return res.status(400).json({ complete: false, result: 'Not found NFT' });
      }
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  getByGame: async (req, res) => {
    try {
      const player = await Player.find({ walletAddress: req.params.wallet, isBought: true });
      return res.status(200).json({ complete: true, result: player });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  checkPlayer: async (req, res) => {
    try {
      const player = await Player.findOne({
        ...req.query,
        isCompleted: { $ne: true }
      });
      return res.status(200).json({ complete: true, result: player });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  sendMail: async (req, res) => {
    console.log("sendMail")
    try {
      const { email, username, path, game } = req.body;
      const thisgame = await Game.findById(game);
      let emails = [];

      let content = '';
      if (thisgame.timeStart) {
        const players = await Player.find({ game });

        players.forEach(function (item) {
          if (item.email) {
            if (emails.indexOf(item.email) < 0) {
              emails.push(item.email);
            }
          }
        });

        content = `<h1>Dear ${username}!</h1>
                        <p>You purchased NFT successful.</p>
                        <p>Game goes live in 24 hours.</p>
                        <p>Visit link to more information ${path}
                        <p>Best regards</p>`;
      } else {
        content = `<h1>Dear ${username}!</h1>
        <p>You purchased NFT successful. We will notify you via email when game start.</p>
        <p>Visit link to more information ${path}
        <p>Best regards</p>`;
      }

      sgMail.setApiKey(process.env.API_SENDGRID_MAIL);

      const message = {
        to: email,
        from: process.env.USER_MAIL,
        subject: process.env.SUBJECT_MAIL,
        html: content,
      };
      await sgMail.send(message);

      // if (emails.length > 0) {
      //     await sgMail.sendMultiple(message);
      // } else {
      //     await sgMail.send(message);
      // }
      // const message = {
      //     to: emails.length > 0 ? emails : email,
      //     from: process.env.USER_MAIL,
      //     subject: process.env.SUBJECT_MAIL,
      //     html: content,
      // };

      // if (emails.length > 0) {
      //     await sgMail.sendMultiple(message);
      // } else {
      //     await sgMail.send(message);
      // }

      return res.status(200).json({ complete: true, result: 'We sent you a mail' });
    } catch (err) {
      // console(err.message)
      return res.status(500).json({ complete: false, result: err.message });
    }
  },
  generatorplayers: async (req, res) => {
    try {
      const { numberPlayer, passPhrase } = req.body;
      let players = [];
      players = await createPlayers(numberPlayer, passPhrase);
      if (numberPlayer > 100) {
        players = await createPlayers(100, passPhrase);
      }
      return res.status(200).json({ complete: true, result: players });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  // sendMail: (req, res) =>{
  //   const { email, username, path } = req.body;
  //   const transporter = nodemailer.createTransport({
  //     service: process.env.SERVICE_MAIL,
  //     auth: {
  //       user: process.env.USER_MAIL,
  //       pass: process.env.PASS_MAIL
  //     }
  //   });

  //   const mailOptions = {
  //     from: process.env.USER_MAIL,
  //     to: email,
  //     subject: process.env.SUBJECT_MAIL,
  //     html: `<h1>Dear ${username}!</h1>
  //     <p>You purchased NFT successful. We will notify you via email when game start.</p>
  //     <p>Visit link to more information ${path}
  //     <p>Best regards</p>`
  //   };

  //   transporter.sendMail(mailOptions, function(error, info){
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  //       return res.json('success')
  //     }
  //   });
  // }
};

module.exports = playerController;
