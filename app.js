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
  app.use(express.static(path.join(__dirname, "../ai-grader/build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../ai-grader/", "build", "index.html"));
  });
}

app.post(`/uploads/mark/`, (req, res) => {
  // if there's no upload folder, create one
  fs.access(`./uploads/mark`, (error) => {
    if (error) {
      fsPromises.mkdir(`./uploads/mark`, { recursive: true }, (error) =>
        error
          ? console.log(error)
          : console.log(
              "Necessary directory and sub-directories created successfully"
            )
      );
      fsPromises.mkdir(`./uploads/answer`, { recursive: true }, (error) =>
        error
          ? console.log(error)
          : console.log(
              "Necessary directory and sub-directories created successfully"
            )
      );
    }
  });
  if (req.files === null || undefined) {
    res.json({ noFile: true });
    return;
  }
  postHandler(req, "mark");
  res.send(
    `mark sheet(s) uploaded successfully! Check mark folder in the project's uploads directory`
  );
  compileAndSave(`${__dirname}\\uploads\\mark`, `markSheet`);
});

app.post(`/uploads/answer/`, (req, res) => {
  fs.access(`./uploads/mark`, (error) => {
    if (error) {
      fsPromises.mkdir(`./uploads/mark`, { recursive: true }, (error) =>
        error
          ? console.log(error)
          : console.log(
              "Necessary directory and sub-directories created successfully"
            )
      );
      fsPromises.mkdir(`./uploads/answer`, { recursive: true }, (error) =>
        error
          ? console.log(error)
          : console.log(
              "Necessary directory and sub-directories created successfully"
            )
      );
    }
  });
  if (req.files === null || undefined) {
    res.json({ noFile: true });
    return;
  }

  postHandler(req, "answer");
  res.send(
    `answer sheet(s) uploaded successfully! Check answer folder in the project's uploads directory`
  );
  compileAndSave(`${__dirname}\\uploads\\answer`, `answerSheet`);
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
    console.log("answerDoc", answerDoc);
    const gradeForPage = await grader(answerDoc, markDoc);
    console.log("gradeForPage", gradeForPage);
    res.send({
      grade: gradeForPage.totalScore,
      totalPoints: gradeForPage.totalPointsAwardable,
    });
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
    let pathToFile = `${__dirname}/uploads/${folder}/` + file.name;

    file.mv(pathToFile, (err) => {
      if (err) {
        console.log("and error is ", err);
      }
    });
  }
};
