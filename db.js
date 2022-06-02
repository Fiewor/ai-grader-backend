// using local Mongo server
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/textExtract");
const Text = require("./Text"); //check Text.js for schema definition
const db = async () => {
  try {
    const text = new Text({
      readText: completeText,
    });
    text.keyPhrases.push(...markKeyPhrase.flat());
    await text.save();
    console.log("saved data: ", text);
  } catch (e) {
    console.log(e.message);
  }
};
// db();

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
      readText: completeText,
      keyPhrases: markKeyPhrase,
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

// saveOperation

// .then(() => {
// async function run() {
//   try {
//     await client.connect();
//     console.log("Connected correctly to server");
//     const db = client.db(dbName);
//     const col = db.collection("text");
//     let textDocument = {
//       readText: completeText,
//     };
//     textDocument.keyPhrases.push(...markKeyPhrase.flat());
//     const p = await col.insertOne(textDocument);
//   } catch (err) {
//     console.log(err.stack);
//   }
// finally {
//   await client.close();
// }
// }
// run().catch(console.dir);
// })

// const answerReadResult = await readOperation(`${__dirname}\\uploads\\answer`);
// const answerKeyPhrase = await keyPhraseExtractor(answerReadResult);
// const markReadResult = await readOperation(`${__dirname}\\uploads\\mark`);
// const markKeyPhrase = await keyPhraseExtractor(markReadResult);
