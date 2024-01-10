const express = require("express");
const router = express.Router();
const  keyController = require("../controllers/keyController");
const {authCheck} = require("../controllers/authController");

router.route("/").post(keyController.create);
router.route("/:id").put(keyController.update);
router.route("/game/:idGame").get(keyController.getByGame);
router.route("/:id").delete(authCheck,keyController.remove);

module.exports = router;