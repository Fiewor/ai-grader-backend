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
      readText: completeText,
      keyPhrases: markKeyPhrase,
      //   name: { first: "Alan", last: "Turing" },
      //   birth: new Date(1912, 5, 23), // June 23, 1912
      //   death: new Date(1954, 5, 7), // June 7, 1954
      //   contribs: ["Turing machine", "Turing test", "Turingery"],
      //   views: 1250000,
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

// for local mongodb server
// export default main;

// for atlas
// export default run
