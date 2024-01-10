const express = require("express");
const {
  getUserMetaData,
  updateUserMetaData,
  subscribeIfExist,
} = require("../controllers/userMetaData");
const routerUserMetaData = express.Router();

routerUserMetaData.route("/subscribe").post(subscribeIfExist);
routerUserMetaData.route("/").post(updateUserMetaData);
routerUserMetaData.route("/").get(getUserMetaData);

module.exports = routerUserMetaData;
