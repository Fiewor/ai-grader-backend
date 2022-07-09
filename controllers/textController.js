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

// @desc    Get all text
// @route   GET /api/texts
// @access  Public
const getAllText = async (req, res) => {
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
};

// @desc    Get text with Id
// @route   GET /api/texts/:id
// @access  Public
const getTextWithId = async (req, res) => {
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
};

module.exports = { getAllText, getTextWithId };
