const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controllers");

router.get("/all", productController.getAllProducts);
router.post("/all", productController.getProductsByCategoryIds);
router.get("/all/:categoryId", productController.getProductsByCategoryId);
router.get("/:productId", productController.getProductById);


module.exports = router;
