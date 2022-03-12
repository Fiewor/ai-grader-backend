// using local Mongo server
const mongoose = require("mongoose");
module.exports = async function main(value) {
  await mongoose.connect("mongodb://localhost:27017/textExtract");

  const textSchema = new mongoose.Schema({
    // readText: String,
    keyPhrases: String,
  });
  const Text = mongoose.model("Text", textSchema);

  const text = new Text({
    // readText: completeText,
    keyPhrases: value,
  });

  await text.save();

  const result = Text.findOne();
  console.log("saved data", result);
};
// main()

// using Mongo Atlas
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://john:${process.env.MONGODB_ATLAS_KEY}@grader.pxgmt.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbName = "textExtract";
async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    // Use the collection "text"
    const col = db.collection("text");
    // Construct a document
    let textDocument = {
      id: Number,
      // ?  use a Map()
      pages: [
        {
          readText: String,
          keyPhrases: [String],
        },
      ],
    };
    // Insert a single document, wait for promise so we can read it back
    const p = await col.insertOne(textDocument);
    // Find one document
    const myDoc = await col.findOne();
    // Print to the console
    console.log(myDoc);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
// run().catch(console.dir);

// db save code that was formerly in .then() of readOperation()

// using mongoose for local MongoDB server
// const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/textExtract");

const db = async () => {
  try {
    const text = new Text({
      readText: completeText,
    });
    text.keyPhrases.push(...markKeyPhrase[0]); // ! TODO: fix to push all key phrases, not just the first
    await text.save();
    console.log("saved data: ", text);
  } catch (e) {
    console.log(e.message);
  }
};
db();

async function run(docName) {
  let count = 0;
  try {
    const db = client.db(dbName);
    // Use the collection "text"
    const col = db.collection("text");
    // Construct a document
    docName = {
      // ?  use Map() i.e. hashMap
      // pages: new Map([
      //   [
      //     "page",
      //     { readText: completeText, keyPhrases: [...markKeyPhrase] },
      //   ],
      // ]),
      pages: [
        {
          readText: completeText,
          keyPhrases: [...markKeyPhrase],
        },
      ],
    };
    // Insert a single document, wait for promise so we can read it back
    const p = await col.insertOne(docName);
    // Find one document
    const myDoc = await col.findOne();
    // Print to the console
    console.log(myDoc);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
