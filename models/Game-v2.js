const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  creatorAddress: {
    type: String,
  },
  gameId: {
    type: String,
    required: true,
  },
  passPhrase: {
    type: String,
    required: [true, "Please add passPhrase"],
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  timeStart: {
    type: Date,
    default: Date.now(),
  },
  timeEnd: {
    type: Date,
    default: Date.now(),
  },
  hasInformedEveryone: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Game_v2", GameSchema);
