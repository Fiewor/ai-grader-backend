const { AnswerSheet, MarkSheet } = require("../models/textModel");

// @desc    Get all documents
// @route   GET /api/viewGrade
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

// @desc    Delete specific text
// @route   DELETE /api/viewGrade/:doc/:id
// @access  Public
const deleteDoc = async (req, res) => {
  const { doc, id } = req.params;
  const file =
    (await doc) === "answerSheet"
      ? AnswerSheet.findById(id)
      : MarkSheet.findById(id);
  if (!file) {
    res.status(400);
    throw new Error("Doc not found");
  }
  file.remove();
  res.status(200).json({ message: `Deleted doc ${id}` });
};

module.exports = { getAllDocs, deleteDoc };
