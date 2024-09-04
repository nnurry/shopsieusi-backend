const express = require("express");
const { checkSession } = require("../middlewares/auth.middlewares");
const userController = require("../controllers/user.controllers");
const productController = require("../controllers/product.controllers");
const { s3ImageService } = require("../services/image.services");

const userRouter = express.Router();
const productRouter = express.Router();

userRouter.use(checkSession);
productRouter.use(checkSession);

// currently allow all routes for development
userRouter.post(
    "/create", 
    userController.adminCreateUser,
);
userRouter.get(
    "/roles", 
    userController.getRoles,
);
userRouter.get(
    "/all", 
    userController.getAllUsers,
);
userRouter.delete(
    "/delete/:userId",
    userController.softDeleteUser,
)
userRouter.post(
    "/password/:userId",
    userController.changeUserPassword,
)

productRouter.post(
    "/add",
    s3ImageService.uploadFile.array("productImages[]"),
    productController.addProduct,
);
productRouter.put(
    "/update/:productId",
    productController.updateProduct,
);
productRouter.delete(
    "/delete/:productId", 
    productController.deleteProduct,
);

productRouter.put(
    "/price/:productId", 
    productController.updateProductPrice,
);

productRouter.put(
    "/stock/:productId", 
    productController.updateProductStock,
);

productRouter.put(
    "/images/:productId",
    s3ImageService.uploadFile.array("uploadProductImages[]"),
    productController.updateProductImages,
);

const router = express.Router();

router.use("/user", userRouter);
router.use("/product", productRouter);

module.exports = router;