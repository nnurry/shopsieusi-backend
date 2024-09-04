const categoryRepo = require("../repositories/category.repositories");
const { StatusCodes: status } = require("http-status-codes");
class CategoryService {
    static async getCategories() {
        const res = await categoryRepo.findAll();
        if (res.err != null) {
            // abnormal error
            return {
                status: status.INTERNAL_SERVER_ERROR,
                categories: null,
                message: "server error",
            }
        }
        return {
            status: status.OK,
            categories: res.categories,
            message: "ok",
        }
    }
    static async getCategoryById({ categoryId }) {
        const res = await categoryRepo.findCategoryById(categoryId);
        if (res.err != null) {
            // abnormal error
            return {
                status: status.INTERNAL_SERVER_ERROR,
                category: null,
                message: "server error",
            }
        }
        if (res.category != null) {
            return {
                status: status.OK,
                category: res.category,
                message: "ok",
            }
        }
        // category not found (normal behavior)
        return {
            status: status.NOT_FOUND,
            category: null,
            message: "category not found",
        }
    }
}

module.exports = CategoryService;