const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema({
    investor: {
      type: String,
      required: [true, "Please add investor"],
    },
    game: {
      type: String,
      required: [true, "Please add game"],
    },
    gold: {
      type: Number,
      default: 0
    },
    silver: {
        type: Number,
        default: 0
      },
    bronze: {
        type: Number,
        default: 0
      },
  });
  
  
  module.exports = mongoose.model("Investor", InvestorSchema);