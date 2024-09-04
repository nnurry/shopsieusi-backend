const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");

// for the time being, this is not splitted into a middleware
// i'll manually ping this
router.get("/", userController.checkSession);
router.post("/login", userController.login);
router.all("/logout", userController.logout);
router.post("/signup", userController.signup);

module.exports = router;