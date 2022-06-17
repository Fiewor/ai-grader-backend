"use strict";

const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  process.env.NODE_ENV === "production"
    ? `mongodb+srv://john:${process.env.MONGODB_ATLAS_KEY}@grader.pxgmt.mongodb.net/test?retryWrites=true&w=majority`
    : `mongodb://localhost:27017`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require("stream");

const REGION = "us-east-1";
const uploadClient = new S3Client({
  region: REGION,
});

const port = process.env.PORT || 3001;
require("dotenv").config();
const grader = require("./scripts/grading");
const { compileAndSave } = require("./scripts/compileAndSave");

app.use(fileUpload());

app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.post(`/uploads/mark/`, async (req, res) => {
  if (req.files === null || undefined) {
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
    compileAndSave(postData.singleUploadResult.Location, `markSheet`);
  } else {
    console.log("An error occured while attempting to upload file");
  }
});

app.post(`/uploads/answer/`, async (req, res) => {
  if (req.files === null || undefined) {
    res.json({ noFile: true });
    return;
  }

  const postData = await postHandler(req, "answer");
  if (postData) {
    res.send(
      postData.singleUploadResult["$metadata"].httpStatusCode === 200
        ? `Answer sheet(s) uploaded to ${postData.singleUploadResult.Location}`
        : `An error occurred while uploading file(s)`
    );
    compileAndSave(postData.singleUploadResult.Location, `answerSheet`);
  } else {
    console.log("An error occured while attempting to upload file");
  }
});

app.get("/viewGrade", async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to database");
    // get page from db - later, filter by page id
    const answerCol = client.db("textExtract").collection("answerSheet");
    const markCol = client.db("textExtract").collection("markSheet");

    const answerDoc = await answerCol.findOne();
    const markDoc = await markCol.findOne();

    if (answerDoc) {
      console.log("got to answerDoc", answerDoc);
      if (markDoc) {
        console.log("got to markDoc", markDoc);
        const gradeForPage = await grader(answerDoc, markDoc);
        const {
          arr,
          totalScore: score,
          totalPointsAwardable: total,
        } = gradeForPage;
        res.send({
          arr,
          grade: score,
          totalPoints: total,
        });
      } else {
        ("Couldn't find mark document in database");
      }
    } else {
      console.log("Couldn't answer document in database");
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
});

app.get(`/viewText`, async (req, res) => {
  try {
    await client.connect();
    console.log("Connected successfully to database");
    const answerDoc = await client
      .db("textExtract")
      .collection("answerSheet")
      .findOne();

    res.send(answerDoc);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
});

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
