const mongoose = require("mongoose");

const NFTSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add price"],
  },
  image: {
    type: String,
    required: [true, "Please add image"]
  },
  price: {
    type: Number,
    required: [true, "Please add price"]
  },
  status: {
    type: String,
    default: "",
  },
  player: {
    type: String,
    default: "",
  },
  user: {
    type: String,
    required: [true, "Please add userID"]
  }
});

module.exports = mongoose.model("NFT", NFTSchema);
