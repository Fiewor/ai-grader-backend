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

app.post(`/uploads/mark/`, async (req, res) => {
  if (req.files === null || undefined) {
    res.json({ noFile: true });
    return;
  }

  fs.access(`./uploads/mark`, async (error) => {
    if (error) {
      await createFolder();
      uploadAndProcess(req, res, "mark");
    } else {
      fs.access(`./uploads/answer`, async (error) => {
        if (error) {
          await createFolder();
          uploadAndProcess(req, res, "mark");
        } else {
          console.log(`Accessed uploads directory`);
          uploadAndProcess(req, res, "mark");
        }
      });
    }
  });
});

app.post(`/uploads/answer/`, async (req, res) => {
  if (req.files === null || undefined) {
    res.json({ noFile: true });
    return;
  }

  fs.access(`./uploads/answer`, async (error) => {
    if (error) {
      await createFolder();
      uploadAndProcess(req, res, "answer");
    } else {
      fs.access(`./uploads/mark`, async (error) => {
        if (error) {
          await createFolder();
          uploadAndProcess(req, res, "answer");
        } else {
          console.log(`Accessed uploads directory`);
          uploadAndProcess(req, res, "answer");
        }
      });
    }
  });
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
    const { totalScore, totalPointsAwardable } = await grader(
      answerDoc,
      markDoc
    );
    // console.log("gradeForPage", gradeForPage);
    res.send({
      grade: totalScore,
      totalPoints: totalPointsAwardable,
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

const createFolder = async () => {
  console.log(`Unable to access mark sub-directory`);
  console.log(`Creating...`);
  await fsPromises.mkdir(`./uploads/mark`, { recursive: true }, (error) =>
    error
      ? console.log(error)
      : console.log(
          "Necessary directory and sub-directories created successfully"
        )
  );
  console.log(`Unable to access answer sub-directory`);
  console.log(`Creating...`);
  await fsPromises.mkdir(`./uploads/answer`, { recursive: true }, (error) =>
    error
      ? console.log(error)
      : console.log(
          "Necessary directory and sub-directories created successfully"
        )
  );
};

const uploadAndProcess = async (req, res, folder) => {
  try {
    res.write(
      !postHandler(req, folder)
        ? "Some answer sheets were not uploaded. Check local directory"
        : "Answer Sheet(s) uploaded to local directory"
    );
    const compilingAndSaving = await compileAndSave(
      `${__dirname}\\uploads\\${folder}`,
      `answerSheet`
    );
    res.write(
      !compilingAndSaving
        ? "\nSaving in database..."
        : "Document saved in database!"
    );
    res.end();
  } catch (err) {
    console.log(err);
  }
};

const postHandler = (req, folder) => {
  let successArray = [];

  for (let file of Object.values(req.files)) {
    let pathToFile = `${__dirname}/uploads/${folder}/${file.name}`;

    file.mv(pathToFile, (err) => {
      if (err) return console.error(err);
      successArray.push(`success`);
    });
  }

  return successArray.every((val) => val === `success`);
};
