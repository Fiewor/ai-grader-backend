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
const uri = process.env.NODE_ENV === "production" ? `mongodb+srv://john:${process.env.MONGODB_ATLAS_KEY}@grader.pxgmt.mongodb.net/test?retryWrites=true&w=majority` : `mongodb://localhost:27017`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbName = "textExtract";

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
});

app.get('/viewGrade', async (req, res) => {
  const answerReadResult = await readOperation(`${__dirname}\\uploads\\answer`);
  const markReadResult = await readOperation(`${__dirname}\\uploads\\mark`);

})

app.get(`/viewText`, async (req, res) => {
  const answerReadResult = await readOperation(`${__dirname}\\uploads\\answer`);
  const markReadResult = await readOperation(`${__dirname}\\uploads\\mark`);
  let segmentArray = []

  // seperate answerReadResult by delimiters e.g 1, a, i, \n
  const answerReadArray = [...answerReadResult.split(/\b(\d|\w|i)?[.|)|]]\b/gi)];

  // this would only work for answer sheet containing one line per answer
  answerReadResult.forEach(lineInAnswer => {

    const phrase = await keyPhraseExtractor(lineInAnswer)
    //   const run = async () => {}
    //   run().catch(console.dir);

    let textSegment = {
      _id: answerReadResult.indexOf(lineInAnswer),
      text: lineInAnswer,
      phrases: phrase,
    }

    segmentArray.push(textSegment)
  })

  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("textExtract");
    const col = db.collection("text");

    let answerDocument = {
      page: segmentArray
    };

    const answerDoc = await col.insertOne(answerDocument);
    const myDoc = await col.findOne();
    console.log(myDoc)
    res.send(myDoc);
  } catch(err){
    console.log(err.stack)
  } finally {
    await client.close();
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

// function to extract identifiable text from image. takes image path as argument
const getTextFromImage = async (imagePath) => {
  const STATUS_SUCCEEDED = "succeeded";
  const STATUS_FAILED = "failed";
  let textArray = [],
    completeText;

  console.log(`Reading local image for text in ...${path.basename(imagePath)}`);

  const streamResponse = await computerVisionClient
    .readInStream(() => createReadStream(imagePath))
    .then((response) => response)
    .catch((err) => console.error(err));

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
      console.log();
      console.log("Read File local image result:");
      // Print the text captured
      for (const textRecResult of readOpResult.analyzeResult.readResults) {
        for (const line of textRecResult.lines) {
          textArray.push(line.text);
        }
        completeText = textArray.join(" ");
        console.log(completeText);
      }
      break;
    }
    await sleep(1000);
  }
  return textArray;
};

// function to extract key phrases from provided text string
const keyPhraseExtraction = async (client, keyPhrasesInput) => {
  let extracted = [];
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
  let section = /$[\\w]{1,}/g.test(path);
  return Promise.all(
    files.map(async (file) => {
      try {
        const results = await getTextFromImage(
          `${__dirname}\\uploads\\${path.substr(
            path.lastIndexOf(`\\`) + 1
          )}\\${file}`
        );
        return results;
      } catch (err) {
        console.error(err);
        // throw err;
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
