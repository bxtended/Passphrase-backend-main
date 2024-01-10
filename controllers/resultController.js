const Player = require("../models/Player");
const Result = require("../models/Result");
const Game = require("../models/Game");
const ethers = require("ethers");
const { findOneAndUpdate } = require("../models/Player");
const _getSignature = async (user, tokenAddress, _ranking, _tokenId) => {
  const domain = {
    name: "Game",
    version: "1.0.0",
    chainId: process.env.CHAIN,
    verifyingContract: tokenAddress
  }
  const types = {
    Game: [
      {
        name: "_ranking", type: 'uint256'
      },
      { name: "_tokenId", type: 'uint256' },

    ]
  }
  return user._signTypedData(domain,
    types,
    {
      _ranking,
      _tokenId
    }
  )
}
const resultController = {
  getSignature: async (req, res) => {
    try {
      const { player } = req.params;
      const result = await Result.findOne({ player: player });
      const _player = await Player.findById(player);
      const _game = await Game.findById(_player.game);
      const user = new ethers.Wallet(process.env.BACKEND_PRIVATE);
      if (!result || !player) {
        return res.status(500).json({ complete: false, result: "Not found!" });
      }
      const signature = await _getSignature(user, _game.tokenAddress, result.ranking, _player.tokenId)
      return res.status(200).json({
        complete: true, result: {
          ranking: result.ranking,
          tokenId: _player.tokenId,
          signature
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const result = new Result(req.body);
      await result.save();
      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  updateByPlayer: async (req, res) => {
    try {
      const { player } = req.params;
      const result = await Result.findOneAndUpdate({ player: player }, { ...req.body }, { new: true });
      return res.status(200).json({ complete: true, result: result });
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
        {
          $lookup: {
            from: "players",
            let: { player: { $toObjectId: "$player" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    // $eq: [{ $toObjectId: "6380646217e0387d942c132a" }, "$_id"]
                    $and: [
                      { $eq: ["$_id", "$$player"] }
                    ]
                  }
                }
              }
            ],
            as: "playerObject"
          }
        },
        {
          $unwind: "$playerObject"
        },
        {
          $sort: {
            total: -1,
            timeComplete: 1,
          },
        },
      ];

      const result = await Result.aggregate(tmp);
      return res.status(200).json({
        complete: true, result: {
          items: result
        }
      });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Key.findByIdAndDelete(id);
      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
};

module.exports = resultController;
