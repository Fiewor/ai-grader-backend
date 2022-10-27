const grader = require("../scripts/grading");
const { AnswerSheet, MarkSheet } = require("../models/textModel");

// @desc    Get grades
// @route   GET /api/viewGrade
// @access  Public
const getGrades = async (req, res) => {
  let { markId, answerId } = req.query;
  try {
    //* get page from db - later, filter by user id using `.find({user: req.user.id})` instead of just`.findById()`

    const answerDoc = await AnswerSheet.findById(answerId);
    const markDoc = await MarkSheet.findById(markId);
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
        console.log(
          "Couldn't find mark document in database. Did you upload a marking guide?"
        );
      }
    } else {
      console.log(
        "Couldn't find answer document in database. Did you upload an answer sheet?"
      );
    }
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = { getGrades };
