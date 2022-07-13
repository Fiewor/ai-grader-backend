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
const { AnswerSheet, MarkSheet, Text } = require("../models/textModel");

// @desc    Get grades
// @route   GET /api/viewGrade
// @access  Public
const getGrades = async (req, res) => {
  try {
    // get page from db - later, filter by page id

    const answerDoc = await AnswerSheet.findOne();
    const markDoc = await MarkSheet.findOne();

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
