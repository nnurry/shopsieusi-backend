const categoryService = require("../services/category.services");

class CategoryController {
    static async getAllCategories(req, res) {
        const categoriesResult = await categoryService.getCategories();
        return res.status(categoriesResult.status).json(categoriesResult);
    }
    static async getCategoryById(req, res) {
        const categoryId = req.params.categoryId;
        const categoryResult = await categoryService.getCategoryById({ categoryId: categoryId });
        return res.status(categoryResult.status).json(categoryResult);
    }
}

module.exports = CategoryController;