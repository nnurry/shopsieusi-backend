const { checkPresenceObject } = require("../helpers/utils");
const { StatusCodes: status } = require("http-status-codes");
const { s3ImageService } = require("../services/image.services");
const productService = require("../services/product.services");
const { v4: uuid } = require("uuid");

class ProductController {
    static async getAllProducts(req, res) {
        const productsResult = await productService.getProducts();
        return res.status(productsResult.status).json(productsResult);
    }

    static async getProductsByCategoryId(req, res) {
        const categoryId = req.params.categoryId;
        const productsResult = await productService.getProductsByCategoryId(categoryId);
        return res.status(productsResult.status).json(productsResult);
    }

    static async getProductsByCategoryIds(req, res) {
        const { categoryIds } = req.body;
        const productsResult = await productService.getProductsByCategoryIds(categoryIds);
        return res.status(productsResult.status).json(productsResult);
    }

    static async getProductById(req, res) {
        const productId = req.params.productId;
        const productResult = await productService.getProductById({ productId });
        return res.status(productResult.status).json(productResult);
    }
    static async addProduct(req, res) {
        const productBody = req.body;
        if (!req?.files) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                productId: null,
                message: "invalid body",
            })
        }
        const validatedBody = checkPresenceObject(
            productBody,
            ["categoryIds", "hostingTypes", "imageTypes", "name", "price", "stock"],
        );
        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                productId: null,
                message: "invalid body",
            })
        }
        const productImages = req.files.filter(file => file.fieldname === "productImages[]");
        const { categoryIds, hostingTypes, imageTypes } = productBody;
        const imageField = [];
        const categoryField = categoryIds.map(categoryId => {
            return { categoryId }
        });

        for (let idx = 0; idx < productImages.length; idx++) {
            const productImage = productImages[idx];
            const imgNameSpl = productImage.originalname.split(".");
            const imgExt = imgNameSpl[imgNameSpl.length - 1];
            const ts = new Date().getTime();
            const imgName = `images/${ts}-${uuid()}.${imgExt}`;
            const uploadResult = await s3ImageService.uploadImage(imgName, productImage.buffer);

            if (uploadResult.status != status.CREATED) {
                return res.status(uploadResult.status).json({
                    status: uploadResult.status,
                    productId: null,
                    message: uploadResult.message,
                });
            }

            imageField.push({
                imageKey: uploadResult.key,
                imageUrl: uploadResult.url,
                hostingType: hostingTypes[idx],
                imageType: imageTypes[idx],
            })
        }

        const productPayload = {
            name: validatedBody.name,
            price: validatedBody.price,
            stock: validatedBody.stock,
            images: imageField,
            categories: categoryField,
        };

        const createResult = await productService.createProduct({ ...productPayload });
        return res.status(createResult.status).json(createResult);
    }

    static async updateProduct(req, res) {
        const productId = req.params.productId;
        const validatedBody = checkPresenceObject(
            req.body,
            ["name", "price", "stock", "images", "categories"]
        );
        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                user: null,
                message: "invalid body",
            })
        }

        const productResult = await productService.updateProduct(productId, validatedBody);
        return res.status(productResult.status).json(productResult);
    }
    static async deleteProduct(req, res) {
        const productId = req.params.productId;

        const productResult = await productService.softDeleteProduct(productId);
        return res.status(productResult.status).json(productResult);
    }

    static async updateProductPrice(req, res) {
        const { newPrice } = req.body;
        const productId = req.params.productId;
        const updateResult = await productService.updateProductPrice(
            productId,
            newPrice,
        );
        return res.status(updateResult.status).json(updateResult);
    }

    static async updateProductStock(req, res) {
        const { newStock } = req.body;
        const productId = req.params.productId;
        const updateResult = await productService.updateProductStock(
            productId,
            newStock,
        );
        return res.status(updateResult.status).json(updateResult);
    }

    static async updateProductImages(req, res) {
        const uploadProductImages = req.files.filter(file => file.fieldname === "uploadProductImages[]");
        const { uploadHostingTypes, uploadImageTypes } = req.body;
        const { deleteImageIds, deleteImageKeys } = req.body;
        const productId = req.params.productId;

        const uploadImages = [];
        const deleteImages = [];

        for (let idx = 0; idx < uploadProductImages.length; idx++) {
            const productImage = uploadProductImages[idx];
            const imgNameSpl = productImage.originalname.split(".");
            const imgExt = imgNameSpl[imgNameSpl.length - 1];
            const ts = new Date().getTime();
            const imgName = `images/${ts}-${uuid()}.${imgExt}`;
            const uploadResult = await s3ImageService.uploadImage(imgName, productImage.buffer);

            if (uploadResult.status != status.CREATED) {
                return res.status(uploadResult.status).json({
                    status: uploadResult.status,
                    productId: null,
                    message: uploadResult.message,
                });
            }

            uploadImages.push({
                imageKey: uploadResult.key,
                imageUrl: uploadResult.url,
                hostingType: uploadHostingTypes[idx],
                imageType: uploadImageTypes[idx],
            })
        }

        for (let idx = 0; idx < deleteImageKeys.length; idx++) {
            const deleteResult = await s3ImageService.deleteImage(deleteImageKeys[idx], false);

            if (deleteResult.status != status.OK) {
                return res.status(deleteResult.status).json(deleteResult);
            }

            deleteImages.push({
                imageId: deleteImageIds[idx],
            });
        }

        const updateResult = await productService.updateProductImages(productId, uploadImages, deleteImages);
        return res.status(updateResult.status).json(updateResult);
    }
}

module.exports = ProductController;
