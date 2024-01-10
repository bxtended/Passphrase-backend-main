const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, "Please add userName"],
  },
  userName: {
    type: String,
  },
  email: {
    type: String,
    default: '',
  },
  walletAddress: {
    type: String,
    default: '',
    index: true,
  },
  isBought: {
    type: Boolean,
    default: false
  },
  game: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tokenId: {
    type: Number,
  },
  isCompleted: {
    type: Boolean,
  }
});

module.exports = mongoose.model("Player", PlayerSchema);
