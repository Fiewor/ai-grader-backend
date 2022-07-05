"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ["*"]);
  next();
});

app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}
const uploadRoute = (section) => {
  app.post(`/uploads/${section}/`, async (req, res) => {
    if (req.files === null || req.files === undefined) {
      res.json({ noFile: true });
      return;
    }

    const postData = await postHandler(req, section);
    if (postData) {
      res.send(
        postData.singleUploadResult["$metadata"].httpStatusCode === 200
          ? `${section} sheet(s) uploaded to ${postData.singleUploadResult.Location}`
          : `An error occurred while uploading file(s)`
      );
      let fileName = postData.params.Key.substring(
        postData.params.Key.lastIndexOf("/") + 1,
        postData.params.Key.lastIndexOf(".")
      );
      compileAndSave(
        fileName,
        postData.singleUploadResult.Location,
        `${section}Sheet`
      );
    } else {
      console.log("An error occured while attempting to upload file");
    }
  });
};

uploadRoute("mark");
uploadRoute("answer");
uploadRoute("text");

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
      console.log("got to answerDoc");
      if (markDoc) {
        console.log("got to markDoc");
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
      console.log("Couldn't find answer document in database");
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
});

app.get(`/texts`, async (req, res) => {
  try {
    await client.connect();
    console.log("Connected successfully to database");
    // extract all documents from DB
    const cursor = client.db("textExtract").collection("answerSheet").find();
    const count = await cursor.count();
    const doc = await cursor.toArray();

    count === 0 ? res.send(["Empty"]) : res.send(doc);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
});

app.get(`/texts/:id`, async (req, res) => {
  let { id } = req.params;
  try {
    await client.connect();
    console.log("Connected successfully to database");
    // extract specific documents from DB
    const cursor = client
      .db("textExtract")
      .collection("answerSheet")
      .find({ _id: new ObjectId(id) });

    const count = await cursor.count();
    const doc = await cursor.toArray();

    count === 0
      ? res.send({
          page: {
            _id: "nu113mpty",
            fileName: "empty",
            rawText: ["No text in collection"],
            textByNumber: ["No", "text", "in", "collection"],
          },
        })
      : res.send(doc);
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
