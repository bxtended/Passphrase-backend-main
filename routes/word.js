const express = require("express");
const router = express.Router();
const wordController = require("../controllers/wordController");
const {authCheck} = require("../controllers/authController");

router.route("/").get(wordController.get);
// router.route("/:id").put(updateBalance);
// router.route("/email/:id").put(updateEmail);

module.exports = router;
