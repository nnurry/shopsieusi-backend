const express = require("express");
const router = express.Router();
const debugController = require("../controllers/debug.controllers");

router.get("/conn", debugController.checkConnection);

module.exports = router;