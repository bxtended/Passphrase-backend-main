const mongoose = require("mongoose");

const KeySchema = new mongoose.Schema({
  game: {
    type: String,
    required: [true, "Please add game"],
  },
  gold: {
    type: Number,
    default: 750,
  },
  silver: {
    type: Number,
    default: 1250,
  },
  bronze: {
    type: Number,
    default: 2000,
  },
});

module.exports = mongoose.model("Key", KeySchema);
