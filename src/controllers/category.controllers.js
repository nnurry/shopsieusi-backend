const categoryService = require("../services/category.services");
const { v4: uuid } = require("uuid");
const { StatusCodes: status } = require("http-status-codes");
const { checkPresenceObject } = require("../helpers/utils");
const { s3ImageService } = require("../services/image.services");
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
    static async addCategory(req, res) {
        const categoryBody = req.body;
        if (!req?.files) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                categoryId: null,
                message: "invalid body",
            })
        }
        const validatedBody = checkPresenceObject(
            categoryBody,
            ["hostingTypes", "name"],
        );
        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                productId: null,
                message: "invalid body",
            })
        }
        const categoryImages = req.files.filter(file => file.fieldname === "categoryImages[]");
        const { hostingTypes } = categoryBody;
        const imageField = [];

        for (let idx = 0; idx < categoryImages.length; idx++) {
            const categoryImage = categoryImages[idx];
            const imgNameSpl = categoryImage.originalname.split(".");
            const imgExt = imgNameSpl[imgNameSpl.length - 1];
            const ts = new Date().getTime();
            const imgName = `categories/${ts}-${uuid()}.${imgExt}`;
            const uploadResult = await s3ImageService.uploadImage(imgName, categoryImage.buffer);

            if (uploadResult.status != status.CREATED) {
                return res.status(uploadResult.status).json({
                    status: uploadResult.status,
                    categoryId: null,
                    message: uploadResult.message,
                });
            }

            imageField.push({
                imageKey: uploadResult.key,
                imageUrl: uploadResult.url,
                hostingType: hostingTypes[idx],
            })
        }

        const categoryPayload = {
            name: validatedBody.name,
            images: imageField,
        };

        const createResult = await categoryService.createCategory({ ...categoryPayload });
        return res.status(createResult.status).json(createResult);
    }
}

module.exports = CategoryController;