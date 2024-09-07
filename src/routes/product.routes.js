const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controllers");
const productControllerV2 = require("../controllers/product.v2.controllers");

router.get("/all", productController.getAllProducts);
router.post("/all", productController.getProductsByCategoryIds);
router.get("/all/:categoryId", productController.getProductsByCategoryId);
router.get("/:productId", productControllerV2.getProductById);


module.exports = router;
