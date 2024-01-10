const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  player: {
    type: String,
    required: [true, "Please add player"],
  },
  game: {
    type: String,
    required: [true, "Please add game"],
  },
  ranking: {
    type: Number,
    required: [true, "Please add ranking"],
  },
  value: {
    type: Number,
    required: [true, "Please add value"],
  },
  total: {
    type: Number,
    required: [true, "Please add total"],
    default: 0
  },
  timeComplete: {
    type: Number,
    required: [true, "Please add end time"],
  },
  withdraw: {
    type: Boolean,
    required: [true, "Please add withdraw"],
    default: false
  },
});


module.exports = mongoose.model("Result", ResultSchema);