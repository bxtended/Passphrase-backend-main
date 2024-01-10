const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const {authCheck} = require("../controllers/authController");

router.route("/checkPassPhrase/:id").post(gameController.checkPassPharse);
router.route("/").post(authCheck,gameController.create);
router.route("/admin").get(authCheck, gameController.adminGet);
router.route("/passPhrase/:id").get(gameController.getPassPhrase);
router.route("/").get(gameController.get);
router.route("/account/:account").get(gameController.getByAccount);
router.route("/:id").get(gameController.getOne);
router.route("/:id/setToken").post(gameController.setTokenAddress);
router.route("/:id").delete(gameController.remove);
router.route("/:id").put(gameController.update);
router.route("/image/:id/:tokenID").get(gameController.getImage);

module.exports = router;
