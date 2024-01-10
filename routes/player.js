const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const {authCheck} = require("../controllers/authController");

router.route("/").post(playerController.update);
router.route("/:id").put(playerController.updatePlayer)
router.route("/getByGame/:wallet").get(playerController.getByGame);
router.route("/check_player").get(playerController.checkPlayer);
router.route("/all/").get(playerController.getAll);
router.route("/:tokenId/:gameId").get(playerController.getOne);
router.route("/").get(playerController.get);
router.route("/sendmail").post(playerController.sendMail);
router.route("/generatorplayers").post(playerController.generatorplayers);


// router.route("/:id").put(updateBalance);
// router.route("/email/:id").put(updateEmail);

module.exports = router;
