const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { authCheck } = require("../controllers/authController");

router.route("/game/:idGame").get(resultController.getByGame);
router.route("/player/:player").get(resultController.getSignature);
router.route("/").post(resultController.create);
router.route("/player/:player").put(resultController.updateByPlayer);
router.route("/:id").delete(authCheck, resultController.remove);

module.exports = router;