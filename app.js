"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const fileUpload = require("express-fileupload");

require("dotenv").config();

const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const createReadStream = fs.createReadStream;
const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const key = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

const text_key = process.env.TEXT_KEY;
const text_endpoint = process.env.TEXT_ENDPOINT;

const textAnalyticsClient = new TextAnalyticsClient(
  text_endpoint,
  new AzureKeyCredential(text_key)
);

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
// using Mongo Atlas
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://john:${process.env.MONGODB_ATLAS_KEY}@grader.pxgmt.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const { google } = require("googleapis");
const sheets = google.sheets("v4");
const cors = require("cors");
const dbName = "textExtract";

app.use(fileUpload());
app.use(cors());

app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

let textArray = [],
  markKeyPhrase,
  completeText,
  answerKeyPhrase,
  extracted = [];

app.post(`/uploads/answer/`, (req, res) => {
  fs.access(`./uploads/answer`, (error) => {
    if (error) {
      fsPromises.mkdir(`./uploads/answer`, { recursive: true }, (error) =>
        error
          ? console.log(error)
          : console.log(
              "Necessary directory and sub-directories created successfully"
            )
      );
    }
  });
  if (req.files === null || req.files === undefined) {
    res.json({ noFile: true });
    return;
  }

  postHandler(req, "answer");
  res.send(
    `answer sheet(s) uploaded successfully! Check answer folder in the project's uploads directory`
  );
});

app.get(`/viewText`, async (req, res) => {
  const answerReadResult = await readOperation(`${__dirname}\\uploads\\answer`);
  // console.log("answerReadResult", answerReadResult);

  const run = async () => {
    try {
      await client.connect();
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const col = db.collection("text");

      let answerDocument = {
        readText: answerReadResult[0],
      };

      const answerDoc = await col.insertOne(answerDocument);
      // console.log("answerDoc: ", answerDoc);
      const myDoc = await col.findOne();
      // console.log("documents in collection: ", myDoc);
      res.send(myDoc.readText);
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  };
  run().catch(console.dir);
});

app.post(`/viewText`, async (req, res) => {
  // run google sheet post request here
  console.log("req:", req);
  console.log("res:", res);
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

// function to extract identifiable text from image. takes image path as argument
const getTextFromImage = async (imagePath) => {
  const STATUS_SUCCEEDED = "succeeded";
  const STATUS_FAILED = "failed";
  const STATUS_RUNNING = "running";

  console.log(`Reading local image for text in ...${path.basename(imagePath)}`);

  const streamResponse = await computerVisionClient
    .readInStream(() => createReadStream(imagePath))
    .then((response) => response)
    .catch((err) => {
      console.error(err);
      throw err;
    });

  // Get operation location from response, so you can get the operation ID.
  const operationLocationLocal = streamResponse.operationLocation;
  // Get the operation ID at the end of the URL
  const operationIdLocal = operationLocationLocal.substring(
    operationLocationLocal.lastIndexOf("/") + 1
  );
  // Wait for the read operation to finish, use the operationId to get the result.
  while (true) {
    const readOpResult = await computerVisionClient
      .getReadResult(operationIdLocal)
      .then((result) => result);
    console.log("Read status: " + readOpResult.status);

    if (readOpResult.status === STATUS_FAILED) {
      console.log("The Read File operation has failed.");
      break;
    }
    if (readOpResult.status === STATUS_SUCCEEDED) {
      console.log("The Read File operation was a success.");
      // console.log();
      // console.log("Read File local image result:");
      // Print the text captured
      for (const textRecResult of readOpResult.analyzeResult.readResults) {
        for (const line of textRecResult.lines) {
          textArray.push(line.text);
        }
        completeText = textArray.join(" ");
        // console.log(completeText);
      }
      break;
    }
    await sleep(1000);
  }
  return textArray;
};

// function to extract key phrases from provided text string
const keyPhraseExtraction = async (client, keyPhrasesInput) => {
  try {
    const keyPhraseResult = await client.extractKeyPhrases(keyPhrasesInput);

    keyPhraseResult.forEach((document) => {
      console.log(`ID: ${document.id}`);
      console.log(`\tDocument Key Phrases: ${document.keyPhrases}`);
      extracted.push(document.keyPhrases);
    });
  } catch (e) {
    console.log(e);
  }
  return extracted;
};

const readOperation = async (path) => {
  let files;
  try {
    files = await fsPromises.readdir(path);
  } catch (err) {
    console.log(err);
    throw err;
  }
  return Promise.all(
    files.map(async (file) => {
      try {
        const results = await getTextFromImage(
          `${__dirname}\\uploads\\answer\\${file}`
        );
        return results;
      } catch (err) {
        console.error(err);
        throw err;
      }
    })
  );
};

const keyPhraseExtractor = async (dataFromReadOperation) => {
  try {
    const data = await keyPhraseExtraction(
      textAnalyticsClient,
      dataFromReadOperation
    );
    console.log("data inside keyPhraseExtractor: ", data);
    return data;
  } catch (err) {
    console.error(err);
  }
};
