const multer = require('multer');
const config = require("../configs/configs");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { StatusCodes: status } = require('http-status-codes');

class S3ImageService {
  constructor() {
    this.s3ClientConfig = {
      region: config.app.awsConfig.regionName,
      credentials: {
        accessKeyId: config.app.awsConfig.accessKey,
        secretAccessKey: config.app.awsConfig.secretKey,
      },
    };
    this.s3Client = new S3Client(this.s3ClientConfig);
    this.bucketName = config.app.s3Config.bucketName;
    this.pathPrefix = config.app.s3Config.pathPrefix;
    this.uploadFile = multer();
  }

  async uploadImage(fileName, fileContent) {
    const updatedFileName = `${this.pathPrefix}${fileName}`;
    try {
      const params = {
        Bucket: this.bucketName,
        Key: updatedFileName,
        Body: fileContent,
      };
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      console.log("file uploaded successfully");
      return {
        status: status.CREATED,
        key: updatedFileName,
        url: `https://${this.bucketName}.s3.${this.s3ClientConfig.region}.amazonaws.com/${updatedFileName}`,
        message: "ok",
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        status: status.INTERNAL_SERVER_ERROR,
        key: null,
        url: null,
        message: "server error",
      }
    }
  }
  async deleteImage(fileName, includePrefix) {
    if (includePrefix) {
      fileName = `${this.pathPrefix}${fileName}`;
    }
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };

      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
      console.log('file deleted successfully');
      return {
        status: status.OK,
        message: "ok",
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        status: status.INTERNAL_SERVER_ERROR,
        message: "server error",
      }
    }
  }
  async replaceImage() { }
}

const s3ImageService = new S3ImageService();

module.exports = { s3ImageService };
