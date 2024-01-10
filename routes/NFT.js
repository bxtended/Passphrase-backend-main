const express = require("express");
const router = express.Router();
const NFTController = require("../controllers/NFTController");
const {authCheck} = require("../controllers/authController");

router.route("/").post(authCheck,NFTController.create);
router.route("/").get(NFTController.get);
router.route("/:id").put(authCheck,NFTController.update);
router.route("/:id").delete(authCheck,NFTController.delete);

module.exports = router;
