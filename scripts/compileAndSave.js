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

const { keyPhraseExtraction, getTextFromImage } = require("./textAnalytics");

// extract text and keyPhrase and format as object to be saved in mongoDB
const textAndPhraseCompile = async (path) => {
  const { joinedArray, textArray } = await getTextFromImage(path); // returns lines of read text
  let segmentArray = [];

  for (const line of joinedArray) {
    let currentPhrase = await keyPhraseExtraction([line]);

    let textSegment = {
      id: joinedArray.indexOf(line),
      text: line,
      phrases: currentPhrase.flat(),
    };

    segmentArray.push(textSegment);
  }
  return { segmentArray, textArray };
};

const compileAndSave = async (fileName, path, doc) => {
  let { segmentArray, textArray: rawText } = await textAndPhraseCompile(path);
  console.log("segmentArray", segmentArray);

  if (
    segmentArray === undefined ||
    (segmentArray[0].text === undefined && segmentArray[0].phrases.length === 0)
  ) {
    console.log("Error: There is no data to save");
  } else {
    try {
      await client.connect();
      console.log("Connected correctly to database");
      const db = client.db("textExtract");
      const col = db.collection(doc);

      data = {
        page: { fileName, rawText, textByNumber: segmentArray },
      };

      await col.insertOne(data);
      const myDoc = await col.findOne();
      if (myDoc) {
        console.log("Document saved successfully");
        saveStatus = true;
      } else {
        throw new Error("An error occured while attempting to save document");
      }
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
    return saveStatus;
  }
};

module.exports = { compileAndSave, textAndPhraseCompile };
