const express = require("express");
const {
  gameForUsers,
  gameWinners,
  claimReward,
  updateOrCreateUser,
  shouldBroadcast,
  userInfo,
} = require("../controllers/user-v2");
const routerUsersV2 = express.Router();

routerUsersV2.route("/").post(gameForUsers);
routerUsersV2.route("/user-info").post(userInfo);
routerUsersV2.route("/update").post(updateOrCreateUser);
routerUsersV2.route("/broadcast").post(shouldBroadcast);
routerUsersV2.route("/signature/:gameId").get(claimReward);
routerUsersV2.route("/:gameId").get(gameWinners);

module.exports = routerUsersV2;
