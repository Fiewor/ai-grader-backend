// logic for compiling text and keyphrases from uploaded page and saving in mongoDB document
// using Mongo Atlas
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

const { keyPhraseExtraction, readOperation } = require("./textAnalytics");

// extract text and keyPhrase and format as object to be saved in mongoDB
const textAndPhraseCompile = async (path) => {
  let segmentArray = [];
  const result = await readOperation(path); // returns lines of read text
  const data = result.flat();

  for (const line of data) {
    let currentPhrase = await keyPhraseExtraction([line]);

    let textSegment = {
      id: data.indexOf(line),
      text: line,
      phrases: currentPhrase.flat(),
    };
    console.log("textSegment", textSegment);

    segmentArray.push(textSegment);
  }
  return segmentArray;
};

const compileAndSave = async (path, doc) => {
  let compileReceive = await textAndPhraseCompile(path);
  console.log("compileReceive", compileReceive);

  if (
    compileReceive.length === 0 ||
    (compileReceive[0].text === undefined &&
      compileReceive[0].phrases.length === 0)
  ) {
    console.log("Error: There is no data to save");
  } else {
    try {
      await client.connect();
      console.log("Connected correctly to database");
      const db = client.db("textExtract");
      const col = db.collection(doc);

      data = {
        page: compileReceive,
      };

      await col.insertOne(data);
      const myDoc = await col.findOne();
      if (myDoc) {
        console.log("Document saved successfully");
      } else {
        throw new Error("An error occured while attempting to save document");
      }
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  }
};

module.exports = { compileAndSave, textAndPhraseCompile };
