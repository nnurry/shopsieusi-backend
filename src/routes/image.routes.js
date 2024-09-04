const express = require('express');
const { s3ImageService } = require('../services/image.services');
const imageController = require('../controllers/image.controllers');
const { checkSession } = require('../controllers/user.controllers');

const router = express.Router();

router.use(checkSession);
router.post('/upload', s3ImageService.uploadFile.single("file"), imageController.uploadImage);
router.post('/delete', imageController.deleteImage);

module.exports = router;
