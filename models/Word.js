const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  a: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Word", WordSchema);
