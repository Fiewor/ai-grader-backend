const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require("stream");
const { S3Client } = require("@aws-sdk/client-s3");
const REGION = "us-east-1";
const uploadClient = new S3Client({
  region: REGION,
});

const { compileAndSave } = require("../scripts/compileAndSave");
const { AnswerSheet, MarkSheet, Text } = require("../models/textModel");

// @desc    Upload mark text
// @route   GET /api/uploads/mark
// @access  Public

const uploadMark = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.json({ noFile: true });
    return;
  }

  const postData = await postHandler(req, "mark");
  if (postData) {
    res.send(
      postData.singleUploadResult["$metadata"].httpStatusCode === 200
        ? `Mark sheet(s) uploaded to ${postData.singleUploadResult.Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData.params.Key.substring(
      postData.params.Key.lastIndexOf("/") + 1,
      postData.params.Key.lastIndexOf(".")
    );
    compileAndSave(fileName, postData.singleUploadResult.Location, MarkSheet);
  } else {
    console.log("An error occured while attempting to upload file");
  }
};

// @desc    Upload answer text
// @route   GET /api/uploads/answer
// @access  Public

const uploadAnswer = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.json({ noFile: true });
    return;
  }

  const postData = await postHandler(req, "answer");
  if (postData) {
    res.send(
      postData.singleUploadResult["$metadata"].httpStatusCode === 200
        ? `answer sheet(s) uploaded to ${postData.singleUploadResult.Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData.params.Key.substring(
      postData.params.Key.lastIndexOf("/") + 1,
      postData.params.Key.lastIndexOf(".")
    );
    compileAndSave(fileName, postData.singleUploadResult.Location, AnswerSheet);
  } else {
    console.log("An error occured while attempting to upload file");
  }
};

// @desc    Upload text
// @route   GET /api/uploads/text
// @access  Public

const uploadText = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.status(400);
    res.json({ noFile: true });
    throw new Error("Please input a file");
  }

  const postData = await postHandler(req, "text");
  if (postData) {
    res.send(
      postData.singleUploadResult["$metadata"].httpStatusCode === 200
        ? `text sheet(s) uploaded to ${postData.singleUploadResult.Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData.params.Key.substring(
      postData.params.Key.lastIndexOf("/") + 1,
      postData.params.Key.lastIndexOf(".")
    );
    compileAndSave(fileName, postData.singleUploadResult.Location, Text);
  } else {
    console.log("An error occured while attempting to upload file");
  }
};

const postHandler = async (req, folder) => {
  for (let file of Object.values(req.files)) {
    let fileStream = Readable.from(file.data);

    const bucketParams = {
      Bucket: "ai-grader",
      Key: `${folder}/${file.name}`,
      Body: fileStream,
    };

    const upload = new Upload({
      params: bucketParams,
      client: uploadClient,
      queueSize: 3,
    });

    try {
      const data = upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });

      await upload.done();
      return data; // For unit tests.
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = {
  uploadMark,
  uploadAnswer,
  uploadText,
};
