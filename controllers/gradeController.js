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
const grader = require("../scripts/grading");

// @desc    Get grades
// @route   GET /api/viewGrade
// @access  Public
const getGrades = async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to database");
    // get page from db - later, filter by page id
    const answerCol = client.db("textExtract").collection("answerSheet");
    const markCol = client.db("textExtract").collection("markSheet");

    const answerDoc = await answerCol.findOne();
    const markDoc = await markCol.findOne();

    if (answerDoc) {
      console.log("got to answerDoc");
      if (markDoc) {
        console.log("got to markDoc");
        const gradeForPage = await grader(answerDoc, markDoc);
        const {
          arr,
          totalScore: score,
          totalPointsAwardable: total,
        } = gradeForPage;
        res.send({
          arr,
          grade: score,
          totalPoints: total,
        });
      } else {
        ("Couldn't find mark document in database");
      }
    } else {
      console.log("Couldn't find answer document in database");
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
};

module.exports = { getGrades };
