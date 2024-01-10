const express = require("express");
const router = express.Router();
const investorController = require("../controllers/investorController");
const { authCheck } = require("../controllers/authController");

router.route("/:game/:address").get(investorController.getByGameAndAddress);
router.route("/").post(investorController.create);
router.route("/:id").put(investorController.update);
router.route("/game/:idGame").get(investorController.getByGame);
router.route("/:id").delete(authCheck, investorController.remove);

module.exports = router;