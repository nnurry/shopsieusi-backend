const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controllers");

router.get("/all", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);

module.exports = router;