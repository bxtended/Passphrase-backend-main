const Investor = require("../models/Investor");
const keyController = require("../controllers/keyController");
const Key = require("../models/Key");
const investorController = {
  getByGameAndAddress: async (req, res) => {
    try {
      const investor = await Investor.findOne({
        game: req.params.game,
        investor: req.params.address
      })
      return res.status(200).json(investor);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  create: async (req, res) => {
    try {
      let key = await keyController.findByGame(req.body.game);
      if (!key) {
        key = new Key({ game: req.body.game });
        await key.save();
      }
      if (req.body?.gold > key.gold) {
        return res
          .status(500)
          .json({ complete: false, result: "exceed the number of existence" });
      }
      if (req.body?.silver > key.silver) {
        return res
          .status(500)
          .json({ complete: false, result: "exceed the number of existence" });
      }
      if (req.body?.bronze > key.bronze) {
        return res
          .status(500)
          .json({ complete: false, result: "exceed the number of existence" });
      }
      let payload;
      payload = {
        gold: req.body.gold ? key.gold - req.body.gold : key.gold,
        silver: req.body.silver ? key.silver - req.body.silver : key.silver,
        bronze: req.body.bronze ? key.bronze - req.body.bronze : key.bronze,
      };
      keyController.updateKey(key._id, payload);
      const info = await investorController.findInGame(
        req.body.investor,
        req.body.game
      );
      if (info) {
        req.body?.gold > 0
          ? (req.body.gold = +req.body.gold + info.gold)
          : (req.body.gold = info.gold);
        req.body?.silver > 0
          ? (req.body.silver = +req.body.silver + info.silver)
          : (req.body.silver = info.silver);
        req.body?.bronze > 0
          ? (req.body.bronze = +req.body.bronze + info.bronze)
          : (req.body.bronze = info.bronze);
        const investor = await Investor.findByIdAndUpdate(info._id, req.body, {
          new: true,
        });
        return res.status(200).json({ complete: true, result: investor });
      } else {
        const investor = new Investor(req.body);
        await investor.save();
        return res.status(200).json({ complete: true, result: investor });
      }
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const investor = await Investor.findByIdAndUpdate(id, payload, {
        new: true,
      });
      return res.status(200).json({ complete: true, result: investor });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  getByGame: async (req, res) => {
    try {
      const { idGame } = req.params;
      let tmp = [];
      tmp = [
        {
          $match: {
            game: idGame,
          },
        },
      ];

      const result = await Investor.aggregate(tmp);
      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const investor = await Investor.findByIdAndDelete(id);
      return res.status(200).json({ complete: true, result: investor });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  findInGame: async (investor, game) => {
    try {
      tmp = [
        {
          $match: {
            investor: investor,
            game: game,
          },
        },
      ];

      const result = await Investor.aggregate(tmp);
      return result[0];
    } catch (error) {
      console.log(error.message);
    }
  },
};

module.exports = investorController;
