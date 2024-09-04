const { StatusCodes: status } = require("http-status-codes");
const { s3ImageService } = require("../services/image.services");

class ImageController {
    // we use S3 now, so i'll hardcode for S3
    static async uploadImage(req, res) {
        const file = req.file;
        if (!file?.originalname || !file.buffer) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                url: null,
                message: "invalid body",
            })
        }
        const uploadResult = await s3ImageService.uploadImage(file.originalname, file.buffer);
        return res.status(uploadResult.status).json(uploadResult);
    }
    static async deleteImage(req, res) {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                message: "invalid body",
            })
        }
        const deleteResult = await s3ImageService.deleteImage(fileName, false);
        return res.status(deleteResult.status).json(deleteResult);
    }
}


module.exports = ImageController;