const express = require("express");
const userController = require("./controller");

const router = express.Router();

router.route("/").get(userController.getUsers);

module.exports = router;
