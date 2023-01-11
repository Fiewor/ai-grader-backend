import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { S3Client } from "@aws-sdk/client-s3";
const REGION = "us-east-1";
const uploadClient = new S3Client({
  region: REGION,
});

import { compileAndSave } from "../scripts/compileAndSave";
import { AnswerSheet, MarkSheet, Text } from "../models/textModel";

// @desc    Upload mark text
// @route   GET /api/uploads/mark
// @access  Public
export const uploadMark = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.json({ noFile: true });
    return;
  }

  const postData = await postHandler(req, "mark");
  if (postData != undefined) {
    res.send(
      postData["singleUploadResult"]["$metadata"].httpStatusCode === 200
        ? `Mark sheet(s) uploaded to ${postData["singleUploadResult"].Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData["params"].Key.substring(
      postData["params"].Key.lastIndexOf("/") + 1,
      postData["params"].Key.lastIndexOf(".")
    );
    compileAndSave(
      fileName,
      postData["singleUploadResult"].Location,
      MarkSheet
    );
  } else {
    console.log("An error occured while attempting to upload file");
  }
};

// @desc    Upload answer text
// @route   GET /api/uploads/answer
// @access  Public
export const uploadAnswer = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.json({ noFile: true });
    return;
  }

  const postData = await postHandler(req, "answer");
  if (postData) {
    res.send(
      postData["singleUploadResult"]["$metadata"].httpStatusCode === 200
        ? `answer sheet(s) uploaded to ${postData["singleUploadResult"].Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData["params"].Key.substring(
      postData["params"].Key.lastIndexOf("/") + 1,
      postData["params"].Key.lastIndexOf(".")
    );
    compileAndSave(
      fileName,
      postData["singleUploadResult"].Location,
      AnswerSheet
    );
  } else {
    //! TO-DO: return this so it can be res.send this to frontend
    console.log("An error occured while attempting to upload file");
  }
};

// @desc    Upload text
// @route   GET /api/uploads/text
// @access  Public
export const uploadText = async (req, res) => {
  if (req.files === null || req.files === undefined) {
    res.status(400);
    res.json({ noFile: true });
    throw new Error("Please input a file");
  }

  const postData = await postHandler(req, "text");
  if (postData) {
    res.send(
      postData["singleUploadResult"]["$metadata"].httpStatusCode === 200
        ? `text sheet(s) uploaded to ${postData["singleUploadResult"].Location}`
        : `An error occurred while uploading file(s)`
    );
    let fileName = postData["params"].Key.substring(
      postData["params"].Key.lastIndexOf("/") + 1,
      postData["params"].Key.lastIndexOf(".")
    );
    compileAndSave(fileName, postData["singleUploadResult"].Location, Text);
  } else {
    console.log("An error occured while attempting to upload file");
  }
};

const postHandler = async (
  req: { files: { [s: string]: any } | ArrayLike<any> },
  folder: string
): Promise<Upload | undefined> => {
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
