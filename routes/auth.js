const express = require("express");
const router = express.Router();
const { authUser, getUser, getById } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

router.route("/user").get(auth, getUser); // gets User that have valid token saved in localStorage
router.route("/:id").get(getById); // log in
router.route("/").post(authUser); // log in
module.exports = router;