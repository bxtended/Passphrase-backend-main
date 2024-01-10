const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  walletAddress: {
    type: String,
    required: [true, "Please add Wallet Address"],
  },
  lastBestGuessTimestamp: {
    type: Number,
    default: 0,
  },
  lastNoOfCorrectSeedsOrInOrderTimestamp: {
    type: Number,
    default: 0,
  },
  noOfCorrectSeedsInOrder: {
    type: Number,
    default: 0,
  },
  noOfCorrectSeeds: {
    type: Number,
    default: 0,
  },
  joinedDate: {
    type: Date,
    default: Date.now(),
  },
  lastTriedTimestamp: {
    type: Number,
    default: 0,
  },
  noOfTries: {
    type: Number,
    default: 0,
  },
  bestGuess: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  reward: {
    type: String,
    default: "0",
  },
  claim: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User_v2", UserSchema);

// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true,
//   },
//   gameId: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     default: "",
//   },
//   username: {
//     type: String,
//     default: "",
//   },
//   walletAddress: {
//     type: String,
//     required: [true, "Please add Wallet Address"],
//   },
//   lastBestGuessTimestamp: {
//     type: Date,
//     default: Date.now(),
//   },
//   lastNoOfCorrectSeedsOrInOrderTimestamp: {
//     type: Date,
//     default: Date.now(),
//   },
//   noOfCorrectSeedsInOrder: {
//     type: Number,
//     default: 0,
//   },
//   noOfCorrectSeeds: {
//     type: Number,
//     default: 0,
//   },
//   joinedDate: {
//     type: Date,
//     default: Date.now(),
//   },
//   lastTriedTimestamp: {
//     type: Date,
//     default: Date.now(),
//   },
//   noOfTries: {
//     type: Number,
//     default: 0,
//   },
//   bestGuess: {
//     type: Number,
//     default: 0,
//   },
//   rank: {
//     type: Number,
//     default: 0,
//   },
//   reward: {
//     type: String,
//     default: "0",
//   },
//   claim: {
//     type: String,
//     default: "",
//   },
// });

// module.exports = mongoose.model("User_v2", UserSchema);
