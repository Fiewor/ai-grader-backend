const { AnswerSheet, MarkSheet } = require("../models/textModel");

// @desc    Get all text
// @route   GET /api/texts
// @access  Public
const getAllDocs = async (req, res) => {
  try {
    // extract all documents from DB
    const answerDoc = await AnswerSheet.find({}, { page: { fileName: 1 } });
    const markDoc = await MarkSheet.find({}, { page: { fileName: 1 } });

    // const doc = await AnswerSheet.find(
    //   { user: req.user.id },
    //   { page: { fileName: 1 } } //projection
    // );

    // ! Check if answerDoc and markDoc are non-empty in DB
    // if(!answerDoc) answerDoc = ['no']
    res.send({ answerDoc, markDoc });
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = { getAllDocs };
