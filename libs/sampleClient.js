const { S3Client } = require("@aws-sdk/client-s3");
const REGION = "us-east-1";
const uploadClient = new S3Client({ region: REGION });
module.exports = s3Client;
