const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  id: {
    type: String,
    default: "0",
  },
  words: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Word_v2", WordSchema);
