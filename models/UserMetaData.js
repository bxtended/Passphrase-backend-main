const mongoose = require("mongoose");

const UserMetaDataSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "Anonymous",
  },
  username: {
    type: String,
    default: "",
  },
  isDefault: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("UserMetaData", UserMetaDataSchema);
