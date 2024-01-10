const express = require("express");
const { isOperator } = require("../controllers/auth-v2");
const routerAuthV2 = express.Router();

routerAuthV2.route("/").get(isOperator);

module.exports = routerAuthV2;
