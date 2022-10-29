const { default: mongoose } = require("mongoose");
const { AnswerSheet, MarkSheet } = require("../models/textModel");

// @desc    Get all documents
// @route   GET /api/viewGrade
// @access  Public
const getAllDocs = async (req, res) => {
  try {
    // extract all documents from DB
    let answerDoc = await AnswerSheet.find({}, { page: { fileName: 1 } });
    let markDoc = await MarkSheet.find({}, { page: { fileName: 1 } });

    // const doc = await AnswerSheet.find(
    //   { user: req.user.id },
    //   { page: { fileName: 1 } } //projection
    // );

    // ! Check if answerDoc and markDoc are non-empty in DB
    if (!answerDoc)
      answerDoc = [
        {
          page: {
            rawText: [],
            fileName: "empty document",
            textByNumber: [],
          },
          _id: "h3re1sn0th1ngh3ret0s3eb8",
        },
      ];
    if (!markDoc.length)
      markDoc = [
        {
          page: {
            rawText: [],
            fileName: "empty document",
            textByNumber: [],
          },
          _id: "th3re1sn0th1ngh3ret0s3eb8",
        },
      ];
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
  const deleteStatus =
    doc === "answerSheet"
      ? await AnswerSheet.findByIdAndDelete(id)
      : await MarkSheet.findByIdAndDelete(id);
  if (!deleteStatus) {
    res.status(400);
    throw new Error("Doc not found");
  }
  res.status(200).json({ message: `Deleted doc ${id}` });
};

module.exports = { getAllDocs, deleteDoc };
