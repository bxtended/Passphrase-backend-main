const Key = require("../models/Key");

const keyController = {
  create: async (req, res) => {
    try {
      const key = new Key(req.body);
      await key.save();
      return res.status(200).json({ complete: true, result: key });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const key = await Key.findByIdAndUpdate(id, payload, { new: true });
      return res.status(200).json({ complete: true, result: key });
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

      const result = await Key.aggregate(tmp);
      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const key = await Key.findByIdAndDelete(id);
      return res.status(200).json({ complete: true, result: key });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  findByGame: async (idGame) => {
    try {
      tmp = [
        {
          $match: {
            game: idGame,
          },
        },
      ];

      const result = await Key.aggregate(tmp);
      return  result[0]
    } catch (error) {
      console.log(error.message)
    }
  },

  updateKey: async (id, payload) => {
    try {
      const key = await Key.findByIdAndUpdate(id, payload, { new: true });
      return res.status(200).json({ complete: true, result: key });
    } catch (error) {
      return JSON.stringify(error.message);
    }
  }
};

module.exports = keyController;
