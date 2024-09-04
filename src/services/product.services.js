const { StatusCodes: status } = require("http-status-codes");
const productRepo = require("../repositories/product.repositories");

class ProductService {
    static async getProducts() {
        const res = await productRepo.findAll();
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                products: null,
                message: "server error",
            };
        }
        return {
            status: status.OK,
            products: res.products,
            message: "ok",
        };
    }

    static async getProductsByCategoryId(categoryId) {
        const res = await productRepo.findProductsByCategoryId(categoryId);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                products: null,
                message: "server error",
            };
        }
        return {
            status: status.OK,
            products: res.products,
            message: "ok",
        };
    }

    static async getProductsByCategoryIds(categoryIds) {
        const res = await productRepo.findProductsByCategoryIds(categoryIds);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                products: null,
                message: "server error",
            };
        }
        return {
            status: status.OK,
            products: res.products,
            message: "ok",
        };
    }

    static async getProductById({ productId }) {
        const res = await productRepo.findProductById(productId);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                product: null,
                message: "server error",
            };
        }
        if (res.product != null) {
            return {
                status: status.OK,
                product: res.product,
                message: "ok",
            };
        }
        return {
            status: status.NOT_FOUND,
            product: null,
            message: "product not found",
        };
    }
    static async createProduct({ name, price, stock, images, categories }) {
        const res = await productRepo.createProduct({name, price, stock, images, categories});
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                productId: null,
                message: "server error",
            };
        }
        return {
            status: status.CREATED,
            productId: res.productId,
            message: "product created successfully",
        };
    }
    static async updateProduct(productId, updatedData) {
        const res = await productRepo.updateProduct(productId, updatedData);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                productId: null,
                message: "server error",
            };
        }

        if (res.product != null) {
            return {
                status: status.OK,
                productId: res.product,
                message: "product updated successfully",
            };
        }

        // Product not found
        return {
            status: status.NOT_FOUND,
            productId: null,
            message: "Product not found",
        };
    }
    static async softDeleteProduct(productId) {
        const res = await productRepo.softDeleteProduct(productId);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                product: null,
                message: "server error",
            };
        }

        if (res.product != null) {
            return {
                status: status.OK,
                product: res.product,
                message: "Product has been soft deleted",
            };
        }

        // Product not found
        return {
            status: status.NOT_FOUND,
            product: null,
            message: "Product not found",
        };
    }

    static async updateProductPrice(productId, newPrice) {
        const res = await productRepo.updateProductPrice(productId, newPrice);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                message: "server error",
            };
        }

        return {
            status: status.OK,
            message: "ok",
        };

    }

    static async updateProductStock(productId, newStock) {
        const res = await productRepo.updateProductStock(productId, newStock);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                message: "server error",
            };
        }

        return {
            status: status.OK,
            message: "ok",
        };

    }

    static async updateProductImages(productId, uploadImages, deleteImages) {
        const res = await productRepo.updateProductImages(productId, uploadImages, deleteImages);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                message: "server error",
            }
        }

        return {
            status: status.OK,
            message: "ok",
        }
    }
}

module.exports = ProductService;
