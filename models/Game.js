const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  tokenAddress: {
    type: String,
  },
  creatorAddress: {
    type: String,
  },
  numberPlayer: {
    type: Number,
    required: [true, "Please add number"],
  },
  price: {
    type: String,
    required: [true, "Please add price"],
  },
  passPhrase: {
    type: Array,
    required: [true, "Please add passPhrase"],
  },
  randomWord: {
    type: Array,
    required: [true, "Please add Wallet randomWord"],
  },
  twitterURL: {
    type: String,
    default: "",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: String,
    required: true
  },
  timeStart: {
    type: Number,
  },
  timeEnd: {
    type: Number,
  },
  sold: {
    type: Number,
    default: 0,
  },
  isCreating : {
    type:Boolean,
    default: false
  }
});

module.exports = mongoose.model("Game", GameSchema);
